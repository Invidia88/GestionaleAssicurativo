-- Schema iniziale di GestionaleAssicurativo.
-- Le sole tabelle pubbliche sono le sei entità richieste dal gestionale.

alter database postgres set timezone to 'Europe/Rome';

create table public.agenzie (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  telefono text,
  firma_whatsapp text,
  messaggio_whatsapp text,
  giorni_preavviso smallint not null default 30,
  attiva boolean not null default true,
  creato_il timestamptz not null default now(),
  aggiornato_il timestamptz not null default now(),
  constraint agenzie_nome_non_vuoto check (char_length(btrim(nome)) between 1 and 120),
  constraint agenzie_email_valida check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  constraint agenzie_telefono_normalizzato check (
    telefono is null or telefono ~ '^\+?[0-9]{8,15}$'
  ),
  constraint agenzie_giorni_preavviso_validi check (giorni_preavviso between 1 and 365)
);

create table public.utenti (
  id uuid primary key references auth.users(id) on delete cascade,
  agenzia_id uuid not null references public.agenzie(id) on delete restrict,
  nome text not null,
  cognome text not null,
  ruolo text not null,
  attivo boolean not null default true,
  creato_il timestamptz not null default now(),
  aggiornato_il timestamptz not null default now(),
  constraint utenti_nome_non_vuoto check (char_length(btrim(nome)) between 1 and 80),
  constraint utenti_cognome_non_vuoto check (char_length(btrim(cognome)) between 1 and 80),
  constraint utenti_ruolo_valido check (ruolo in ('amministratore', 'collaboratore')),
  constraint utenti_id_agenzia_univoci unique (id, agenzia_id)
);

