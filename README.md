# Argentina Qatar 2022 Pack Opening

Aplicación de sobres coleccionables inspirada en el plantel argentino del Mundial de Qatar 2022.

## Descripción

Este proyecto es una experiencia interactiva construida con Next.js App Router y Supabase. Los usuarios pueden iniciar sesión con Google, abrir sobres digitales, coleccionar cartas y armar su 11 ideal.

## Tech stack

- Next.js 16.2.9
- React 19.2.4
- TypeScript 5
- Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- Tailwind CSS 4
- HeroUI (`@heroui/react`, `@heroui/styles`)

## Arquitectura

- `src/app/`: rutas de la aplicación usando App Router
- `src/components/`: UI reusable, client components y animaciones
- `src/actions/`: lógica de servidor y acciones de Supabase
- `src/lib/supabase/`: cliente Supabase server/browser y validación de env
- `src/types/`: tipos compartidos del dominio

## Características principales

- Autenticación con Google via Supabase OAuth
- Apertura de sobres con sistema de rarezas y límite diario
- Guardado de cartas obtenidas por usuario
- Formador de equipo con slots por posición
- Uso de Supabase Row-Level Security y acciones de servidor

## Configuración de entorno

Crea un archivo `.env.local` basado en `env.template` y completa los valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

> El proyecto valida que estas variables estén definidas antes de inicializar Supabase.

## Comandos

```bash
npm install
npm run dev
npm run build
npm start
npm run lint
```

- `npm run dev`: inicia el servidor de desarrollo
- `npm run build`: genera el build de producción
- `npm start`: ejecuta la aplicación en modo producción
- `npm run lint`: ejecuta ESLint

## Flujo de usuario

1. El cliente inicia sesión en `/login`
2. Si hay sesión, el usuario puede ir a `/pack` para abrir sobres
3. Cada sobre entrega 5 cartas basadas en rareza
4. Las cartas nuevas se guardan en `user_cards`
5. En `/profile` el usuario ve su colección y arma su 11 ideal

## Base de datos

Las tablas principales son:

- `cards`: catálogo de cartas con rareza y metadata
- `user_cards`: cartas obtenidas por cada usuario
- `pack_opens`: historial de aperturas diarias
- `user_team`: equipo armado por usuario

La lógica de RLS y las políticas de acceso se mantienen en SQL bajo `src/lib/supabase/migrations/0001_init.sql`.

## Buenas prácticas aplicadas

- Tipos de dominio centralizados en `src/types`
- Separación server/client clara
- Validación temprana de variables de entorno
- Uso de componentes servidor donde no se necesita estado cliente
- Manejo explícito de errores de Supabase
- `profile` filtra por `user_id` para mayor seguridad

## Próximas mejoras recomendadas

- Agregar tests unitarios para `open-pack` y `team`
- Usar `next/image` para optimizar las imágenes remotas
- Mejorar el control de límites de apertura con lógica atómica o trigger DB
- Añadir una página de perfil con métricas más detalladas

## Notas

- El proyecto está diseñado para ser simple y mantenible
- El enfoque actual prioriza claridad y seguridad en la integración con Supabase

---

Para cualquier cambio mayor, revisa la carpeta `src/actions` y `src/lib/supabase` primero.
