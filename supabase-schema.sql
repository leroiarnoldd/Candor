-- ============================================
-- CANDOR DATABASE SCHEMA
-- Run this in your Supabase SQL editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  user_type text not null check (user_type in ('candidate', 'company')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  email_verified boolean default false,
  onboarding_complete boolean default false
);

-- Row Level Security
alter table public.users enable row level security;
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- ============================================
-- CANDIDATE PROFILES
-- ============================================
create table public.candidate_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade unique,
  
  -- Identity (anonymised by default)
  display_name text, -- shown to companies after reveal
  anonymous_name text not null default 'Professional', -- shown before reveal
  avatar_url text,
  
  -- Location
  location text,
  remote_only boolean default false,
  
  -- Career
  current_title text,
  years_experience integer,
  skills text[] default '{}',
  bio text,
  
  -- Terms
  salary_floor integer not null default 0, -- in pence
  salary_currency text default 'GBP',
  availability text default 'open' check (availability in ('open', 'passive', 'closed')),
  notice_period text,
  employment_types text[] default '{}'::text[], -- full-time, part-time, freelance, contract
  
  -- Anonymity controls
  is_anonymous boolean default true,
  blocked_domains text[] default '{}', -- employer domains blocked from seeing profile
  blocked_companies uuid[] default '{}',
  
  -- Platform scores
  profile_completeness integer default 0 check (profile_completeness between 0 and 100),
  reputation_score numeric(3,1) default 0,
  verified_skills text[] default '{}',
  
  -- Wallet
  wallet_balance integer default 0, -- in pence
  total_earned integer default 0,   -- in pence lifetime
  
  -- Candor Pro
  is_pro boolean default false,
  is_expert boolean default false,
  expert_rate integer, -- hourly rate in pence
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.candidate_profiles enable row level security;
create policy "Candidates can view own profile" on public.candidate_profiles
  for select using (auth.uid() = user_id);
create policy "Candidates can update own profile" on public.candidate_profiles
  for update using (auth.uid() = user_id);
create policy "Candidates can insert own profile" on public.candidate_profiles
  for insert with check (auth.uid() = user_id);
-- Companies can see candidate profiles (anonymised) - controlled in application layer
create policy "Anyone can read candidate profiles" on public.candidate_profiles
  for select using (true);

-- ============================================
-- WORK EXPERIENCE
-- ============================================
create table public.work_experience (
  id uuid default uuid_generate_v4() primary key,
  candidate_id uuid references public.candidate_profiles(id) on delete cascade,
  company_name text not null,
  title text not null,
  start_date date not null,
  end_date date, -- null means current
  is_current boolean default false,
  description text,
  outcomes text[], -- verifiable outcomes
  skills_used text[],
  created_at timestamp with time zone default now()
);

alter table public.work_experience enable row level security;
create policy "Candidates manage own experience" on public.work_experience
  for all using (
    auth.uid() = (select user_id from public.candidate_profiles where id = candidate_id)
  );
create policy "Anyone can read work experience" on public.work_experience
  for select using (true);

-- ============================================
-- COMPANY PROFILES
-- ============================================
create table public.company_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade unique,
  
  -- Identity
  company_name text not null,
  logo_url text,
  website text,
  description text,
  
  -- Verification
  companies_house_number text,
  director_name text,
  is_verified boolean default false,
  verified_at timestamp with time zone,
  
  -- Culture
  size_range text, -- '1-10', '11-50', '51-200', '201-500', '500+'
  industry text,
  founded_year integer,
  office_locations text[],
  remote_policy text check (remote_policy in ('remote', 'hybrid', 'office', 'flexible')),
  culture_description text,
  
  -- Platform scores
  culture_score numeric(3,1) default 0,
  salary_accuracy_score numeric(3,1) default 0,
  response_time_avg integer, -- hours
  hire_rate numeric(4,1) default 0, -- percentage
  ghosting_incidents integer default 0,
  is_candor_verified boolean default false,
  
  -- Subscription
  plan text default 'none' check (plan in ('none', 'starter', 'growth', 'enterprise')),
  pitch_credits integer default 0,
  plan_started_at timestamp with time zone,
  plan_renews_at timestamp with time zone,
  
  -- Status
  is_active boolean default true,
  is_banned boolean default false,
  ban_reason text,
  warnings integer default 0,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.company_profiles enable row level security;
create policy "Companies can manage own profile" on public.company_profiles
  for all using (auth.uid() = user_id);
create policy "Anyone can read company profiles" on public.company_profiles
  for select using (true);

