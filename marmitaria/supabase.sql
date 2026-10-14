-- Cole no Supabase: SQL Editor > New query > Run
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text not null,
  descricao text default '',
  precos jsonb not null default '[]',
  img text default '',
  emoji text default '',
  status text not null default 'ativo' check (status in ('ativo','esgotado','oculto')),
  criado_em timestamptz default now()
);

alter table public.produtos enable row level security;

-- Clientes só enxergam o que não está oculto
create policy "clientes leem" on public.produtos
  for select using (status <> 'oculto');

-- Só o seu e-mail cadastra, edita e apaga (e vê os ocultos)
-- TROQUE pelo e-mail do admin
create policy "admin gerencia" on public.produtos
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'SEU_EMAIL@exemplo.com')
  with check ((auth.jwt() ->> 'email') = 'SEU_EMAIL@exemplo.com');

-- Atualização em tempo real na vitrine
alter publication supabase_realtime add table public.produtos;
