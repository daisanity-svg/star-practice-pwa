-- 星見練習本｜指定獎勵卡功能
-- 用途：家長可指定下一次完成練習後要獲得哪一張卡。
-- 請在 Supabase SQL Editor 執行一次。

create table if not exists scheduled_rewards (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  card_id uuid not null references cards(id) on delete cascade,
  reward_pack_id uuid references reward_packs(id) on delete set null,
  reason text not null default '爸爸指定獎勵',
  starts_on date default current_date,
  expires_on date default current_date,
  is_claimed boolean not null default false,
  claimed_at timestamptz,
  claimed_practice_record_id uuid references practice_records(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_scheduled_rewards_pending
  on scheduled_rewards(is_claimed, starts_on, expires_on, created_at);

create index if not exists idx_scheduled_rewards_child
  on scheduled_rewards(child_id, is_claimed, created_at);
