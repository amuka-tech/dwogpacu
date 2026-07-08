-- 1. Create the subscriptions table
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS but allow anyone to insert a subscription (for simplicity, or restrict via anon key)
alter table public.subscriptions enable row level security;
create policy "Allow public inserts for subscriptions" on public.subscriptions for insert with check (true);
create policy "Allow public select for subscriptions" on public.subscriptions for select using (true);
