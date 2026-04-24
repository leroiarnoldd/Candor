export type UserType = 'candidate' | 'company'
export type AvailabilityStatus = 'open' | 'passive' | 'closed'
export type PitchStatus = 'sent' | 'read' | 'accepted' | 'declined' | 'interview' | 'offered' | 'hired' | 'withdrawn' | 'expired'
export type TransactionType = 'pitch_read' | 'pitch_feedback' | 'hire_payment' | 'community_answer' | 'office_hours' | 'case_study' | 'sponsored_problem' | 'expert_session' | 'withdrawal' | 'refund'
export type NotificationType = 'new_pitch' | 'pitch_accepted' | 'pitch_declined' | 'hire_confirmed' | 'payment_received' | 'payment_ready' | 'ghosting_warning' | 'profile_view' | 'system'
export type CompanyPlan = 'none' | 'starter' | 'growth' | 'enterprise'
export type RemotePolicy = 'remote' | 'hybrid' | 'office' | 'flexible'
export type EmploymentType = 'full-time' | 'part-time' | 'freelance' | 'contract'
export type DeclineReason = 'salary_too_low' | 'role_not_right' | 'culture_concerns' | 'timing' | 'other'

export interface User {
  id: string
  email: string
  user_type: UserType
  created_at: string
  updated_at: string
  email_verified: boolean
  onboarding_complete: boolean
}

export interface CandidateProfile {
  id: string
  user_id: string
  display_name?: string
  anonymous_name: string
  avatar_url?: string
  location?: string
  remote_only: boolean
  current_title?: string
  years_experience?: number
  skills: string[]
  bio?: string
  salary_floor: number
  salary_currency: string
  availability: AvailabilityStatus
  notice_period?: string
  employment_types: EmploymentType[]
  is_anonymous: boolean
  blocked_domains: string[]
  blocked_companies: string[]
  profile_completeness: number
  reputation_score: number
  verified_skills: string[]
  wallet_balance: number
  total_earned: number
  is_pro: boolean
  is_expert: boolean
  expert_rate?: number
  created_at: string
  updated_at: string
}

export interface WorkExperience {
  id: string
  candidate_id: string
  company_name: string
  title: string
  start_date: string
  end_date?: string
  is_current: boolean
  description?: string
  outcomes?: string[]
  skills_used?: string[]
  created_at: string
}

export interface CompanyProfile {
  id: string
  user_id: string
  company_name: string
  logo_url?: string
  website?: string
  description?: string
  companies_house_number?: string
  director_name?: string
  is_verified: boolean
  verified_at?: string
  size_range?: string
  industry?: string
  founded_year?: number
  office_locations?: string[]
  remote_policy?: RemotePolicy
  culture_description?: string
  culture_score: number
  salary_accuracy_score: number
  response_time_avg?: number
  hire_rate: number
  ghosting_incidents: number
  is_candor_verified: boolean
  plan: CompanyPlan
  pitch_credits: number
  plan_started_at?: string
  plan_renews_at?: string
  is_active: boolean
  is_banned: boolean
  ban_reason?: string
  warnings: number
  created_at: string
  updated_at: string
}

export interface Pitch {
  id: string
  company_id: string
  candidate_id: string
  role_title: string
  salary_min: number
  salary_max?: number
  salary_currency: string
  employment_type?: EmploymentType
  location?: string
  remote_policy?: string
  pitch_message: string
  hiring_manager_name: string
  hiring_manager_title?: string
  status: PitchStatus
  sent_at: string
  read_at?: string
  responded_at?: string
  interview_at?: string
  hired_at?: string
  hire_confirmed_candidate: boolean
  hire_confirmed_company: boolean
  hire_confirmed_at?: string
  hire_payment_released: boolean
  read_payment_sent: boolean
  feedback_payment_sent: boolean
  hire_payment_sent: boolean
  decline_reason?: DeclineReason
  decline_feedback?: string
  created_at: string
  updated_at: string
  // Joined data
  company?: CompanyProfile
  candidate?: CandidateProfile
}

export interface WalletTransaction {
  id: string
  user_id: string
  candidate_id?: string
  amount: number
  type: TransactionType
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  pitch_id?: string
  description?: string
  stripe_transfer_id?: string
  created_at: string
  completed_at?: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  action_url?: string
  created_at: string
}

export interface CommunityRoom {
  id: string
  name: string
  slug: string
  description?: string
  required_skill?: string
  member_count: number
  expert_count: number
  is_active: boolean
  created_at: string
}

export interface CommunityPost {
  id: string
  room_id: string
  author_id: string
  candidate_id?: string
  type: 'question' | 'answer' | 'sponsored_problem' | 'case_study' | 'discussion'
  title?: string
  content: string
  prize_amount?: number
  prize_currency?: string
  sponsor_company_id?: string
  problem_deadline?: string
  problem_winner_id?: string
  problem_closed: boolean
  upvotes: number
  expert_score: number
  is_top_answer: boolean
  parent_id?: string
  is_published: boolean
  created_at: string
  updated_at: string
}

// Utility types
export interface Database {
  public: {
    Tables: {
      users: { Row: User; Insert: Partial<User>; Update: Partial<User> }
      candidate_profiles: { Row: CandidateProfile; Insert: Partial<CandidateProfile>; Update: Partial<CandidateProfile> }
      company_profiles: { Row: CompanyProfile; Insert: Partial<CompanyProfile>; Update: Partial<CompanyProfile> }
      work_experience: { Row: WorkExperience; Insert: Partial<WorkExperience>; Update: Partial<WorkExperience> }
      pitches: { Row: Pitch; Insert: Partial<Pitch>; Update: Partial<Pitch> }
      wallet_transactions: { Row: WalletTransaction; Insert: Partial<WalletTransaction>; Update: Partial<WalletTransaction> }
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> }
      community_rooms: { Row: CommunityRoom; Insert: Partial<CommunityRoom>; Update: Partial<CommunityRoom> }
      community_posts: { Row: CommunityPost; Insert: Partial<CommunityPost>; Update: Partial<CommunityPost> }
    }
  }
}
