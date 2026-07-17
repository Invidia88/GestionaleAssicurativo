begin;

select plan(49);

-- Struttura pubblica: esistono soltanto le sei tabelle applicative previste.
select has_table('public', 'agenzie', 'esiste la tabella agenzie');
select has_table('public', 'utenti', 'esiste la tabella utenti');
select has_table('public', 'clienti', 'esiste la tabella clienti');
select has_table('public', 'compagnie', 'esiste la tabella compagnie');
select has_table('public', 'polizze', 'esiste la tabella polizze');
select has_table('public', 'contatti', 'esiste la tabella contatti');

select is(
  (
    select count(*)::integer
    from pg_catalog.pg_tables
    where schemaname = 'public'
      and tablename in ('agenzie', 'utenti', 'clienti', 'compagnie', 'polizze', 'contatti')
      and rowsecurity = true
  ),
  6,
  'RLS è attiva su tutte le tabelle applicative'
);

-- Fixture deterministiche per due tenant.
insert into auth.users (id, aud, role, email)
values
  ('20000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'admin-a@test.local'),
  ('20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'collaboratore-a@test.local'),
  ('20000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'admin-b@test.local'),
  ('20000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'inattivo-b@test.local'),
  ('20000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'bootstrap@test.local'),
  ('20000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'secondo-admin@test.local'),
  ('20000000-0000-0000-0000-000000000007', 'authenticated', 'authenticated', 'secondo-collaboratore@test.local');

insert into public.agenzie (id, nome, email)
values
  ('10000000-0000-0000-0000-000000000001', 'Agenzia A', 'a@test.local'),
  ('10000000-0000-0000-0000-000000000002', 'Agenzia B', 'b@test.local');

insert into public.utenti (id, agenzia_id, nome, cognome, ruolo, attivo)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Ada', 'Admin', 'amministratore', true),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Carlo', 'Collaboratore', 'collaboratore', true),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Bruno', 'Admin', 'amministratore', true),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Ivo', 'Inattivo', 'collaboratore', false);

select is(
  (
    select count(*)::integer
    from pg_catalog.pg_indexes
    where schemaname = 'public'
      and indexname = 'utenti_un_amministratore_per_agenzia_idx'
  ),
  1,
  'esiste il vincolo univoco parziale per l’amministratore'
);

select throws_ok(
  $$insert into public.utenti (id, agenzia_id, nome, cognome, ruolo)
    values (
      '20000000-0000-0000-0000-000000000006',
      '10000000-0000-0000-0000-000000000001',
      'Secondo', 'Admin', 'amministratore'
    )$$,
  '23505',
  null,
  'una stessa agenzia non può avere due amministratori'
);

select lives_ok(
  $$insert into public.utenti (id, agenzia_id, nome, cognome, ruolo)
    values (
      '20000000-0000-0000-0000-000000000007',
      '10000000-0000-0000-0000-000000000001',
      'Secondo', 'Collaboratore', 'collaboratore'
    )$$,
  'una stessa agenzia può avere più collaboratori'
);

select is(
  (
    select prosecdef
    from pg_catalog.pg_proc
    where oid = 'public.crea_agenzia_con_amministratore(uuid,text,text,text,text,text)'::regprocedure
  ),
  false,
  'il bootstrap agenzia usa i privilegi del chiamante'
);

insert into public.clienti (id, agenzia_id, nome, cognome, telefono)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Cliente', 'Alfa', '+393331111111'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Cliente', 'Beta', '+393332222222'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Cliente', 'Libero', '+393333333333');

insert into public.compagnie (id, agenzia_id, nome)
values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Compagnia Comune'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Compagnia Comune'),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Compagnia Libera');

insert into public.polizze (
  id, agenzia_id, cliente_id, compagnia_id, tipo, data_scadenza
)
values
  (
    '50000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    'Auto', current_date + 10
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000002',
    'Casa', current_date + 20
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    'Casa', current_date + 40
  );

insert into public.contatti (
  id, agenzia_id, cliente_id, polizza_id, utente_id, tipo_contatto, esito
)
values
  (
    '60000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    'whatsapp', 'contattato'
  );

-- Collaboratore dell'agenzia A.
set local role authenticated;
set local "request.jwt.claim.sub" = '20000000-0000-0000-0000-000000000002';
set local "request.jwt.claim.role" = 'authenticated';
set local "request.jwt.claims" = '{"sub":"20000000-0000-0000-0000-000000000002","role":"authenticated"}';

select is(
  (select count(*)::integer from public.clienti),
  2,
  'il collaboratore vede soltanto i clienti della propria agenzia'
);

select is(
  (select count(*)::integer from public.clienti where agenzia_id = '10000000-0000-0000-0000-000000000002'),
  0,
  'i clienti dell’altra agenzia non sono visibili'
);

select lives_ok(
  $$insert into public.clienti (agenzia_id, nome, cognome, telefono)
    values ('10000000-0000-0000-0000-000000000001', 'Nuovo', 'Cliente', '+393334444444')$$,
  'il collaboratore può inserire un cliente nel proprio tenant'
);

select throws_ok(
  $$insert into public.clienti (agenzia_id, nome, cognome, telefono)
    values ('10000000-0000-0000-0000-000000000002', 'Intruso', 'Cliente', '+393335555555')$$,
  '42501',
  'new row violates row-level security policy for table "clienti"',
  'non si può inserire un cliente in un altro tenant'
);

select throws_ok(
  $$insert into public.polizze (agenzia_id, cliente_id, compagnia_id, tipo, data_scadenza)
    values (
      '10000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000002',
      '40000000-0000-0000-0000-000000000001',
      'Auto', current_date
    )$$,
  '23503',
  null,
  'le chiavi composte bloccano relazioni tra tenant'
);

select throws_ok(
  $$update public.clienti
    set agenzia_id = '10000000-0000-0000-0000-000000000002'
    where id = '30000000-0000-0000-0000-000000000001'$$,
  '23514',
  'agenzia_id non può essere modificato',
  'agenzia_id è immutabile'
);

select is_empty(
  $$update public.agenzie set nome = 'Nome non consentito'
    where id = '10000000-0000-0000-0000-000000000001'
    returning 1$$,
  'il collaboratore non può modificare le impostazioni agenzia'
);

select is_empty(
  $$update public.utenti set attivo = false
    where id = '20000000-0000-0000-0000-000000000001'
    returning 1$$,
  'il collaboratore non può gestire gli utenti'
);

select isnt_empty(
  $$delete from public.clienti
    where id = '30000000-0000-0000-0000-000000000003'
    returning 1$$,
  'il collaboratore può eliminare un cliente senza collegamenti'
);

select throws_ok(
  $$delete from public.clienti where id = '30000000-0000-0000-0000-000000000001'$$,
  '23503',
  null,
  'un cliente con polizze o contatti non può essere eliminato'
);

select throws_ok(
  $$delete from public.compagnie where id = '40000000-0000-0000-0000-000000000001'$$,
  '23503',
  null,
  'una compagnia con polizze non può essere eliminata'
);

select throws_ok(
  $$select public.rinnova_polizza(
      '50000000-0000-0000-0000-000000000003',
      current_date + 30
    )$$,
  '23514',
  'La nuova scadenza deve essere successiva alla precedente',
  'la nuova scadenza deve essere successiva alla precedente'
);

select lives_ok(
  $$select public.rinnova_polizza(
      '50000000-0000-0000-0000-000000000003',
      current_date + 400,
      'RINN-001',
      450.50,
      'Rinnovo test'
    )$$,
  'il collaboratore può rinnovare atomicamente una polizza del proprio tenant'
);

select is(
  (
    select stato
    from public.polizze
    where id = '50000000-0000-0000-0000-000000000003'
  ),
  'rinnovata',
  'la polizza precedente viene chiusa come rinnovata'
);

select is(
  (
    select count(*)::integer
    from public.polizze
    where numero_polizza = 'RINN-001'
      and stato = 'attiva'
      and data_scadenza = current_date + 400
  ),
  1,
  'il rinnovo crea una nuova polizza attiva con la nuova scadenza'
);

select throws_ok(
  $$select public.rinnova_polizza(
      '50000000-0000-0000-0000-000000000003',
      current_date + 500
    )$$,
  '23514',
  'Solo una polizza attiva può essere rinnovata',
  'una polizza già rinnovata non può essere rinnovata di nuovo'
);

select throws_ok(
  $$select public.rinnova_polizza(
      '50000000-0000-0000-0000-000000000002',
      current_date + 500
    )$$,
  'P0002',
  'Polizza non trovata',
  'il rinnovo non può accedere a una polizza di un altro tenant'
);

select isnt_empty(
  $$delete from public.polizze
    where id = '50000000-0000-0000-0000-000000000001'
    returning 1$$,
  'il collaboratore può eliminare una polizza del proprio tenant'
);

select throws_ok(
  $$update public.contatti set note = 'modifica vietata'
    where id = '60000000-0000-0000-0000-000000000001'$$,
  '42501',
  'permission denied for table contatti',
  'lo storico contatti non è modificabile'
);

select throws_ok(
  $$delete from public.contatti
    where id = '60000000-0000-0000-0000-000000000001'$$,
  '42501',
  'permission denied for table contatti',
  'lo storico contatti non è eliminabile'
);

select throws_ok(
  $$insert into public.contatti (
      agenzia_id, cliente_id, utente_id, tipo_contatto, esito
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      'telefono', 'contattato'
    )$$,
  '42501',
  'new row violates row-level security policy for table "contatti"',
  'un contatto non può essere attribuito a un altro operatore'
);

reset role;

select is(
  (
    select polizza_id
    from public.contatti
    where id = '60000000-0000-0000-0000-000000000001'
  ),
  null::uuid,
  'eliminare una polizza mantiene il contatto scollegato'
);

select throws_ok(
  $$insert into public.clienti (agenzia_id, nome, cognome, telefono)
    values ('10000000-0000-0000-0000-000000000001', 'Telefono', 'Errato', '33 123')$$,
  '23514',
  null,
  'un telefono non normalizzato viene rifiutato'
);

select throws_ok(
  $$insert into public.polizze (
      agenzia_id, cliente_id, compagnia_id, tipo, data_scadenza, stato
    ) values (
      '10000000-0000-0000-0000-000000000002',
      '30000000-0000-0000-0000-000000000002',
      '40000000-0000-0000-0000-000000000002',
      'Casa', current_date, 'scaduta'
    )$$,
  '23514',
  null,
  'uno stato calcolato non può essere salvato'
);

select throws_ok(
  $$insert into public.compagnie (agenzia_id, nome)
    values ('10000000-0000-0000-0000-000000000001', ' compagnia comune ')$$,
  '23505',
  null,
  'il nome compagnia è univoco nel tenant senza distinzione maiuscole'
);

-- Utente inattivo dell'agenzia B.
set local role authenticated;
set local "request.jwt.claim.sub" = '20000000-0000-0000-0000-000000000004';
set local "request.jwt.claim.role" = 'authenticated';
set local "request.jwt.claims" = '{"sub":"20000000-0000-0000-0000-000000000004","role":"authenticated"}';

select is(
  (select count(*)::integer from public.clienti),
  0,
  'un utente inattivo non vede dati'
);

-- Amministratore dell'agenzia B.
reset role;
set local role authenticated;
set local "request.jwt.claim.sub" = '20000000-0000-0000-0000-000000000003';
set local "request.jwt.claim.role" = 'authenticated';
set local "request.jwt.claims" = '{"sub":"20000000-0000-0000-0000-000000000003","role":"authenticated"}';

select is(
  (select privato.ruolo_utente_corrente()),
  'amministratore',
  'la funzione privata restituisce il ruolo corrente'
);

select is(
  (select count(*)::integer from public.polizze),
  1,
  'la dashboard dell’amministratore vede soltanto le polizze della propria agenzia'
);

select is(
  (
    select count(*)::integer
    from public.polizze
    where agenzia_id = '10000000-0000-0000-0000-000000000001'
  ),
  0,
  'la dashboard non vede polizze appartenenti a un’altra agenzia'
);

select isnt_empty(
  $$update public.agenzie set telefono = '+390612345678'
    where id = '10000000-0000-0000-0000-000000000002'
    returning 1$$,
  'l’amministratore può modificare la propria agenzia'
);

select isnt_empty(
  $$update public.utenti set attivo = true
    where id = '20000000-0000-0000-0000-000000000004'
    returning 1$$,
  'l’amministratore può gestire un utente della propria agenzia'
);

select throws_ok(
  $$select public.crea_agenzia_con_amministratore(
      '20000000-0000-0000-0000-000000000005',
      'Agenzia vietata', 'vietata@test.local', null, 'Nome', 'Admin'
    )$$,
  '42501',
  'permission denied for function crea_agenzia_con_amministratore',
  'un utente autenticato non può creare tenant'
);

select is_empty(
  $$update public.clienti set nome = 'Vietato'
    where id = '30000000-0000-0000-0000-000000000001'
    returning 1$$,
  'l’amministratore non modifica clienti di un altro tenant'
);

-- Il ruolo anon non ha grant Data API sulle tabelle applicative.
reset role;
set local role anon;

select throws_ok(
  $$select * from public.clienti$$,
  '42501',
  'permission denied for table clienti',
  'il ruolo anon non può leggere i clienti'
);

select throws_ok(
  $$select public.rinnova_polizza(
      '50000000-0000-0000-0000-000000000002',
      current_date + 500
    )$$,
  '42501',
  'permission denied for function rinnova_polizza',
  'il ruolo anon non può richiamare il rinnovo'
);

select throws_ok(
  $$select public.crea_agenzia_con_amministratore(
      '20000000-0000-0000-0000-000000000005',
      'Agenzia anonima', 'anonima@test.local', null, 'Nome', 'Admin'
    )$$,
  '42501',
  'permission denied for function crea_agenzia_con_amministratore',
  'il ruolo anon non può creare tenant'
);

reset role;
set local role service_role;

select lives_ok(
  $$select public.crea_agenzia_con_amministratore(
      '20000000-0000-0000-0000-000000000005',
      'Agenzia Bootstrap', 'BOOTSTRAP@test.local', '', 'Paola', 'Proprietaria'
    )$$,
  'il service role crea agenzia e amministratore atomicamente'
);

reset role;

select is(
  (
    select count(*)::integer
    from public.agenzie as a
    join public.utenti as u on u.agenzia_id = a.id
    where a.nome = 'Agenzia Bootstrap'
      and a.email = 'bootstrap@test.local'
      and u.id = '20000000-0000-0000-0000-000000000005'
      and u.ruolo = 'amministratore'
  ),
  1,
  'il bootstrap salva insieme il tenant e il suo amministratore'
);

select * from finish();
rollback;
