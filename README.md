# Kompas — Freelancer dashboard

A React implementation of the "Kompas" freelancer dashboard design (opdrachten,
klanten, offertes en facturen voor ZZP'ers). Built from the Claude Design
handoff bundle in `../project`.

## Stack

- **React 18 + TypeScript** — typed domain models, no runtime type surprises
- **Vite** — dev server + production build
- **React Router** — one route per screen, deep-linkable detail/editor pages
- **Supabase** — authentication + per-user Postgres storage (the only backend)

## Setup

There is **no demo data** — every account starts empty, so you must register
first. The app needs a Supabase project:

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](./supabase/schema.sql).
   This creates the tables, row-level-security policies (each user only sees
   their own rows) and a trigger that fills the `profiles` row on sign-up.
3. Copy `.env.example` to `.env` and fill in your project's URL + anon key
   (Supabase dashboard → Project Settings → API).
4. (Optional, for the smoothest local flow) disable "Confirm email" under
   Authentication → Providers → Email, so a new account is signed in
   immediately. With confirmation on, users get a mail and log in afterwards.

Without a valid `.env` the app shows a setup screen instead of crashing.

## Run

```bash
npm install
npm run dev        # dev server with HMR
npm run build      # typecheck (tsc) + production build to dist/
npm run preview    # serve the production build
npm run typecheck  # types only
```

## Online zetten (deploy)

Dit is een statische Vite-SPA, dus elke statische host werkt. Het project staat
in de submap `app/`, dus zet de **root/base directory op `app`**.

**Vercel (aanbevolen)**
1. vercel.com → New Project → importeer de GitHub-repo.
2. **Root Directory: `app`** · Framework: Vite · Build: `npm run build` · Output: `dist`.
3. Environment Variables: `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY`.
4. Deploy. `vercel.json` regelt de SPA-routing (alles → `index.html`).

**Netlify (alternatief)**
- Base directory: `app` · Build: `npm run build` · Publish: `app/dist`.
- Env vars idem. `public/_redirects` regelt de SPA-routing.

**Daarna in Supabase** (Authentication → URL Configuration):
- Zet **Site URL** op je live-URL (bv. `https://kompas.vercel.app`).
- Voeg diezelfde URL toe aan **Redirect URLs** (nodig als e-mailbevestiging aanstaat).

De keys staan alleen in de host-env — nooit in git (`.env` is genegeerd). De
anon key is bedoeld om publiek in de frontend te staan; RLS beveiligt de data.

## Accounts

- **Register** (`/register`) collects e-mail + password plus the freelancer's
  business details (naam, bedrijf, adres, IBAN, KVK, BTW). These appear as the
  sender on every offerte/factuur and in the sidebar.
- **Login** (`/login`) restores the session; the session persists across
  reloads. Everything under the app shell is gated — signed-out users are sent
  to `/login`.
- Sign out from the button next to your name in the sidebar.

## Screens

| Route | Scherm |
| --- | --- |
| `/` | Dashboard — twee varianten: **Overzicht** (KPI-cards + lijsten) en **Focus** (omzetgrafiek + "actie vereist") |
| `/opdrachten`, `/opdrachten/:id` | Opdrachtenlijst + detail (urenregistratie, klant- en offertekoppeling) |
| `/klanten`, `/klanten/:id` | Klantenlijst + detail (historie: opdrachten, offertes, facturen) |
| `/offertes`, `/offertes/:id` | Offertelijst + editor met bewerkbare regels, BTW-groepen en live PDF-preview |
| `/facturen`, `/facturen/:id` | Facturenlijst + editor met vervaldatum, PDF-preview en PDF-export |

## Architecture notes

- **Geen fictieve data.** Alle klanten, opdrachten, offertes en facturen zijn
  per gebruiker opgeslagen in Supabase en beveiligd met row-level security. Een
  nieuw account is volledig leeg; overal zijn er lege staten en je maakt zelf
  klanten/opdrachten/offertes/facturen aan.
- **Responsive, niet twee apps.** De originele prototype had een desktop/mobiel
  toggle met een nep-telefoonframe. Hier is dat echte responsive gedrag: onder
  760px schakelt de layout naar kaartlijsten + bottom-nav (`useIsMobile`),
  daarboven de sidebar + tabellen. Elk scherm rendert beide varianten.
- **Bedragen worden afgeleid, nooit hardgecodeerd.** Elke offerte en factuur
  heeft eigen regelitems; de bedragen in lijsten, dashboards en klanthistorie
  komen uit `computeTotals()` over die regels — zo kan niets uit sync raken.
- **State** zit in één `StoreProvider` (`src/store.tsx`): het laadt de data van
  de gebruiker bij inloggen en schrijft mutaties terug naar Supabase
  (regelwijzigingen met een debounce, nieuwe documenten direct). Filters en de
  dashboard-variant blijven behouden tijdens navigatie; geselecteerde
  entiteiten komen uit de URL.
- **Auth** zit in `src/auth.tsx` (sessie + profiel) met een `RequireAuth`-gate.
- **Accent** staat centraal in `src/theme.ts` (default Indigo, à la Stripe).

### Layout

```
src/
  main.tsx, App.tsx        router + providers (Auth → Store → Router)
  auth.tsx                 sessie, profiel, RequireAuth-gate
  types.ts, data.ts        domeinmodellen + datum-helpers (geen data)
  theme.ts, format.ts      accent/kleuren + euro/BTW/formatters
  store.tsx                Supabase-backed state + afgeleide lookups
  lib/                     supabase client, db (CRUD), debounce
  hooks/                   useIsMobile, useIdentity
  components/              Layout, Sidebar, MobileNav, Pill, ui, icons,
                          AuthLayout, Modal, EmptyState, New*Modal,
                          LineItemsEditor, DocumentPreview
  screens/                Login, Register, SetupNeeded + de 9 app-schermen
supabase/schema.sql        tabellen, RLS-policies, profiel-trigger
```
