-- Migration 2: Security Enforcement
-- Run only after reviewing every existing policy on the three target tables.
-- This script is transactional, refuses reruns, and does not grant/revoke any
-- privilege directly to/from service_role.

begin;

do $preflight$
declare
  v_table text;
begin
  foreach v_table in array array['products', 'cash_flows'] loop
    if to_regclass(format('public.%I', v_table)) is null then
      raise exception 'Preflight gagal: public.% tidak ditemukan.', v_table;
    end if;

    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = v_table
        and column_name = 'created_at'
        and data_type = 'timestamp with time zone'
    ) then
      raise exception 'Preflight gagal: public.%.created_at harus bertipe timestamp with time zone (timestamptz), sama seperti prasyarat Migration 1.', v_table;
    end if;

    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = v_table
        and column_name = 'user_id'
        and data_type = 'uuid'
        and is_nullable = 'YES'
    ) then
      raise exception 'Preflight gagal: public.%.user_id harus nullable uuid sesuai Migration 1.', v_table;
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conrelid = to_regclass(format('public.%I', v_table))
        and conname = case v_table
          when 'products' then 'products_user_id_fkey'
          else 'cash_flows_user_id_fkey'
        end
        and contype = 'f'
        and confrelid = 'auth.users'::regclass
        and confdeltype = 'r'
    ) then
      raise exception 'Preflight gagal: FK public.% harus menuju auth.users dengan ON DELETE RESTRICT.', v_table;
    end if;

    if exists (
      select 1
      from pg_class c
      where c.oid = to_regclass(format('public.%I', v_table))
        and c.relrowsecurity
    ) then
      raise exception 'Preflight gagal: RLS public.% sudah aktif. Migration ini tidak dirancang untuk dijalankan ulang atau mengadopsi perubahan parsial.', v_table;
    end if;
  end loop;

  if to_regclass('public.profiles') is null then
    raise exception 'Preflight gagal: public.profiles tidak ditemukan; jalankan Database Preparation terlebih dahulu.';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'user_id'
      and data_type = 'uuid'
      and is_nullable = 'NO'
  ) or not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'created_at'
      and data_type = 'timestamp with time zone'
      and is_nullable = 'NO'
  ) or not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'updated_at'
      and data_type = 'timestamp with time zone'
      and is_nullable = 'NO'
  ) then
    raise exception 'Preflight gagal: kolom profiles dari Migration 1 tidak sesuai tipe atau nullability yang diharapkan.';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'p'
      and conkey = array[(
        select attnum from pg_attribute
        where attrelid = 'public.profiles'::regclass
          and attname = 'user_id' and not attisdropped
      )]::smallint[]
  ) or not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_user_id_fkey'
      and contype = 'f'
      and confrelid = 'auth.users'::regclass
      and confdeltype = 'c'
  ) then
    raise exception 'Preflight gagal: profiles harus memiliki PK user_id dan FK auth.users ON DELETE CASCADE dari Migration 1.';
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.profiles'::regclass
      and tgname = 'profiles_set_updated_at'
      and not tgisinternal
  ) then
    raise exception 'Preflight gagal: trigger profiles_set_updated_at dari Migration 1 tidak ditemukan.';
  end if;

  if not exists (select 1 from pg_roles where rolname = 'anon')
     or not exists (select 1 from pg_roles where rolname = 'authenticated')
     or not exists (select 1 from pg_roles where rolname = 'service_role') then
    raise exception 'Preflight gagal: role anon, authenticated, dan service_role harus tersedia.';
  end if;

  if exists (
    select 1 from pg_class
    where oid = 'public.profiles'::regclass and relrowsecurity
  ) then
    raise exception 'Preflight gagal: RLS public.profiles sudah aktif; migration ini tidak dirancang untuk dijalankan ulang atau mengadopsi perubahan parsial.';
  end if;

  -- Tidak memberi grant schema secara otomatis. Jika authenticated belum
  -- mendapat USAGE melalui grant yang ada atau membership, berhenti di sini.
  if not has_schema_privilege('authenticated', 'public', 'USAGE') then
    raise exception 'Preflight gagal: authenticated tidak memiliki USAGE ON SCHEMA public. Tinjau ACL aktual; migration ini tidak mengubah privilege schema.';
  end if;
