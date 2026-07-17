-- Rinnova una polizza in una singola transazione. La funzione usa i privilegi
-- del chiamante: SELECT, INSERT, UPDATE e tutte le policy RLS restano attive.
create or replace function public.rinnova_polizza(
  p_polizza_id uuid,
  p_data_scadenza date,
  p_numero_polizza text default null,
  p_premio numeric default null,
  p_note text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  polizza_precedente public.polizze%rowtype;
  nuova_polizza_id uuid;
begin
  select *
  into polizza_precedente
  from public.polizze
  where id = p_polizza_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Polizza non trovata';
  end if;

  if polizza_precedente.stato <> 'attiva' then
    raise exception using
      errcode = '23514',
      message = 'Solo una polizza attiva può essere rinnovata';
  end if;

  if p_data_scadenza <= polizza_precedente.data_scadenza then
    raise exception using
      errcode = '23514',
      message = 'La nuova scadenza deve essere successiva alla precedente';
  end if;

  if p_premio is not null and p_premio < 0 then
    raise exception using
      errcode = '23514',
      message = 'Il premio non può essere negativo';
  end if;

  insert into public.polizze (
    agenzia_id,
    cliente_id,
    compagnia_id,
    tipo,
    numero_polizza,
    targa,
    data_scadenza,
    premio,
    stato,
    note
  ) values (
    polizza_precedente.agenzia_id,
    polizza_precedente.cliente_id,
    polizza_precedente.compagnia_id,
    polizza_precedente.tipo,
    nullif(btrim(p_numero_polizza), ''),
    polizza_precedente.targa,
    p_data_scadenza,
    p_premio,
    'attiva',
    nullif(btrim(p_note), '')
  )
  returning id into nuova_polizza_id;

  update public.polizze
  set stato = 'rinnovata'
  where id = polizza_precedente.id;

  return nuova_polizza_id;
end;
$$;

revoke all on function public.rinnova_polizza(uuid, date, text, numeric, text)
from public, anon;

grant execute on function public.rinnova_polizza(uuid, date, text, numeric, text)
to authenticated, service_role;

comment on function public.rinnova_polizza(uuid, date, text, numeric, text)
is 'Chiude una polizza attiva come rinnovata e crea la nuova polizza attiva rispettando RLS.';
