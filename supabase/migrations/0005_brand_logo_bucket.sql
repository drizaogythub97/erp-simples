-- =====================================================================
-- ERP Simples — 0005: bucket de logos da marca
-- - Cria bucket 'brand-logos' como público (leitura aberta para qualquer
--   um com a URL; o caminho contém o user_id em uuid, então não é
--   enumerável de fora).
-- - RLS na tabela storage.objects: upload/update/delete só permitidos
--   quando o caminho começa com o auth.uid() do usuário.
-- - O conteúdo das policies usa a função auxiliar storage.foldername(name)
--   já disponível no Supabase para inspecionar pastas do path.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('brand-logos', 'brand-logos', true)
on conflict (id) do nothing;

-- Inserir/atualizar política só pode ser feito por uma policy individual,
-- por isso criamos uma por operação.

drop policy if exists "brand_logos_insert_own" on storage.objects;
create policy "brand_logos_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'brand-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "brand_logos_update_own" on storage.objects;
create policy "brand_logos_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'brand-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'brand-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "brand_logos_delete_own" on storage.objects;
create policy "brand_logos_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'brand-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Leitura: bucket público já permite GET via URL sem RLS; ainda assim,
-- garantimos a policy de SELECT para clientes autenticados.
drop policy if exists "brand_logos_read_all" on storage.objects;
create policy "brand_logos_read_all"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'brand-logos');
