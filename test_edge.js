import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://kfircojqiwgmxopurrde.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaXJjb2pxaXdnbXhvcHVycmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMzA1NjAsImV4cCI6MjA5ODkwNjU2MH0.KB-t1tgEZ29b5WUONPc7Rk1Dac4PWCN_HjL7SC0fOK8');

async function test() {
  console.log('Invoking edge function...');
  const res = await supabase.functions.invoke('notify', {
    body: {
      type: 'UPDATE',
      table: 'matches',
      old_record: { home_score: 0, away_score: 0, is_live: false },
      record: { home_score: 1, away_score: 0, is_live: true, home_team: 'Test', away_team: 'Test2' }
    }
  });
  console.log(JSON.stringify(res.data, null, 2));
}

test();
