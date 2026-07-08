import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://kfircojqiwgmxopurrde.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaXJjb2pxaXdnbXhvcHVycmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMzA1NjAsImV4cCI6MjA5ODkwNjU2MH0.KB-t1tgEZ29b5WUONPc7Rk1Dac4PWCN_HjL7SC0fOK8');

async function test() {
  const { data, error } = await supabase.from('subscriptions').select('*');
  console.log(data, error);
}

test();
