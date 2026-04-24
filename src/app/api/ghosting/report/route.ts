import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { pitch_id, incident_type } = await request.json()

    if (!pitch_id || !incident_type) {
      return NextResponse.json({ error: 'pitch_id and incident_type required' }, { status: 400 })
    }

    const validTypes = ['no_response', 'disappeared_after_accept', 'offer_rescinded']
    if (!validTypes.includes(incident_type)) {
      return NextResponse.json({ error: 'Invalid incident type' }, { status: 400 })
    }

    // Get the pitch
    const { data: pitch } = await supabase
      .from('pitches')
      .select('*, candidate:candidate_profiles(user_id)')
      .eq('id', pitch_id)
      .single()

    if (!pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
    }

    // Verify the candidate owns this pitch
    const { data: candidateProfile } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!candidateProfile || pitch.candidate_id !== candidateProfile.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
    }

    // Calculate days elapsed
    const sentDate = new Date(pitch.sent_at)
    const daysElapsed = Math.floor((Date.now() - sentDate.getTime()) / (1000 * 60 * 60 * 24))

    // Minimum threshold — can only report after 7 days of no response
    if (daysElapsed < 7 && incident_type === 'no_response') {
      return NextResponse.json({
        error: `You can only report no_response after 7 days. This pitch was sent ${daysElapsed} days ago.`
      }, { status: 400 })
    }

    // Create ghosting incident
    await supabaseAdmin
      .from('ghosting_incidents')
      .insert({
        company_id: pitch.company_id,
        pitch_id: pitch_id,
        candidate_id: candidateProfile.id,
        incident_type,
        days_elapsed: daysElapsed,
        action_taken: 'monitoring',
        is_published: false,
      })

    // Get company's current ghosting count
    const { data: company } = await supabaseAdmin
      .from('company_profiles')
      .select('ghosting_incidents, warnings, company_name, user_id')
      .eq('id', pitch.company_id)
      .single()

    if (!company) throw new Error('Company not found')

    const newCount = (company.ghosting_incidents || 0) + 1
    let newWarnings = company.warnings || 0
    let actionTaken = 'monitoring'
    let isBanned = false

    // Escalation ladder
    if (newCount >= 10) {
      // Permanent removal
      isBanned = true
      actionTaken = 'removal'

      await supabaseAdmin
        .from('company_profiles')
        .update({
          ghosting_incidents: newCount,
          is_banned: true,
          is_active: false,
          ban_reason: `Permanent removal: ${newCount} ghosting incidents.`,
        })
        .eq('id', pitch.company_id)

      // Notify company
      await supabaseAdmin.from('notifications').insert({
        user_id: company.user_id,
        type: 'ghosting_warning',
        title: 'Account removed',
        message: `Your Candor account has been permanently removed due to repeated ghosting incidents (${newCount} total). Contact support if you believe this is an error.`,
        action_url: '/dashboard/company',
      })

    } else if (newCount >= 5) {
      // Third warning — suspension warning
      newWarnings = 3
      actionTaken = 'suspension'

      await supabaseAdmin
        .from('company_profiles')
        .update({ ghosting_incidents: newCount, warnings: newWarnings })
        .eq('id', pitch.company_id)

      await supabaseAdmin.from('notifications').insert({
        user_id: company.user_id,
        type: 'ghosting_warning',
        title: 'Final warning — account at risk',
        message: `This is your final warning. You have ${newCount} ghosting incidents. One more and your account will be permanently removed from Candor.`,
        action_url: '/dashboard/company',
      })

    } else if (newCount >= 3) {
      // Second warning
      newWarnings = 2
      actionTaken = 'warning'

      await supabaseAdmin
        .from('company_profiles')
        .update({ ghosting_incidents: newCount, warnings: newWarnings })
        .eq('id', pitch.company_id)

      await supabaseAdmin.from('notifications').insert({
        user_id: company.user_id,
        type: 'ghosting_warning',
        title: 'Second warning — ghosting incidents',
        message: `You now have ${newCount} ghosting incidents on your account. At 5 incidents your account will receive a final warning. At 10 incidents your access will be permanently removed.`,
        action_url: '/dashboard/company',
      })

    } else if (newCount >= 1) {
      // First warning
      newWarnings = 1
      actionTaken = 'warning'

      await supabaseAdmin
        .from('company_profiles')
        .update({ ghosting_incidents: newCount, warnings: newWarnings })
        .eq('id', pitch.company_id)

      await supabaseAdmin.from('notifications').insert({
        user_id: company.user_id,
        type: 'ghosting_warning',
        title: 'Ghosting warning',
        message: `A ghosting incident has been recorded against your account. Respond to all candidates within 7 days of them accepting a pitch. Repeated incidents will result in removal from Candor.`,
        action_url: '/dashboard/company',
      })
    }

    // Update ghosting incident with action taken
    await supabaseAdmin
      .from('ghosting_incidents')
      .update({ action_taken: actionTaken as any })
      .eq('pitch_id', pitch_id)
      .eq('company_id', pitch.company_id)

    // Notify candidate that report was received
    await supabase.from('notifications').insert({
      user_id: session.user.id,
      type: 'system',
      title: 'Ghosting report received',
      message: `Your report has been recorded. ${company.company_name} has been notified. This incident will be included in the next Candor Transparency Report.`,
      action_url: '/dashboard/candidate',
    })

    return NextResponse.json({
      success: true,
      incident_count: newCount,
      action_taken: actionTaken,
      company_banned: isBanned,
      message: `Ghosting incident reported. ${company.company_name} now has ${newCount} incident${newCount > 1 ? 's' : ''} on record.`,
    })

  } catch (error: any) {
    console.error('Ghosting report error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
