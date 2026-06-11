-- 星見練習本｜Seed data v1
-- Run after supabase/schema.sql.

insert into children (name, birthday)
values ('星見', '2022-08-05')
on conflict do nothing;

-- Bopomofo learning items
insert into learning_items (type, content, display_text, difficulty)
values
  ('bopomofo_initial', 'ㄅ', 'ㄅ', 1),
  ('bopomofo_initial', 'ㄆ', 'ㄆ', 1),
  ('bopomofo_initial', 'ㄇ', 'ㄇ', 1),
  ('bopomofo_initial', 'ㄈ', 'ㄈ', 1)
on conflict (type, content) do nothing;

-- English learning items
insert into learning_items (type, content, display_text, difficulty)
values
  ('english_uppercase', 'A', 'A', 1),
  ('english_uppercase', 'B', 'B', 1),
  ('english_uppercase', 'C', 'C', 1),
  ('english_uppercase', 'D', 'D', 1)
on conflict (type, content) do nothing;

-- Bopomofo memory hooks
insert into learning_memory_hooks (learning_item_id, keyword, sentence, is_primary, difficulty_level, usage_stage)
select id, '爸爸', '爸爸抱抱我', true, 1, 'intro'
from learning_items where type = 'bopomofo_initial' and content = 'ㄅ'
on conflict do nothing;

insert into learning_memory_hooks (learning_item_id, keyword, sentence, is_primary, difficulty_level, usage_stage)
select id, '拜拜', '拜拜說再見', false, 1, 'practice'
from learning_items where type = 'bopomofo_initial' and content = 'ㄅ'
on conflict do nothing;

insert into learning_memory_hooks (learning_item_id, keyword, sentence, is_primary, difficulty_level, usage_stage)
select id, '不見', '玩具不見了', false, 2, 'review'
from learning_items where type = 'bopomofo_initial' and content = 'ㄅ'
on conflict do nothing;

insert into learning_memory_hooks (learning_item_id, keyword, sentence, is_primary, difficulty_level, usage_stage)
select id, '泡泡', '泡泡飛上天', true, 1, 'intro'
from learning_items where type = 'bopomofo_initial' and content = 'ㄆ'
on conflict do nothing;

insert into learning_memory_hooks (learning_item_id, keyword, sentence, is_primary, difficulty_level, usage_stage)
select id, '蜜蜂', '蜜蜂嗡嗡叫', true, 1, 'intro'
from learning_items where type = 'bopomofo_initial' and content = 'ㄇ'
on conflict do nothing;

insert into learning_memory_hooks (learning_item_id, keyword, sentence, is_primary, difficulty_level, usage_stage)
select id, '媽媽', '媽媽抱抱我', false, 1, 'practice'
from learning_items where type = 'bopomofo_initial' and content = 'ㄇ'
on conflict do nothing;

insert into learning_memory_hooks (learning_item_id, keyword, sentence, is_primary, difficulty_level, usage_stage)
select id, '飛機', '飛機飛高高', true, 1, 'intro'
from learning_items where type = 'bopomofo_initial' and content = 'ㄈ'
on conflict do nothing;

-- English memory hooks
insert into learning_memory_hooks (learning_item_id, keyword, sentence, is_primary, difficulty_level, usage_stage)
select id, 'Apple', 'A is for Apple', true, 1, 'intro'
from learning_items where type = 'english_uppercase' and content = 'A'
on conflict do nothing;

insert into learning_memory_hooks (learning_item_id, keyword, sentence, is_primary, difficulty_level, usage_stage)
select id, 'Ant', 'A is for Ant', false, 1, 'practice'
from learning_items where type = 'english_uppercase' and content = 'A'
on conflict do nothing;

insert into learning_memory_hooks (learning_item_id, keyword, sentence, is_primary, difficulty_level, usage_stage)
select id, 'Ball', 'B is for Ball', true, 1, 'intro'
from learning_items where type = 'english_uppercase' and content = 'B'
on conflict do nothing;

insert into learning_memory_hooks (learning_item_id, keyword, sentence, is_primary, difficulty_level, usage_stage)
select id, 'Bus', 'B is for Bus', false, 1, 'practice'
from learning_items where type = 'english_uppercase' and content = 'B'
on conflict do nothing;

insert into learning_memory_hooks (learning_item_id, keyword, sentence, is_primary, difficulty_level, usage_stage)
select id, 'Cat', 'C is for Cat', true, 1, 'intro'
from learning_items where type = 'english_uppercase' and content = 'C'
on conflict do nothing;

insert into learning_memory_hooks (learning_item_id, keyword, sentence, is_primary, difficulty_level, usage_stage)
select id, 'Dog', 'D is for Dog', true, 1, 'intro'
from learning_items where type = 'english_uppercase' and content = 'D'
on conflict do nothing;

-- Question templates
insert into question_templates (type, practice_mode, template_text, instruction_audio_text, answer_mode, difficulty_level)
values
  ('bopomofo_intro', 'intro', '{content} 是 {keyword} 的 {content}', '{content} 是 {keyword} 的 {content}', 'continue', 1),
  ('bopomofo_choice', 'choice', '{keyword} 的 {content} 在哪裡？', '找找看，{keyword} 的 {content}', 'single_choice', 1),
  ('bopomofo_listening', 'listening', '聽聽看，{keyword} 的第一個聲音是哪一個？', '聽聽看，{keyword} 的第一個聲音是哪一個', 'single_choice', 2),
  ('bopomofo_tracing', 'tracing', '幫 {keyword} 的 {content} 描一遍', '幫 {keyword} 的 {content} 描一遍', 'trace', 1),
  ('english_intro', 'intro', '{content} is for {keyword}', '{content} is for {keyword}', 'continue', 1),
  ('english_choice', 'choice', 'Which one is the first letter of {keyword}?', 'Which one is the first letter of {keyword}?', 'single_choice', 1),
  ('english_tracing', 'tracing', 'Trace the letter {content}', 'Trace the letter {content}', 'trace', 1)
on conflict do nothing;

-- Card system demo
insert into card_series (name, description)
values
  ('小車系列', '完成練習後可以收集的小車卡片'),
  ('狗狗系列', '可愛狗狗收藏卡'),
  ('爸爸特製系列', '家長自行上傳的特別卡')
on conflict do nothing;

insert into card_categories (series_id, name, description)
select id, '工程車', '工程車卡片'
from card_series where name = '小車系列'
on conflict do nothing;

insert into card_categories (series_id, name, description)
select id, '日常', '日常狗狗卡片'
from card_series where name = '狗狗系列'
on conflict do nothing;

insert into card_templates (name, background_style, frame_style)
values ('奶油圓角卡', '{"theme":"cream"}', '{"radius":"large"}')
on conflict do nothing;

insert into reward_packs (name, description, draw_type)
values ('今日驚喜卡包', '完成今日練習後可抽一次', 'daily')
on conflict do nothing;
