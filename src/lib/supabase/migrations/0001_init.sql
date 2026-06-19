-- =============================================================
-- PACK OPENING — Argentina Qatar 2022
-- 0001_init.sql
-- =============================================================


-- =============================================================
-- TABLAS
-- =============================================================

create table public.cards (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  position             text not null,        -- POR | DEF | MED | DEL
  club                 text not null,
  rarity               text not null,        -- comun | infrecuente | raro | epico | legendario
  rarity_probability   decimal(5,2) not null, -- probabilidad del tier (0.01 a 0.60)
  rating               int not null,         -- rating general 1-100
  goals_in_wc          int not null default 0,
  imagen_url           text default 'https://cdn-icons-png.freepik.com/512/5281/5281563.png',                 -- URL de la imagen del jugador
  created_at           timestamptz default now()
);

create table public.user_cards (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  card_id      uuid not null references public.cards(id),
  obtained_at  timestamptz default now()
);

-- Índice para que la query del perfil sea rápida
create index idx_user_cards_user_id on public.user_cards(user_id);


-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

alter table public.cards     enable row level security;
alter table public.user_cards enable row level security;

-- Cards: cualquier usuario autenticado puede leer el catálogo
create policy "cards_select"
  on public.cards for select
  to authenticated
  using (true);

-- User cards: cada usuario solo ve y crea sus propias cartas
create policy "user_cards_select"
  on public.user_cards for select
  to authenticated
  using (user_id = auth.uid());

create policy "user_cards_insert"
  on public.user_cards for insert
  to authenticated
  with check (user_id = auth.uid());


-- =============================================================
-- SEED — Plantel Argentina Qatar 2022
--
-- Probabilidades por rareza (tier):
--   legendario  → 1%
--   epico       → 4%
--   raro        → 10%
--   infrecuente → 25%
--   comun       → 60%
-- =============================================================

insert into public.cards (name, position, club, rarity, rarity_probability, rating, goals_in_wc, imagen_url) values

-- -------------------------
-- LEGENDARIO (1%)
-- -------------------------
('Lionel Messi',         'DEL', 'Paris Saint-Germain', 'legendario',  0.01, 99, 7, 'https://i.pinimg.com/1200x/52/3c/c5/523cc597c02121ff971e4ad3ab1b2dd4.jpg'),

-- -------------------------
-- ÉPICO (4%)
-- -------------------------
('Ángel Di María',       'DEL', 'Juventus',            'epico',       0.04, 88, 1, 'https://uniqrenders.com/Uploads/1-11-2023/3916/preview-angel-di-maria-argentina-national-football-team-conmebol-argentina-footballers-render.jpg'),
('Emiliano Martínez',    'POR', 'Aston Villa',         'epico',       0.04, 88, 0, 'https://cdn-img.staticzz.com/img/planteis/new/43/22/8774322_emiliano_martinez_20240515090007.png'),
('Nicolás Otamendi',     'DEF', 'Benfica',             'epico',       0.04, 85, 1, 'https://b.fssta.com/uploads/application/soccer/headshots/8300.vresize.350.350.medium.1.png'),

-- -------------------------
-- RARO (10%)
-- -------------------------
('Rodrigo De Paul',      'MED', 'Atlético de Madrid',  'raro',        0.10, 83, 0, 'https://uniqrenders.com/Uploads/25-9-2024/5705/preview-rodrigo-de-paul-argentina-national-football-team-conmebol-argentina-argentine-footballers-render.jpg'),
('Alexis Mac Allister',  'MED', 'Brighton',            'raro',        0.10, 82, 1, DEFAULT),
('Enzo Fernández',       'MED', 'Benfica',             'raro',        0.10, 82, 1, DEFAULT),
('Julián Álvarez',       'DEL', 'Manchester City',     'raro',        0.10, 82, 4, 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e10449ee-7770-4f46-ac9f-dcae890ef6ea/dhufo4n-2843fb97-cfe8-483d-b647-7f6d766ef9b1.jpg/v1/fill/w_500,h_667,q_75,strp/julian_alvarez_argentina_national_football_team_co_by_uniqrenders_dhufo4n-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NjY3IiwicGF0aCI6Ii9mL2UxMDQ0OWVlLTc3NzAtNGY0Ni1hYzlmLWRjYWU4OTBlZjZlYS9kaHVmbzRuLTI4NDNmYjk3LWNmZTgtNDgzZC1iNjQ3LTdmNmQ3NjZlZjliMS5qcGciLCJ3aWR0aCI6Ijw9NTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.x7ENmCWMFTVKBgzDZ4YuFyK3ajpgx9plkupyYuH8zSg'),

-- -------------------------
-- INFRECUENTE (25%)
-- -------------------------
('Nahuel Molina',        'DEF', 'Atlético de Madrid',  'infrecuente', 0.25, 79, 1, DEFAULT),
('Gonzalo Montiel',      'DEF', 'Sevilla',             'infrecuente', 0.25, 77, 0, DEFAULT),
('Cristian Romero',      'DEF', 'Tottenham',           'infrecuente', 0.25, 81, 0, DEFAULT),
('Lisandro Martínez',    'DEF', 'Manchester United',   'infrecuente', 0.25, 81, 0, DEFAULT),
('Nicolás Tagliafico',   'DEF', 'Lyon',                'infrecuente', 0.25, 78, 0, DEFAULT),
('Leandro Paredes',      'MED', 'Juventus',            'infrecuente', 0.25, 78, 0, DEFAULT),
('Lautaro Martínez',     'DEL', 'Inter de Milán',      'infrecuente', 0.25, 83, 0, DEFAULT),
('Paulo Dybala',         'DEL', 'Roma',                'infrecuente', 0.25, 84, 0, DEFAULT),
('Franco Armani',        'POR', 'River Plate',         'infrecuente', 0.25, 77, 0, DEFAULT),

-- -------------------------
-- COMÚN (60%)
-- -------------------------
('Marcos Acuña',         'DEF', 'Sevilla',             'comun',       0.60, 76, 0, DEFAULT),
('Germán Pezzella',      'DEF', 'Real Betis',          'comun',       0.60, 74, 0, DEFAULT),
('Guido Rodríguez',      'MED', 'Real Betis',          'comun',       0.60, 76, 0, DEFAULT),
('Thiago Almada',        'MED', 'Atlanta United',      'comun',       0.60, 74, 0, DEFAULT),
('Exequiel Palacios',    'MED', 'Bayer Leverkusen',    'comun',       0.60, 75, 0, DEFAULT),
('Alejandro Gómez',      'DEL', 'Sevilla',             'comun',       0.60, 77, 0, DEFAULT),
('Nicolás González',     'DEL', 'Fiorentina',          'comun',       0.60, 76, 0, DEFAULT),
('Ángel Correa',         'DEL', 'Atlético de Madrid',  'comun',       0.60, 76, 0, DEFAULT),
('Gerónimo Rulli',       'POR', 'Ajax',                'comun',       0.60, 74, 0, DEFAULT);