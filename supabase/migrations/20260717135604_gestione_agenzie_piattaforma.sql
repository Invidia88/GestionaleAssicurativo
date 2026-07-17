-- Garantisce un solo amministratore per agenzia senza limitare i collaboratori.
create unique index utenti_un_amministratore_per_agenzia_idx
on public.utenti (agenzia_id)
where ruolo = 'amministratore';

-- Il proprietario della piattaforma invita prima l'identità Auth e richiama
-- questa funzione con la Secret Key. I due inserimenti condividono la stessa
-- transazione implicita della funzione: o vengono salvati entrambi o nessuno.
create or replace function public.crea_agenzia_con_amministratore(
  p_utente_id uuid,
  p_nome_agenzia text,
  p_email_agenzia text,
  p_telefono_agenzia text,
  p_nome_amministratore text,
  p_cognome_amministratore text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  nuova_agenzia_id uuid;
begin
  insert into public.agenzie (nome, email, telefono)
  values (
    btrim(p_nome_agenzia),
    lower(btrim(p_email_agenzia)),
    nullif(btrim(p_telefono_agenzia), '')
  )
  returning id into nuova_agenzia_id;

  insert into public.utenti (
    id,
    agenzia_id,
    nome,
    cognome,
    ruolo,
    attivo
  ) values (
    p_utente_id,
    nuova_agenzia_id,
    btrim(p_nome_amministratore),
    btrim(p_cognome_amministratore),
    'amministratore',
    true
  );

  return nuova_agenzia_id;
end;
$$;

revoke all on function public.crea_agenzia_con_amministratore(
  uuid, text, text, text, text, text
) from public, anon, authenticated;

grant select, insert, update on table public.agenzie to service_role;
grant select, insert on table public.utenti to service_role;
grant execute on function public.crea_agenzia_con_amministratore(
  uuid, text, text, text, text, text
) to service_role;

comment on function public.crea_agenzia_con_amministratore(
  uuid, text, text, text, text, text
) is 'Crea atomicamente una nuova agenzia e il suo unico amministratore; uso server-side riservato al service_role.';
