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

  const today = new Date().toISOString().slice(0, 10);

  // Delete today's draw logs for this child
  const { error: deleteLogsError, count: logsCount } = await supabase
    .from('reward_draw_logs')
    .delete({ count: 'exact' })
    .eq('child_id', childId)
    .gte('created_at', `${today}T00:00:00.000Z`);

  console.log('Deleted draw logs count:', logsCount, 'error:', deleteLogsError?.message);

  // Also delete today's inventory items that might have been obtained today
  const { error: deleteInvError, count: invCount } = await supabase
    .from('child_card_inventory')
    .delete({ count: 'exact' })
    .eq('child_id', childId)
    .gte('obtained_at', `${today}T00:00:00.000Z`);

  console.log('Deleted inventory count:', invCount, 'error:', deleteInvError?.message);
}

main().catch(console.error);
