import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function Home() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signup')
  }

  // Get user type and route accordingly
  const { data: user } = await supabase
    .from('users')
    .select('user_type, onboarding_complete')
    .eq('id', session.user.id)
    .single()

  if (!user?.onboarding_complete) {
    redirect(user?.user_type === 'company' ? '/onboarding/company' : '/onboarding/candidate')
  }

  redirect(user?.user_type === 'company' ? '/dashboard/company' : '/dashboard/candidate')
}
