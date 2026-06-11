-- 星見練習本｜Supabase schema v1
-- Run this in Supabase SQL Editor after creating a free Supabase project.

create extension if not exists "pgcrypto";

-- =====================================================
-- Enums
-- =====================================================
do $$ begin
  create type learning_item_type as enum (
    'english_uppercase',
    'english_lowercase',
    'english_word',
    'bopomofo_initial',
    'bopomofo_final',
    'bopomofo_compound',
    'bopomofo_tone',
    'bopomofo_combo'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type practice_mode as enum (
    'intro',
    'choice',
    'listening',
    'tracing',
    'recall',
    'sorting'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type rarity_type as enum ('common', 'rare', 'super_rare', 'legendary');
exception when duplicate_object then null;
end $$;

-- =====================================================
-- Core profile
-- =====================================================
create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  birthday date,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- =====================================================
-- Learning content
-- =====================================================
create table if not exists learning_items (
  id uuid primary key default gen_random_uuid(),
  type learning_item_type not null,
  content text not null,
  display_text text not null,
  audio_url text,
  trace_image_url text,
  stroke_order_data jsonb,
  difficulty int not null default 1 check (difficulty between 1 and 5),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(type, content)
);

create table if not exists learning_memory_hooks (
  id uuid primary key default gen_random_uuid(),
  learning_item_id uuid not null references learning_items(id) on delete cascade,
  keyword text not null,
  sentence text,
  image_url text,
  audio_url text,
  is_primary boolean not null default false,
  difficulty_level int not null default 1 check (difficulty_level between 1 and 5),
  usage_stage text not null default 'intro',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists question_templates (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  practice_mode practice_mode not null,
  template_text text not null,
  instruction_audio_text text,
  answer_mode text not null default 'single_choice',
  difficulty_level int not null default 1 check (difficulty_level between 1 and 5),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists daily_learning_plan (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  date date not null,
  new_item_count int not null default 3,
  review_item_count int not null default 4,
  weakness_item_count int not null default 3,
  total_required_questions int not null default 10,
  reward_pack_id uuid,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(child_id, date)
);

create table if not exists generated_questions (
  id uuid primary key default gen_random_uuid(),
  daily_learning_plan_id uuid not null references daily_learning_plan(id) on delete cascade,
  child_id uuid not null references children(id) on delete cascade,
  learning_item_id uuid not null references learning_items(id) on delete cascade,
  memory_hook_id uuid references learning_memory_hooks(id) on delete set null,
  question_template_id uuid references question_templates(id) on delete set null,
  question_text text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer jsonb not null,
  order_index int not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- =====================================================
-- Practice records and progress
-- =====================================================
create table if not exists practice_records (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  practice_type text not null default 'daily',
  total_questions int not null default 0,
  correct_count int not null default 0,
  wrong_count int not null default 0,
  completed boolean not null default false,
  completed_at timestamptz,
  reward_claimed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists practice_attempts (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  learning_item_id uuid not null references learning_items(id) on delete cascade,
  memory_hook_id uuid references learning_memory_hooks(id) on delete set null,
  practice_record_id uuid references practice_records(id) on delete cascade,
  generated_question_id uuid references generated_questions(id) on delete set null,
  practice_mode practice_mode not null,
  is_correct boolean not null default false,
  score numeric(5,2) not null default 0,
  time_spent_seconds int not null default 0,
  mistake_type text,
  answered_at timestamptz not null default now()
);

create table if not exists child_learning_progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  learning_item_id uuid not null references learning_items(id) on delete cascade,
  total_attempts int not null default 0,
  correct_attempts int not null default 0,
  wrong_attempts int not null default 0,
  accuracy_rate numeric(5,2) not null default 0,
  mastery_level int not null default 0 check (mastery_level between 0 and 5),
  consecutive_correct int not null default 0,
  consecutive_wrong int not null default 0,
  last_practiced_at timestamptz,
  last_wrong_at timestamptz,
  next_review_at timestamptz,
  is_weakness boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(child_id, learning_item_id)
);

-- =====================================================
-- Card and reward system
-- =====================================================
create table if not exists card_series (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cover_image_url text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists card_categories (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references card_series(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique(series_id, name)
);

create table if not exists card_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  background_style jsonb not null default '{}'::jsonb,
  frame_style jsonb not null default '{}'::jsonb,
  title_position jsonb not null default '{}'::jsonb,
  rarity_badge_style jsonb not null default '{}'::jsonb,
  number_position jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references card_series(id) on delete cascade,
  category_id uuid references card_categories(id) on delete set null,
  name text not null,
  card_no text,
  rarity rarity_type not null default 'common',
  source_image_url text,
  rendered_card_image_url text,
  template_id uuid references card_templates(id) on delete set null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists reward_packs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean not null default true,
  draw_type text not null default 'daily',
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

alter table daily_learning_plan
  add constraint daily_learning_plan_reward_pack_fk
  foreign key (reward_pack_id) references reward_packs(id) on delete set null;

create table if not exists reward_pack_items (
  id uuid primary key default gen_random_uuid(),
  reward_pack_id uuid not null references reward_packs(id) on delete cascade,
  card_id uuid not null references cards(id) on delete cascade,
  stock int not null default 1 check (stock >= 0),
  weight int not null default 10 check (weight >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(reward_pack_id, card_id)
);

create table if not exists child_card_inventory (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  card_id uuid not null references cards(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  obtained_at timestamptz not null default now(),
  obtained_from_pack_id uuid references reward_packs(id) on delete set null,
  obtained_from_practice_record_id uuid references practice_records(id) on delete set null,
  unique(child_id, card_id)
);

create table if not exists reward_draw_logs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  reward_pack_id uuid not null references reward_packs(id) on delete cascade,
  card_id uuid not null references cards(id) on delete cascade,
  draw_time timestamptz not null default now(),
  practice_record_id uuid references practice_records(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists reward_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rule_type text not null,
  condition_config jsonb not null default '{}'::jsonb,
  reward_pack_id uuid references reward_packs(id) on delete set null,
  bonus_draw_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  event_type text not null default 'theme_week',
  start_date date,
  end_date date,
  reward_pack_id uuid references reward_packs(id) on delete set null,
  banner_text text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =====================================================
-- Indexes
-- =====================================================
create index if not exists idx_learning_items_type_active on learning_items(type, is_active);
create index if not exists idx_memory_hooks_item_active on learning_memory_hooks(learning_item_id, is_active);
create index if not exists idx_generated_questions_plan on generated_questions(daily_learning_plan_id, order_index);
create index if not exists idx_practice_attempts_child_item on practice_attempts(child_id, learning_item_id, answered_at desc);
create index if not exists idx_progress_child_weakness on child_learning_progress(child_id, is_weakness, next_review_at);
create index if not exists idx_reward_pack_items_pack_stock on reward_pack_items(reward_pack_id, stock, is_active);
create index if not exists idx_inventory_child on child_card_inventory(child_id, obtained_at desc);

-- =====================================================
-- Helper function: upsert progress after an attempt
-- =====================================================
create or replace function update_learning_progress_after_attempt()
returns trigger as $$
declare
  current_progress child_learning_progress%rowtype;
  new_total int;
  new_correct int;
  new_wrong int;
  new_accuracy numeric(5,2);
  new_mastery int;
  new_consecutive_correct int;
  new_consecutive_wrong int;
  review_days int;
begin
  select * into current_progress
  from child_learning_progress
  where child_id = new.child_id and learning_item_id = new.learning_item_id;

  if not found then
    insert into child_learning_progress (child_id, learning_item_id)
    values (new.child_id, new.learning_item_id)
    returning * into current_progress;
  end if;

  new_total := current_progress.total_attempts + 1;
  new_correct := current_progress.correct_attempts + case when new.is_correct then 1 else 0 end;
  new_wrong := current_progress.wrong_attempts + case when new.is_correct then 0 else 1 end;
  new_accuracy := round((new_correct::numeric / greatest(new_total, 1)) * 100, 2);

  if new.is_correct then
    new_consecutive_correct := current_progress.consecutive_correct + 1;
    new_consecutive_wrong := 0;
    new_mastery := least(5, current_progress.mastery_level + case when new_consecutive_correct >= 2 then 1 else 0 end);
  else
    new_consecutive_correct := 0;
    new_consecutive_wrong := current_progress.consecutive_wrong + 1;
    new_mastery := greatest(0, current_progress.mastery_level - case when new_consecutive_wrong >= 2 then 1 else 0 end);
  end if;

  review_days := case
    when new_mastery <= 1 then 1
    when new_mastery = 2 then 2
    when new_mastery = 3 then 4
    when new_mastery = 4 then 7
    else 14
  end;

  update child_learning_progress
  set
    total_attempts = new_total,
    correct_attempts = new_correct,
    wrong_attempts = new_wrong,
    accuracy_rate = new_accuracy,
    mastery_level = new_mastery,
    consecutive_correct = new_consecutive_correct,
    consecutive_wrong = new_consecutive_wrong,
    last_practiced_at = new.answered_at,
    last_wrong_at = case when new.is_correct then current_progress.last_wrong_at else new.answered_at end,
    next_review_at = new.answered_at + make_interval(days => review_days),
    is_weakness = (new_accuracy < 70 or new_consecutive_wrong >= 2),
    updated_at = now()
  where child_id = new.child_id and learning_item_id = new.learning_item_id;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_update_learning_progress_after_attempt on practice_attempts;
create trigger trg_update_learning_progress_after_attempt
after insert on practice_attempts
for each row execute function update_learning_progress_after_attempt();

-- =====================================================
-- RLS placeholder
-- =====================================================
-- For a private family app, you may keep RLS disabled during local development.
-- Before public deployment, enable RLS and add policies for authenticated parent users.
