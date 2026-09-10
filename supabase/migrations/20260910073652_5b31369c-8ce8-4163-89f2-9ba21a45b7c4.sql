alter table public.subscriptions
  add column if not exists source text not null default 'paddle';

create index if not exists idx_subscriptions_source on public.subscriptions(source);