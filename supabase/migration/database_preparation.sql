-- Migration 1: Database Preparation
-- Expected created_at type: timestamp with time zone (timestamptz).
-- This migration does not backfill user_id or modify existing rows.
-- It intentionally fails on a rerun or if default table privileges expose
-- profiles to PUBLIC, anon, or authenticated.

begin;

do $preflight$
declare
  v_table text;
  v_id_type oid;
  v_id_attnum smallint;
begin
  if to_regclass('public.products') is null
     or to_regclass('public.cash_flows') is null
     or to_regclass('auth.users') is null then
    raise exception 'Preflight gagal: public.products, public.cash_flows, dan auth.users harus tersedia.';
  end if;

  foreach v_table in array array['products', 'cash_flows'] loop
    if not exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = v_table
        and c.relkind in ('r', 'p')
    ) then
      raise exception 'Preflight gagal: public.% bukan tabel biasa atau partitioned table.', v_table;
    end if;

    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = v_table
        and column_name = 'created_at'
        and data_type = 'timestamp with time zone'
    ) then
      raise exception 'Preflight gagal: public.%.created_at harus bertipe timestamp with time zone (timestamptz).', v_table;
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = v_table
        and column_name = 'user_id'
    ) then
      raise exception 'Preflight gagal: public.%.user_id sudah ada; migration tidak dirancang untuk dijalankan ulang.', v_table;
    end if;
  end loop;

  if to_regclass('public.profiles') is not null then
    raise exception 'Preflight gagal: public.profiles sudah ada; periksa kemungkinan migration pernah berhasil atau skema dibuat manual.';
  end if;

  select a.atttypid, a.attnum
    into v_id_type, v_id_attnum
  from pg_attribute a
  where a.attrelid = 'auth.users'::regclass
    and a.attname = 'id'
    and a.attnum > 0
    and not a.attisdropped;

  if v_id_type is null or v_id_type <> 'uuid'::regtype then
    raise exception 'Preflight gagal: auth.users.id harus bertipe uuid.';
  end if;

  if not exists (
    select 1
    from pg_constraint c
    where c.conrelid = 'auth.users'::regclass
      and c.contype in ('p', 'u')
      and c.conkey = array[v_id_attnum]::smallint[]
  ) then
    raise exception 'Preflight gagal: auth.users.id harus memiliki primary key atau unique constraint tunggal.';
  end if;
end
$preflight$;

lock table public.products, public.cash_flows in share mode;

create temporary table _smart_umkm_m1_row_counts
on commit drop
as
select
  (select count(*) from public.products) as products_count,
  (select count(*) from public.cash_flows) as cash_flows_count;

alter table public.products
  add column user_id uuid null;

alter table public.cash_flows
  add column user_id uuid null;

alter table public.products
  add constraint products_user_id_fkey
  foreign key (user_id)
  references auth.users (id)
  on delete restrict;

alter table public.cash_flows
  add constraint cash_flows_user_id_fkey
  foreign key (user_id)
  references auth.users (id)
  on delete restrict;

create table public.profiles (
  user_id uuid primary key
    references auth.users (id)
    on delete cascade,
  store_name text,
  category text,
  location text,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create function public.handle_profiles_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$function$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.handle_profiles_updated_at();

create index products_user_id_created_at_idx
  on public.products (user_id, created_at desc)
  where user_id is not null;

create index cash_flows_user_id_created_at_idx
  on public.cash_flows (user_id, created_at desc)
  where user_id is not null;

-- Jangan ubah default/table grants di tahap persiapan. Jika default privileges
-- memberikan akses tabel profiles kepada role aplikasi, hentikan dan tinjau
-- default privileges atau rancangan schema sebelum menjalankan ulang.
do $profile_acl_check$
begin
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    cross join lateral aclexplode(
      coalesce(c.relacl, acldefault('r', c.relowner))
    ) acl
    left join pg_roles r on r.oid = acl.grantee
    where n.nspname = 'public'
      and c.relname = 'profiles'
      and (
        acl.grantee = 0
        or r.rolname in ('anon', 'authenticated')
      )
  ) then
    raise exception
      'Migration dibatalkan: profiles memiliki privilege untuk PUBLIC, anon, atau authenticated. Tahap ini tidak mengubah grants; evaluasi default privileges secara terpisah.';
  end if;
end
$profile_acl_check$;

do $row_count_check$
declare
  v_before record;
  v_products_after bigint;
  v_cash_flows_after bigint;
begin
  select * into v_before from _smart_umkm_m1_row_counts;

  select count(*) into v_products_after from public.products;
  select count(*) into v_cash_flows_after from public.cash_flows;

  if v_products_after <> v_before.products_count
     or v_cash_flows_after <> v_before.cash_flows_count then
    raise exception 'Migration dibatalkan: jumlah baris berubah saat Database Preparation.';
  end if;
end
$row_count_check$;

commit;

-- ROLLBACK MANUAL (jangan jalankan sebagai bagian dari migration forward).
-- Jalankan hanya setelah memverifikasi Migration 2 belum aktif dan tidak ada
-- user_id non-NULL maupun profil pengguna. Perintah berikut sengaja dikomentari
-- agar menjalankan file migration tidak menghapus hasil migration di atas.
/*
begin;

lock table public.products, public.cash_flows, public.profiles in share mode;

do $rollback_preflight$
begin
  if not exists (
    select 1 from pg_class
    where oid = 'public.products'::regclass and relrowsecurity = false
  ) or not exists (
    select 1 from pg_class
    where oid = 'public.cash_flows'::regclass and relrowsecurity = false
  ) or not exists (
    select 1 from pg_class
    where oid = 'public.profiles'::regclass and relrowsecurity = false
  ) then
    raise exception 'Rollback ditolak: RLS aktif pada tabel target. Tinjau kondisi Migration 2 terlebih dahulu.';
  end if;

  if exists (select 1 from public.products where user_id is not null)
     or exists (select 1 from public.cash_flows where user_id is not null)
     or exists (select 1 from public.profiles) then
    raise exception 'Rollback ditolak: sudah ada data pengguna/profil. Jangan hapus kolom atau tabel pemilik data.';
  end if;
end
$rollback_preflight$;

drop trigger profiles_set_updated_at on public.profiles;
drop function public.handle_profiles_updated_at();
drop index public.products_user_id_created_at_idx;
drop index public.cash_flows_user_id_created_at_idx;
alter table public.products drop constraint products_user_id_fkey;
alter table public.cash_flows drop constraint cash_flows_user_id_fkey;
alter table public.products drop column user_id;
alter table public.cash_flows drop column user_id;
drop table public.profiles;

commit;
*/