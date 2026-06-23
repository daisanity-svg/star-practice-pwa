import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function main() {
  const { data: children } = await supabase.from('children').select('id').limit(1);
  const childId = children?.[0]?.id;
  if (!childId) {
    console.log('No child found');
    return;
  }

  const rewardPackId = '4697ffa1-0f5d-496e-ad17-7f5d023baa16';
  const cardId = 'bafcae70-26fe-433a-bdd2-aebf4dd8cf17';

  const { data: drawLog, error: insertLogError } = await supabase
    .from('reward_draw_logs')
    .insert({
      child_id: childId,
      reward_pack_id: rewardPackId,
      card_id: cardId,
      practice_record_id: null
    })
    .select('id')
    .single();

  if (insertLogError || !drawLog?.id) {
    console.error('Failed to insert draw log:', insertLogError);
    return;
  }

  console.log('Inserted test draw log:', drawLog.id);
  console.log('cardId:', cardId);
}

main().catch(console.error);