end
$preflight$;

lock table public.products, public.cash_flows, public.profiles in share mode;

create temporary table _smart_umkm_m2_row_counts
ON COMMIT PRESERVE ROWS
as
select
  (select count(*) from public.products) as products_count,
  (select count(*) from public.products where user_id is null) as products_unowned,
  (select count(*) from public.cash_flows) as cash_flows_count,
  (select count(*) from public.cash_flows where user_id is null) as cash_flows_unowned,
  (select count(*) from public.profiles) as profiles_count;

-- Catat privilege efektif service_role sebelum perubahan PUBLIC/anon. Jika
-- revoke PUBLIC mengubah privilege efektifnya, pemeriksaan akhir membatalkan
-- seluruh transaksi. service_role tidak pernah menjadi target GRANT/REVOKE.
create temporary table _smart_umkm_m2_service_table_acl
on commit drop
as
select target.relid, privilege.privilege,
       has_table_privilege('service_role', target.relid, privilege.privilege) as was_granted
from (values
  ('public.products'::regclass),
  ('public.cash_flows'::regclass),
  ('public.profiles'::regclass)
) as target(relid)
cross join (values
  ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'),
  ('TRUNCATE'), ('REFERENCES'), ('TRIGGER'),   ('MAINTAIN')
) as privilege(privilege);

create temporary table _smart_umkm_m2_service_column_acl
on commit drop
as
select target.relid,
       cols.attnum,
       privilege.privilege,
       has_column_privilege('service_role', target.relid, cols.attnum, privilege.privilege) as was_granted
from (values
  ('public.products'::regclass),
  ('public.cash_flows'::regclass),
  ('public.profiles'::regclass)
) as target(relid)
join pg_attribute cols on cols.attrelid = target.relid
  and cols.attnum > 0 and not cols.attisdropped
cross join (values ('SELECT'), ('INSERT'), ('UPDATE'), ('REFERENCES'))
  as privilege(privilege);

create temporary table _smart_umkm_m2_service_sequence_acl
on commit drop
as
select seq.oid as sequence_oid,
       has_sequence_privilege('service_role', seq.oid, 'USAGE') as had_usage,
       has_sequence_privilege('service_role', seq.oid, 'SELECT') as had_select,
       has_sequence_privilege('service_role', seq.oid, 'UPDATE') as had_update
from pg_class seq
join pg_depend d
  on d.objid = seq.oid
 and d.classid = 'pg_class'::regclass
 and d.refclassid = 'pg_class'::regclass
 and d.deptype in ('a', 'i')
where seq.relkind = 'S'
  and d.refobjid in (
    'public.products'::regclass,
    'public.cash_flows'::regclass,
    'public.profiles'::regclass
  );

-- Allowlist pasangan tabel-policy beserta definisi policy yang telah ditinjau.
-- Salin hasil pg_policies ke INSERT di bawah setelah memeriksa permissive,
-- roles, cmd, qual (USING), dan with_check. Kosong berarti hanya aman bila
-- tidak ada policy lama pada tabel target. Definisi harus cocok persis.
create temporary table _smart_umkm_m2_approved_old_policies (
  table_name name not null,
  policy_name name not null,
  permissive text not null,
  roles name[] not null,
  cmd text not null,
  qual text,
  with_check text,
  primary key (table_name, policy_name)
) on commit drop;

-- Contoh format, jangan aktifkan tanpa mengganti nilai dengan definisi aktual:
-- insert into _smart_umkm_m2_approved_old_policies
--   (table_name, policy_name, permissive, roles, cmd, qual, with_check)
-- values ('products', 'policy_lama', 'PERMISSIVE',
--         array['authenticated']::name[], 'SELECT', '...', null);

