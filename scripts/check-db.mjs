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
  const { data: children } = await supabase.from('children').select('id').limit(5);
  console.log('Children:', JSON.stringify(children, null, 2));

  const childId = children?.[0]?.id;
  if (!childId) {
    console.log('No children found');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: logs } = await supabase
    .from('reward_draw_logs')
    .select('id, card_id, reward_pack_id, practice_record_id, created_at')
    .eq('child_id', childId)
    .gte('created_at', `${today}T00:00:00.000Z`)
    .order('created_at', { ascending: false });

  console.log('Today logs:', JSON.stringify(logs, null, 2));

  const { data: inventory } = await supabase
    .from('child_card_inventory')
    .select('id, card_id, quantity, obtained_at')
    .eq('child_id', childId)
    .order('obtained_at', { ascending: false })
    .limit(10);

  console.log('Inventory:', JSON.stringify(inventory, null, 2));
}

main().catch(console.error);
