'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import type { CommunityRoom, CommunityPost } from '@/types/database'

type TabType = 'all' | 'questions' | 'problems' | 'case_studies'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [room, setRoom] = useState<CommunityRoom | null>(null)
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabType>('all')
  const [composing, setComposing] = useState(false)
  const [postType, setPostType] = useState<'question' | 'discussion' | 'case_study'>('question')
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [answeringId, setAnsweringId] = useState<string | null>(null)
  const [answerContent, setAnswerContent] = useState('')

  useEffect(() => {
    loadRoom()
    loadUserProfile()
  }, [slug])

  async function loadRoom() {
    const { data: roomData } = await supabase
      .from('community_rooms')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!roomData) { router.push('/community'); return }
    setRoom(roomData)

    const { data: postsData } = await supabase
      .from('community_posts')
      .select('*')
      .eq('room_id', roomData.id)
      .eq('is_published', true)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .limit(30)

    if (postsData) setPosts(postsData)
    setLoading(false)
  }

  async function loadUserProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('candidate_profiles')
      .select('id, current_title, is_expert, reputation_score')
      .eq('user_id', user.id)
      .single()
    if (data) setUserProfile(data)
  }

  async function submitPost() {
    if (!room || !postContent.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setPosting(true)
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          room_id: room.id,
          author_id: user.id,
          candidate_id: userProfile?.id || null,
          type: postType,
          title: postTitle || null,
          content: postContent,
          is_published: true,
        })
        .select()
        .single()
      if (error) throw error
      if (data) setPosts(prev => [data, ...prev])
      setComposing(false)
      setPostTitle('')
      setPostContent('')
    } finally {
      setPosting(false)
    }
  }

  async function submitAnswer(parentId: string) {
    if (!room || !answerContent.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        room_id: room.id,
        author_id: user.id,
        candidate_id: userProfile?.id || null,
        type: 'answer',
        content: answerContent,
        parent_id: parentId,
        is_published: true,
      })
      .select()
      .single()
    if (!error && data) {
      setAnsweringId(null)
      setAnswerContent('')
    }
  }

  async function votePost(postId: string) {
    await fetch('/api/community/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId }),
    })
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
  }

  function timeAgo(date: string) {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }

  const filteredPosts = posts.filter(p => {
    if (tab === 'all') return true
    if (tab === 'questions') return p.type === 'question' || p.type === 'discussion'
    if (tab === 'problems') return p.type === 'sponsored_problem'
    if (tab === 'case_studies') return p.type === 'case_study'
    return true
  })

  const activeProblems = posts.filter(p => p.type === 'sponsored_problem' && !p.problem_closed)

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-w5 border-t-candor-purple rounded-full animate-spin" />
    </div>
  )

  if (!room) return null

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link href="/community" className="text-w4 text-sm hover:text-w2 transition-colors">Rooms</Link>
          <span className="text-w5 text-xs">›</span>
          <span className="text-white font-semibold text-sm">{room.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-w4 hidden sm:block">{room.member_count.toLocaleString()} members · {room.expert_count} experts</span>
          <button onClick={() => setComposing(true)} className="candor-btn-primary px-3 py-1.5 text-sm">+ Post</button>
        </div>
      </nav>

      <div className="pt-14 max-w-3xl mx-auto px-6 py-6">

        {activeProblems.length > 0 && (
          <div className="p-4 rounded-2xl bg-candor-green/10 border border-candor-green/30 mb-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-bold text-candor-green mb-0.5">
                {activeProblems.length} active sponsored problem{activeProblems.length > 1 ? 's' : ''}
              </div>
              <div className="text-xs text-candor-green/70">
                Prize pool: £{activeProblems.reduce((sum, p) => sum + ((p.prize_amount || 0) / 100), 0).toLocaleString()}
              </div>
            </div>
            <button onClick={() => setTab('problems')} className="text-xs font-bold text-candor-green border border-candor-green/30 px-3 py-1.5 rounded-lg hover:bg-candor-green/10 transition-colors">
              View →
            </button>
          </div>
        )}

        {composing && (
          <div className="candor-card p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <div className="candor-label">New post in {room.name}</div>
              <button onClick={() => setComposing(false)} className="text-w4 hover:text-w2 text-sm transition-colors">Cancel</button>
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {[{v:'question',l:'Question'},{v:'discussion',l:'Discussion'},{v:'case_study',l:'Case Study'}].map(t => (
                <button key={t.v} onClick={() => setPostType(t.v as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    postType === t.v ? 'border-candor-blue/50 bg-candor-blue/10 text-candor-blue' : 'border-white/10 bg-s2 text-w4'
                  }`}>{t.l}</button>
              ))}
            </div>
            <input
              type="text"
              value={postTitle}
              onChange={e => setPostTitle(e.target.value)}
              placeholder="Title (optional but recommended)"
              className="candor-input mb-3"
            />
            <textarea
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              placeholder={
                postType === 'question' ? "What do you want to know? Be specific." :
                postType === 'case_study' ? "Share real work with real outcomes. What was the problem, what did you do, what was the result?" :
                "Start a discussion..."
              }
              rows={4}
              className="candor-input resize-none mb-4"
              maxLength={2000}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-w5">{postContent.length}/2000</span>
              <button onClick={submitPost} disabled={posting || !postContent.trim()} className="candor-btn-primary px-5 py-2">
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-1 p-1 rounded-xl bg-s1 border border-white/10 mb-5 w-fit flex-wrap">
          {[{id:'all',l:'All'},{id:'questions',l:'Questions'},{id:'problems',l:'Problems'},{id:'case_studies',l:'Case Studies'}].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as TabType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === t.id ? 'bg-white text-black' : 'text-w4 hover:text-w2'
              }`}>{t.l}</button>
          ))}
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="text-white font-bold mb-2">No posts yet.</h3>
            <p className="text-w4 text-sm">Be the first to post in {room.name}.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map(post => (
              <div key={post.id} className={`candor-card p-5 ${
                post.type === 'sponsored_problem' ? 'border-candor-green/30 bg-candor-green/5' : ''
              }`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <PostTypeBadge type={post.type} />
                      {post.is_top_answer && <span className="green-pill text-[10px] px-1.5 py-0.5">Top Answer</span>}
                      {post.type === 'sponsored_problem' && post.prize_amount && (
                        <span className="text-xs font-bold text-candor-green">
                          £{(post.prize_amount / 100).toLocaleString()} prize
                        </span>
                      )}
                    </div>
                    {post.title && (
                      <h3 className="font-bold text-white text-base leading-snug mb-1">{post.title}</h3>
                    )}
                    <p className="text-sm text-w2 leading-relaxed line-clamp-3">{post.content}</p>
                  </div>
                </div>

                {post.type === 'sponsored_problem' && post.problem_deadline && !post.problem_closed && (
                  <div className="text-xs text-candor-amber mb-3">
                    Deadline: {new Date(post.problem_deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}

                {post.type === 'sponsored_problem' && post.problem_closed && (
                  <div className="text-xs text-w4 mb-3">Problem closed · Winner selected</div>
                )}

                <div className="flex items-center gap-4 pt-3 border-t border-white/5">
                  <button
                    onClick={() => votePost(post.id)}
                    className="flex items-center gap-1.5 text-xs text-w4 hover:text-candor-blue transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6.5 2v9M2 6.5l4.5-4.5 4.5 4.5"/>
                    </svg>
                    {post.upvotes}
                  </button>
                  <button
                    onClick={() => setAnsweringId(answeringId === post.id ? null : post.id)}
                    className="text-xs text-w4 hover:text-w2 transition-colors"
                  >
                    Reply
                  </button>
                  <span className="text-xs text-w5 ml-auto">{timeAgo(post.created_at)}</span>
                </div>

                {answeringId === post.id && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <textarea
                      value={answerContent}
                      onChange={e => setAnswerContent(e.target.value)}
                      placeholder="Write your answer..."
                      rows={3}
                      className="candor-input resize-none mb-3"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setAnsweringId(null)} className="candor-btn-secondary px-3 py-1.5 text-sm">Cancel</button>
                      <button onClick={() => submitAnswer(post.id)} disabled={!answerContent.trim()} className="candor-btn-primary px-4 py-1.5 text-sm">Post reply</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PostTypeBadge({ type }: { type: string }) {
  const config: Record<string, {l:string;c:string}> = {
    question:         { l:'Question',     c:'blue-pill' },
    discussion:       { l:'Discussion',   c:'blue-pill' },
    answer:           { l:'Answer',       c:'green-pill' },
    sponsored_problem:{ l:'Problem',      c:'green-pill' },
    case_study:       { l:'Case Study',   c:'amber-pill' },
  }
  const cfg = config[type] || { l: type, c: 'blue-pill' }
  return <span className={`${cfg.c} text-[10px] px-2 py-0.5`}>{cfg.l}</span>
}