do $policy_review_and_replacement$
declare
  v_unreviewed text;
  v_stale_allowlist text;
  v_policy record;
begin
  select string_agg(format('%I.%I', p.tablename, p.policyname), ', ')
    into v_unreviewed
  from pg_policies p
  left join _smart_umkm_m2_approved_old_policies a
    on a.table_name = p.tablename
   and a.policy_name = p.policyname
   and a.permissive = p.permissive
   and a.roles = p.roles
   and a.cmd = p.cmd
   and a.qual is not distinct from p.qual
   and a.with_check is not distinct from p.with_check
  where p.schemaname = 'public'
    and p.tablename in ('products', 'cash_flows', 'profiles')
    and a.policy_name is null;

  if v_unreviewed is not null then
    raise exception 'Migration dibatalkan: policy belum ditinjau atau definisinya berubah: %. Inventarisasi roles, command, USING, dan WITH CHECK sebelum menambahkan pasangan tabel-policy ke allowlist.', v_unreviewed;
  end if;

  select string_agg(format('%I.%I', a.table_name, a.policy_name), ', ')
    into v_stale_allowlist
  from _smart_umkm_m2_approved_old_policies a
  left join pg_policies p
    on p.schemaname = 'public'
   and p.tablename = a.table_name
   and p.policyname = a.policy_name
   and p.permissive = a.permissive
   and p.roles = a.roles
   and p.cmd = a.cmd
   and p.qual is not distinct from a.qual
   and p.with_check is not distinct from a.with_check
  where p.policyname is null;

  if v_stale_allowlist is not null then
    raise exception 'Migration dibatalkan: entri allowlist tidak cocok dengan policy aktual: %. Tinjau ulang inventaris sebelum melanjutkan.', v_stale_allowlist;
  end if;

  for v_policy in
    select p.schemaname, p.tablename, p.policyname
    from pg_policies p
    join _smart_umkm_m2_approved_old_policies a
      on a.table_name = p.tablename
     and a.policy_name = p.policyname
     and a.permissive = p.permissive
     and a.roles = p.roles
     and a.cmd = p.cmd
     and a.qual is not distinct from p.qual
     and a.with_check is not distinct from p.with_check
    where p.schemaname = 'public'
      and p.tablename in ('products', 'cash_flows', 'profiles')
  loop
    execute format('drop policy %I on %I.%I',
      v_policy.policyname, v_policy.schemaname, v_policy.tablename);
  end loop;
end
$policy_review_and_replacement$;

alter table public.products enable row level security;
alter table public.cash_flows enable row level security;
alter table public.profiles enable row level security;

create policy products_select_own
  on public.products for select to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy products_insert_own
  on public.products for insert to authenticated
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy products_update_own
  on public.products for update to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()))
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy products_delete_own
  on public.products for delete to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()));

create policy cash_flows_select_own
  on public.cash_flows for select to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy cash_flows_insert_own
  on public.cash_flows for insert to authenticated
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy cash_flows_update_own
  on public.cash_flows for update to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()))
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy cash_flows_delete_own
  on public.cash_flows for delete to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()));

create policy profiles_select_own
  on public.profiles for select to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy profiles_insert_own
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy profiles_update_own
  on public.profiles for update to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()))
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy profiles_delete_own
  on public.profiles for delete to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()));

-- Tidak mengubah USAGE/CREATE pada schema public. Preflight sudah memastikan
-- authenticated memiliki USAGE berdasarkan kondisi ACL/membership aktual.
revoke all privileges on table
  public.products, public.cash_flows, public.profiles
  from public, anon, authenticated;
revoke truncate, references, trigger on table
  public.products, public.cash_flows, public.profiles
  from public, anon, authenticated;

-- Hapus juga kemungkinan column-level grants kepada PUBLIC/anon. REVOKE TABLE
-- saja tidak selalu mencakup grants yang diberikan pada kolom tertentu.
do $column_privileges$
declare
  v_table record;
  v_column record;
