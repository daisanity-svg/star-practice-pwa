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
  const { error } = await supabase
    .from('child_card_inventory')
    .delete()
    .eq('id', '139ba445-fa3f-42c4-99e4-01347139eb3a');

  console.log('Delete inventory error:', error?.message ?? 'none');
}

main().catch(console.error);
