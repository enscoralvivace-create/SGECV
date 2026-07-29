insert into public.fee_types (
    name,
    description,
    category,
    default_amount,
    is_active
)
select
    'Mensualidad',
    'Cuota mensual ordinaria del Ensamble Coral Vivace.',
    'Ordinaria',
    300.00,
    true
where not exists (
    select 1
    from public.fee_types
    where lower(name) = lower('Mensualidad')
);