begin
  for v_table in
    select * from (values
      ('products'::text), ('cash_flows'::text), ('profiles'::text)
    ) as target(table_name)
  loop
    for v_column in
      select column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name = v_table.table_name
    loop
      execute format(
        'revoke select (%1$I), insert (%1$I), update (%1$I), references (%1$I) on table public.%2$I from public, anon, authenticated',
        v_column.column_name, v_table.table_name
      );
    end loop;
  end loop;
end
$column_privileges$;

grant select, insert, update, delete on table
  public.products, public.cash_flows, public.profiles
  to authenticated;

-- Sequence hanya diberi USAGE untuk kebutuhan nextval() saat INSERT.
-- SELECT/UPDATE tidak diberikan kepada authenticated.
do $sequence_privileges$
declare
  v_sequence record;
begin
  for v_sequence in
    select distinct ns.nspname as schema_name, seq.relname as sequence_name
    from pg_class seq
    join pg_namespace ns on ns.oid = seq.relnamespace
    join pg_depend d
      on d.objid = seq.oid
     and d.classid = 'pg_class'::regclass
     and d.refclassid = 'pg_class'::regclass
     and d.deptype in ('a', 'i')
    where seq.relkind = 'S'
      and d.refobjid in (
        'public.products'::regclass,
        'public.cash_flows'::regclass,
        'public.profiles'::regclass
      )
  loop
    execute format(
      'revoke all privileges on sequence %I.%I from public, anon, authenticated',
      v_sequence.schema_name, v_sequence.sequence_name
    );
    execute format(
      'grant usage on sequence %I.%I to authenticated',
      v_sequence.schema_name, v_sequence.sequence_name
    );
  end loop;
end
$sequence_privileges$;

do $security_and_integrity_checks$ 
declare
  v_before record;
  v_products_count bigint;
  v_products_unowned bigint;
  v_cash_flows_count bigint;
  v_cash_flows_unowned bigint;
  v_profiles_count bigint;
  v_table record;
  v_column record;
