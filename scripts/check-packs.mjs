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
  const { data: packs } = await supabase.from('reward_packs').select('id, is_active').limit(5);
  console.log('Packs:', JSON.stringify(packs, null, 2));

  for (const pack of packs ?? []) {
    const { data: items } = await supabase
      .from('reward_pack_items')
      .select('id, card_id, is_active, stock')
      .eq('reward_pack_id', pack.id);
    console.log(`Pack ${pack.id} items:`, JSON.stringify(items, null, 2));
  }
}

main().catch(console.error);
