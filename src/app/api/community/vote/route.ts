import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { post_id } = await request.json()
    if (!post_id) return NextResponse.json({ error: 'post_id required' }, { status: 400 })

    const { data: post } = await supabase
      .from('community_posts')
      .select('upvotes')
      .eq('id', post_id)
      .single()

    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    await supabase
      .from('community_posts')
      .update({ upvotes: (post.upvotes || 0) + 1 })
      .eq('id', post_id)

    return NextResponse.json({ success: true, upvotes: (post.upvotes || 0) + 1 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