begin
  if has_table_privilege('anon', 'public.products', 'SELECT')
     or has_table_privilege('anon', 'public.products', 'INSERT')
     or has_table_privilege('anon', 'public.products', 'UPDATE')
     or has_table_privilege('anon', 'public.products', 'DELETE')
     or has_table_privilege('anon', 'public.products', 'TRUNCATE')
     or has_table_privilege('anon', 'public.cash_flows', 'SELECT')
     or has_table_privilege('anon', 'public.cash_flows', 'INSERT')
     or has_table_privilege('anon', 'public.cash_flows', 'UPDATE')
     or has_table_privilege('anon', 'public.cash_flows', 'DELETE')
     or has_table_privilege('anon', 'public.cash_flows', 'TRUNCATE')
     or has_table_privilege('anon', 'public.profiles', 'SELECT')
     or has_table_privilege('anon', 'public.profiles', 'INSERT')
     or has_table_privilege('anon', 'public.profiles', 'UPDATE')
     or has_table_privilege('anon', 'public.profiles', 'DELETE')
     or has_table_privilege('anon', 'public.profiles', 'TRUNCATE')
     or has_table_privilege('anon', 'public.products', 'REFERENCES')
     or has_table_privilege('anon', 'public.products', 'TRIGGER')
     or has_table_privilege('anon', 'public.cash_flows', 'REFERENCES')
     or has_table_privilege('anon', 'public.cash_flows', 'TRIGGER')
     or has_table_privilege('anon', 'public.profiles', 'REFERENCES')
     or has_table_privilege('anon', 'public.profiles', 'TRIGGER') 
     or has_table_privilege('anon', 'public.products', 'MAINTAIN')
     or has_table_privilege('anon', 'public.cash_flows', 'MAINTAIN')
     or has_table_privilege('anon', 'public.profiles', 'MAINTAIN') then
    raise exception 'Verifikasi gagal: anon masih memiliki privilege tabel target; transaksi dibatalkan.';
  end if;

  for v_table in
    select * from (values
      ('products'::text), ('cash_flows'::text), ('profiles'::text)
    ) as target(table_name)
  loop
    for v_column in
      select column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name = v_table.table_name
    loop
      if has_column_privilege('anon', format('public.%I', v_table.table_name), v_column.column_name, 'SELECT')
         or has_column_privilege('anon', format('public.%I', v_table.table_name), v_column.column_name, 'INSERT')
         or has_column_privilege('anon', format('public.%I', v_table.table_name), v_column.column_name, 'UPDATE')
         or has_column_privilege('anon', format('public.%I', v_table.table_name), v_column.column_name, 'REFERENCES') then
        raise exception 'Verifikasi gagal: anon masih memiliki privilege kolom pada public.%.%; transaksi dibatalkan.', v_table.table_name, v_column.column_name;
      end if;
    end loop;
  end loop;

  -- has_sequence_privilege checks effective rights, including privileges
  -- inherited through role membership. Scope is limited to sequences owned
  -- by the three target tables above.
  if exists (
    select 1
    from pg_class seq
    join pg_depend d
      on d.objid = seq.oid
     and d.classid = 'pg_class'::regclass
     and d.refclassid = 'pg_class'::regclass
     and d.deptype in ('a', 'i')
    where seq.relkind = 'S'
      and d.refobjid in (
        'public.products'::regclass,
        'public.cash_flows'::regclass,
        'public.profiles'::regclass
      )
      and (
        has_sequence_privilege('anon', seq.oid, 'USAGE')
        or has_sequence_privilege('anon', seq.oid, 'SELECT')
        or has_sequence_privilege('anon', seq.oid, 'UPDATE')
      )
  ) then
    raise exception 'Verifikasi gagal: anon masih memiliki USAGE, SELECT, atau UPDATE efektif pada sequence milik tabel target; transaksi dibatalkan.';
  end if;

  if exists (
    select 1
    from _smart_umkm_m2_service_table_acl before_acl
    where before_acl.was_granted is distinct from has_table_privilege(
      'service_role', before_acl.relid, before_acl.privilege
    )
  ) or exists (
    select 1
    from _smart_umkm_m2_service_sequence_acl before_acl
    where before_acl.had_usage is distinct from has_sequence_privilege('service_role', before_acl.sequence_oid, 'USAGE')
       or before_acl.had_select is distinct from has_sequence_privilege('service_role', before_acl.sequence_oid, 'SELECT')
       or before_acl.had_update is distinct from has_sequence_privilege('service_role', before_acl.sequence_oid, 'UPDATE')
  ) or exists (
    select 1
    from _smart_umkm_m2_service_column_acl before_acl
    where before_acl.was_granted is distinct from has_column_privilege(
      'service_role', before_acl.relid, before_acl.attnum, before_acl.privilege
    )
  ) then
    raise exception 'Verifikasi gagal: privilege efektif service_role berubah akibat ACL PUBLIC. Transaksi dibatalkan; evaluasi ACL sebelum mencoba kembali.';
  end if;

  select * into v_before from _smart_umkm_m2_row_counts;
  select count(*), count(*) filter (where user_id is null)
    into v_products_count, v_products_unowned from public.products;
  select count(*), count(*) filter (where user_id is null)
    into v_cash_flows_count, v_cash_flows_unowned from public.cash_flows;
  select count(*) into v_profiles_count from public.profiles;

  if v_products_count <> v_before.products_count
     or v_products_unowned <> v_before.products_unowned
     or v_cash_flows_count <> v_before.cash_flows_count
     or v_cash_flows_unowned <> v_before.cash_flows_unowned
     or v_profiles_count <> v_before.profiles_count then
    raise exception 'Verifikasi gagal: jumlah baris atau jumlah data user_id NULL berubah; transaksi dibatalkan.';
  end if;
end
$security_and_integrity_checks$;

commit;