-- ============================================
-- PITCHES
-- ============================================
create table public.pitches (
  id uuid default uuid_generate_v4() primary key,
  
  -- Parties
  company_id uuid references public.company_profiles(id) on delete cascade,
  candidate_id uuid references public.candidate_profiles(id) on delete cascade,
  
  -- The pitch content
  role_title text not null,
  salary_min integer not null, -- in pence - MANDATORY
  salary_max integer,
  salary_currency text default 'GBP',
  employment_type text check (employment_type in ('full-time', 'part-time', 'freelance', 'contract')),
  location text,
  remote_policy text,
  pitch_message text not null,
  hiring_manager_name text not null,
  hiring_manager_title text,
  
  -- Status tracking
  status text default 'sent' check (status in (
    'sent', 'read', 'accepted', 'declined', 
    'interview', 'offered', 'hired', 'withdrawn', 'expired'
  )),
  
  -- Timestamps
  sent_at timestamp with time zone default now(),
  read_at timestamp with time zone,
  responded_at timestamp with time zone,
  interview_at timestamp with time zone,
  hired_at timestamp with time zone,
  
  -- Hire confirmation
  hire_confirmed_candidate boolean default false,
  hire_confirmed_company boolean default false,
  hire_confirmed_at timestamp with time zone,
  hire_payment_released boolean default false,
  
  -- Payments
  read_payment_sent boolean default false,     -- £2.70
  feedback_payment_sent boolean default false, -- £7.10
  hire_payment_sent boolean default false,     -- £30.00
  
  -- Decline feedback
  decline_reason text check (decline_reason in (
    'salary_too_low', 'role_not_right', 
    'culture_concerns', 'timing', 'other'
  )),
  decline_feedback text,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Ensure one pitch per company per candidate at a time
  unique(company_id, candidate_id)
);

alter table public.pitches enable row level security;
create policy "Candidates see own pitches" on public.pitches
  for select using (
    auth.uid() = (select user_id from public.candidate_profiles where id = candidate_id)
  );
create policy "Companies see own pitches" on public.pitches
  for select using (
    auth.uid() = (select user_id from public.company_profiles where id = company_id)
  );
create policy "Companies can create pitches" on public.pitches
  for insert with check (
    auth.uid() = (select user_id from public.company_profiles where id = company_id)
  );
create policy "Parties can update own pitches" on public.pitches
  for update using (
    auth.uid() = (select user_id from public.candidate_profiles where id = candidate_id)
    or auth.uid() = (select user_id from public.company_profiles where id = company_id)
  );

-- ============================================
-- REVIEWS (post hire)
-- ============================================
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  pitch_id uuid references public.pitches(id) on delete cascade unique,
  candidate_id uuid references public.candidate_profiles(id),
  company_id uuid references public.company_profiles(id),
  
  -- Scores 1-5
  salary_accuracy_score integer check (salary_accuracy_score between 1 and 5),
  communication_score integer check (communication_score between 1 and 5),
  fairness_score integer check (fairness_score between 1 and 5),
  culture_match_score integer check (culture_match_score between 1 and 5),
  overall_score integer check (overall_score between 1 and 5),
  
  -- Written review
  review_text text,
  
  -- Status
  is_published boolean default false,
  is_verified boolean default false,
  published_at timestamp with time zone,
  
  created_at timestamp with time zone default now()
);

alter table public.reviews enable row level security;
create policy "Candidates can create reviews" on public.reviews
  for insert with check (
    auth.uid() = (select user_id from public.candidate_profiles where id = candidate_id)
  );
create policy "Anyone can read published reviews" on public.reviews
  for select using (is_published = true);

-- ============================================
-- WALLET TRANSACTIONS
-- ============================================
create table public.wallet_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  candidate_id uuid references public.candidate_profiles(id),
  
  amount integer not null, -- in pence, positive = credit, negative = debit
  type text not null check (type in (
    'pitch_read',          -- £2.70
    'pitch_feedback',      -- £7.10
    'hire_payment',        -- £30.00
    'community_answer',    -- £15.00
    'office_hours',        -- £30.00
    'case_study',          -- £20.00
    'sponsored_problem',   -- variable
    'expert_session',      -- variable
    'withdrawal',          -- negative
    'refund'
  )),
  
  status text default 'pending' check (status in ('pending', 'completed', 'failed', 'cancelled')),
  
  -- Reference
  pitch_id uuid references public.pitches(id),
  description text,
  stripe_transfer_id text,
  
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

alter table public.wallet_transactions enable row level security;
create policy "Users see own transactions" on public.wallet_transactions
  for select using (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  
  type text not null check (type in (
    'new_pitch', 'pitch_accepted', 'pitch_declined',
    'hire_confirmed', 'payment_received', 'payment_ready',
    'ghosting_warning', 'profile_view', 'system'
  )),
  
  title text not null,
  message text not null,
  is_read boolean default false,
  action_url text,
  
  created_at timestamp with time zone default now()
);