create table public.clienti (
  id uuid primary key default gen_random_uuid(),
  agenzia_id uuid not null references public.agenzie(id) on delete restrict,
  nome text not null,
  cognome text not null,
  telefono text not null,
  email text,
  note text,
  creato_il timestamptz not null default now(),
  aggiornato_il timestamptz not null default now(),
  constraint clienti_nome_non_vuoto check (char_length(btrim(nome)) between 1 and 80),
  constraint clienti_cognome_non_vuoto check (char_length(btrim(cognome)) between 1 and 80),
  constraint clienti_telefono_normalizzato check (telefono ~ '^\+?[0-9]{8,15}$'),
  constraint clienti_email_valida check (
    email is null or email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  constraint clienti_id_agenzia_univoci unique (id, agenzia_id)
);

create table public.compagnie (
  id uuid primary key default gen_random_uuid(),
  agenzia_id uuid not null references public.agenzie(id) on delete restrict,
  nome text not null,
  sito_web text,
  attiva boolean not null default true,
  creato_il timestamptz not null default now(),
  aggiornato_il timestamptz not null default now(),
  constraint compagnie_nome_non_vuoto check (char_length(btrim(nome)) between 1 and 120),
  constraint compagnie_sito_web_valido check (
    sito_web is null or sito_web ~* '^https?://[^[:space:]]+$'
  ),
  constraint compagnie_id_agenzia_univoci unique (id, agenzia_id)
);

create table public.polizze (
  id uuid primary key default gen_random_uuid(),
  agenzia_id uuid not null references public.agenzie(id) on delete restrict,
  cliente_id uuid not null,
  compagnia_id uuid not null,
  tipo text not null,
  numero_polizza text,
  targa text,
  data_scadenza date not null,
  premio numeric(12, 2),
  stato text not null default 'attiva',
  note text,
  creato_il timestamptz not null default now(),
  aggiornato_il timestamptz not null default now(),
  constraint polizze_tipo_non_vuoto check (char_length(btrim(tipo)) between 1 and 100),
  constraint polizze_premio_valido check (premio is null or premio >= 0),
  constraint polizze_stato_valido check (stato in ('attiva', 'rinnovata', 'annullata')),
  constraint polizze_id_agenzia_univoci unique (id, agenzia_id),
  constraint polizze_cliente_stessa_agenzia
    foreign key (cliente_id, agenzia_id)
    references public.clienti(id, agenzia_id)
    on delete restrict,
  constraint polizze_compagnia_stessa_agenzia
    foreign key (compagnia_id, agenzia_id)
    references public.compagnie(id, agenzia_id)
    on delete restrict
);

create table public.contatti (
  id uuid primary key default gen_random_uuid(),
  agenzia_id uuid not null references public.agenzie(id) on delete restrict,
  cliente_id uuid not null,
  polizza_id uuid,
  utente_id uuid not null,
  tipo_contatto text not null,
  esito text not null,
  messaggio text,
  contattato_il timestamptz not null default now(),
  note text,
  constraint contatti_tipo_valido check (
    tipo_contatto in ('whatsapp', 'telefono', 'email', 'altro')
  ),
  constraint contatti_esito_valido check (
    esito in (
      'contattato',
      'nessuna_risposta',
      'da_ricontattare',
      'numero_non_valido',
      'preventivo_inviato'
    )
  ),
  constraint contatti_cliente_stessa_agenzia
    foreign key (cliente_id, agenzia_id)
    references public.clienti(id, agenzia_id)
    on delete restrict,
  constraint contatti_polizza_stessa_agenzia
    foreign key (polizza_id, agenzia_id)
    references public.polizze(id, agenzia_id)
    on delete set null (polizza_id),
  constraint contatti_utente_stessa_agenzia
    foreign key (utente_id, agenzia_id)
    references public.utenti(id, agenzia_id)
    on delete restrict
);

-- Indici usati dalle liste, dai filtri e dalle policy multi-tenant.
create index utenti_agenzia_id_idx on public.utenti (agenzia_id);
create index clienti_agenzia_id_idx on public.clienti (agenzia_id);
create index clienti_agenzia_cognome_idx on public.clienti (agenzia_id, cognome);
create index compagnie_agenzia_id_idx on public.compagnie (agenzia_id);
create unique index compagnie_agenzia_nome_univoco_idx
  on public.compagnie (agenzia_id, lower(btrim(nome)));
create index polizze_agenzia_id_idx on public.polizze (agenzia_id);
create index polizze_agenzia_scadenza_idx on public.polizze (agenzia_id, data_scadenza);
create index polizze_cliente_agenzia_idx on public.polizze (cliente_id, agenzia_id);
create index polizze_compagnia_agenzia_idx on public.polizze (compagnia_id, agenzia_id);
create index contatti_agenzia_contattato_idx on public.contatti (agenzia_id, contattato_il);
create index contatti_cliente_agenzia_idx on public.contatti (cliente_id, agenzia_id);
create index contatti_polizza_agenzia_idx on public.contatti (polizza_id, agenzia_id);
create index contatti_utente_agenzia_idx on public.contatti (utente_id, agenzia_id);

-- Le funzioni privilegiate non sono esposte tramite la Data API.
create schema if not exists privato;
revoke all on schema privato from public, anon;
grant usage on schema privato to authenticated;

create function privato.agenzia_utente_corrente()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select u.agenzia_id
  from public.utenti as u
  where u.id = (select auth.uid())
    and u.attivo = true
  limit 1
$$;

create function privato.ruolo_utente_corrente()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select u.ruolo
  from public.utenti as u
  where u.id = (select auth.uid())
    and u.attivo = true
  limit 1
$$;

revoke all on function privato.agenzia_utente_corrente() from public, anon;
revoke all on function privato.ruolo_utente_corrente() from public, anon;
grant execute on function privato.agenzia_utente_corrente() to authenticated;
grant execute on function privato.ruolo_utente_corrente() to authenticated;

create function privato.imposta_aggiornato_il()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.aggiornato_il := now();
  return new;
end;
$$;

create function privato.impedisci_modifica_agenzia_id()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.agenzia_id is distinct from old.agenzia_id then
    raise exception using
      errcode = '23514',
      message = 'agenzia_id non può essere modificato';
  end if;
  return new;
end;
$$;

revoke all on function privato.imposta_aggiornato_il() from public, anon, authenticated;
revoke all on function privato.impedisci_modifica_agenzia_id() from public, anon, authenticated;

create trigger agenzie_imposta_aggiornato_il
before update on public.agenzie
for each row execute function privato.imposta_aggiornato_il();

create trigger utenti_imposta_aggiornato_il
before update on public.utenti
for each row execute function privato.imposta_aggiornato_il();
create trigger utenti_impedisci_modifica_agenzia
before update on public.utenti
for each row execute function privato.impedisci_modifica_agenzia_id();

create trigger clienti_imposta_aggiornato_il
before update on public.clienti
for each row execute function privato.imposta_aggiornato_il();
create trigger clienti_impedisci_modifica_agenzia
before update on public.clienti
for each row execute function privato.impedisci_modifica_agenzia_id();

create trigger compagnie_imposta_aggiornato_il
before update on public.compagnie
for each row execute function privato.imposta_aggiornato_il();
create trigger compagnie_impedisci_modifica_agenzia
before update on public.compagnie
for each row execute function privato.impedisci_modifica_agenzia_id();

create trigger polizze_imposta_aggiornato_il
before update on public.polizze
for each row execute function privato.imposta_aggiornato_il();
create trigger polizze_impedisci_modifica_agenzia
before update on public.polizze
for each row execute function privato.impedisci_modifica_agenzia_id();

create trigger contatti_impedisci_modifica_agenzia
before update on public.contatti
for each row execute function privato.impedisci_modifica_agenzia_id();

alter table public.agenzie enable row level security;
alter table public.utenti enable row level security;
alter table public.clienti enable row level security;
alter table public.compagnie enable row level security;
alter table public.polizze enable row level security;
alter table public.contatti enable row level security;

-- Grant Data API espliciti: anon non può accedere alle tabelle applicative.
revoke all on table public.agenzie, public.utenti, public.clienti,
  public.compagnie, public.polizze, public.contatti from anon;

grant select, update on table public.agenzie to authenticated;
grant select, insert, update on table public.utenti to authenticated;
grant select, insert, update, delete on table public.clienti to authenticated;
grant select, insert, update, delete on table public.compagnie to authenticated;
grant select, insert, update, delete on table public.polizze to authenticated;
grant select, insert on table public.contatti to authenticated;

-- Agenzia: tutti i membri attivi leggono, solo l'amministratore modifica.
create policy "agenzia leggibile dai propri utenti"
on public.agenzie for select
to authenticated
using (id = (select privato.agenzia_utente_corrente()));

create policy "agenzia modificabile dagli amministratori"
on public.agenzie for update
to authenticated
using (
  id = (select privato.agenzia_utente_corrente())
  and (select privato.ruolo_utente_corrente()) = 'amministratore'
)
with check (
  id = (select privato.agenzia_utente_corrente())
  and (select privato.ruolo_utente_corrente()) = 'amministratore'
);

-- Utenti: la lettura serve anche a mostrare l'operatore nei contatti.
create policy "utenti leggibili nella propria agenzia"
on public.utenti for select
to authenticated
using (agenzia_id = (select privato.agenzia_utente_corrente()));

create policy "utenti inseribili dagli amministratori"
on public.utenti for insert
to authenticated
with check (
  agenzia_id = (select privato.agenzia_utente_corrente())
  and (select privato.ruolo_utente_corrente()) = 'amministratore'
);

create policy "utenti modificabili dagli amministratori"
on public.utenti for update
to authenticated
using (
  agenzia_id = (select privato.agenzia_utente_corrente())
  and (select privato.ruolo_utente_corrente()) = 'amministratore'
)
with check (
  agenzia_id = (select privato.agenzia_utente_corrente())
  and (select privato.ruolo_utente_corrente()) = 'amministratore'
);

-- Clienti, compagnie e polizze: CRUD per entrambi i ruoli nel proprio tenant.
create policy "clienti leggibili nella propria agenzia"
on public.clienti for select to authenticated
using (agenzia_id = (select privato.agenzia_utente_corrente()));
create policy "clienti inseribili nella propria agenzia"
on public.clienti for insert to authenticated
with check (agenzia_id = (select privato.agenzia_utente_corrente()));
create policy "clienti modificabili nella propria agenzia"
on public.clienti for update to authenticated
using (agenzia_id = (select privato.agenzia_utente_corrente()))
with check (agenzia_id = (select privato.agenzia_utente_corrente()));
create policy "clienti eliminabili nella propria agenzia"
on public.clienti for delete to authenticated
using (agenzia_id = (select privato.agenzia_utente_corrente()));

create policy "compagnie leggibili nella propria agenzia"
on public.compagnie for select to authenticated
using (agenzia_id = (select privato.agenzia_utente_corrente()));
create policy "compagnie inseribili nella propria agenzia"
on public.compagnie for insert to authenticated
with check (agenzia_id = (select privato.agenzia_utente_corrente()));
create policy "compagnie modificabili nella propria agenzia"
on public.compagnie for update to authenticated
using (agenzia_id = (select privato.agenzia_utente_corrente()))
with check (agenzia_id = (select privato.agenzia_utente_corrente()));
create policy "compagnie eliminabili nella propria agenzia"
on public.compagnie for delete to authenticated
using (agenzia_id = (select privato.agenzia_utente_corrente()));

create policy "polizze leggibili nella propria agenzia"
on public.polizze for select to authenticated
using (agenzia_id = (select privato.agenzia_utente_corrente()));
create policy "polizze inseribili nella propria agenzia"
on public.polizze for insert to authenticated
with check (agenzia_id = (select privato.agenzia_utente_corrente()));
create policy "polizze modificabili nella propria agenzia"
on public.polizze for update to authenticated
using (agenzia_id = (select privato.agenzia_utente_corrente()))
with check (agenzia_id = (select privato.agenzia_utente_corrente()));
create policy "polizze eliminabili nella propria agenzia"
on public.polizze for delete to authenticated
using (agenzia_id = (select privato.agenzia_utente_corrente()));

-- Contatti: storico consultabile e append-only per gli utenti del tenant.
create policy "contatti leggibili nella propria agenzia"
on public.contatti for select to authenticated
using (agenzia_id = (select privato.agenzia_utente_corrente()));

create policy "contatti registrabili nella propria agenzia"
on public.contatti for insert to authenticated
with check (
  agenzia_id = (select privato.agenzia_utente_corrente())
  and utente_id = (select auth.uid())
);