alter table public.notifications enable row level security;
create policy "Users see own notifications" on public.notifications
  for all using (auth.uid() = user_id);

-- ============================================
-- COMMUNITY ROOMS
-- ============================================
create table public.community_rooms (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  required_skill text,
  member_count integer default 0,
  expert_count integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Seed the initial rooms
insert into public.community_rooms (name, slug, description, required_skill) values
  ('Senior Engineering', 'senior-engineering', 'System design, scaling, hiring, leadership. For engineers 5+ years in.', 'engineering'),
  ('Product Management', 'product-management', 'Strategy, roadmaps, stakeholder alignment, career moves.', 'product'),
  ('Design & UX', 'design-ux', 'Research, systems, craft, career progression.', 'design'),
  ('Launching Something', 'launching-something', 'For anyone building a product, company, or side project.', null),
  ('Salary Negotiation', 'salary-negotiation', 'Preparing for offer conversations. Real data. Honest scripts.', null),
  ('First-time Managers', 'first-time-managers', 'The hardest transition in your career, made easier with honest peers.', null),
  ('Data & Analytics', 'data-analytics', 'Data engineering, analysis, visualisation, and ML careers.', 'data'),
  ('Marketing & Growth', 'marketing-growth', 'Performance, brand, content, and growth strategy.', 'marketing');

-- ============================================
-- COMMUNITY POSTS
-- ============================================
create table public.community_posts (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.community_rooms(id),
  author_id uuid references public.users(id),
  candidate_id uuid references public.candidate_profiles(id),
  
  type text not null check (type in ('question', 'answer', 'sponsored_problem', 'case_study', 'discussion')),
  title text,
  content text not null,
  
  -- Sponsored problem fields
  prize_amount integer, -- in pence
  prize_currency text default 'GBP',
  sponsor_company_id uuid references public.company_profiles(id),
  problem_deadline timestamp with time zone,
  problem_winner_id uuid references public.candidate_profiles(id),
  problem_closed boolean default false,
  
  -- Scoring
  upvotes integer default 0,
  expert_score numeric(3,1) default 0,
  is_top_answer boolean default false,
  
  -- Parent (for answers)
  parent_id uuid references public.community_posts(id),
  
  is_published boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.community_posts enable row level security;
create policy "Anyone can read published posts" on public.community_posts
  for select using (is_published = true);
create policy "Authenticated users can post" on public.community_posts
  for insert with check (auth.uid() = author_id);
create policy "Authors can update own posts" on public.community_posts
  for update using (auth.uid() = author_id);

-- ============================================
-- GHOSTING REGISTER
-- ============================================
create table public.ghosting_incidents (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.company_profiles(id),
  pitch_id uuid references public.pitches(id),
  candidate_id uuid references public.candidate_profiles(id),
  
  incident_type text check (incident_type in ('no_response', 'disappeared_after_accept', 'offer_rescinded')),
  days_elapsed integer,
  action_taken text check (action_taken in ('warning', 'suspension', 'removal', 'monitoring')),
  is_published boolean default false,
  
  created_at timestamp with time zone default now()
);

alter table public.ghosting_incidents enable row level security;
create policy "Admins manage ghosting incidents" on public.ghosting_incidents
  for all using (false); -- managed via service role only

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_candidate_profile_update
  before update on public.candidate_profiles
  for each row execute procedure public.handle_updated_at();

create trigger on_company_profile_update
  before update on public.company_profiles
  for each row execute procedure public.handle_updated_at();

create trigger on_pitch_update
  before update on public.pitches
  for each row execute procedure public.handle_updated_at();

-- Handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, user_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'user_type', 'candidate')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update candidate wallet balance
create or replace function public.update_wallet_balance()
returns trigger as $$
begin
  if new.status = 'completed' and old.status != 'completed' then
    update public.candidate_profiles
    set 
      wallet_balance = wallet_balance + new.amount,
      total_earned = case when new.amount > 0 then total_earned + new.amount else total_earned end
    where id = new.candidate_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_wallet_transaction_completed
  after update on public.wallet_transactions
  for each row execute procedure public.update_wallet_balance();

-- ============================================
-- INDEXES for performance
-- ============================================
create index idx_pitches_candidate on public.pitches(candidate_id);
create index idx_pitches_company on public.pitches(company_id);
create index idx_pitches_status on public.pitches(status);
create index idx_wallet_user on public.wallet_transactions(user_id);
create index idx_notifications_user on public.notifications(user_id, is_read);
create index idx_posts_room on public.community_posts(room_id);
create index idx_candidate_skills on public.candidate_profiles using gin(skills);
