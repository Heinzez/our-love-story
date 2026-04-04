# The Prettiest Queen Alive

A personalized romantic web application built as a digital love letter.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite (port 5000)
- **Backend**: Express server with TypeScript via tsx (port 3000)
- **Database**: Replit PostgreSQL via Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI)
- **Routing**: React Router DOM v6

## Running the App

```bash
npm run dev
```

This starts both the Express backend (port 3000) and Vite dev server (port 5000) concurrently. Vite proxies `/api` requests to the Express server.

## Key Files

- `src/App.tsx` - Root component with router and providers
- `src/context/SiteContext.tsx` - Global state (auth, notes, email subscription)
- `src/components/AccessGate.tsx` - Security gate (requires specific answer)
- `src/pages/LandingPage.tsx` - Main dashboard with photo gallery
- `src/components/WelcomeNote.tsx` - Daily love note popup
- `server/index.ts` - Express API server
- `server/db.ts` - Database connection (Drizzle + pg)
- `shared/schema.ts` - Database schema (email_subscribers, saved_notes)

## API Endpoints

- `GET /api/saved-notes` - Retrieve all saved notes
- `POST /api/saved-notes` - Save a new note
- `POST /api/subscribe-email` - Subscribe with primary and backup email

## Database

Uses Replit's built-in PostgreSQL. Schema managed with Drizzle Kit.

```bash
npm run db:push   # Push schema changes to database
```

## Build & Deploy

```bash
npm run build    # Builds frontend to dist/public + compiles server
npm start        # Runs production server
```

## Migration Notes

Migrated from Lovable to Replit:
- Replaced Supabase client + Edge Functions with Express API routes
- Replaced Supabase PostgreSQL with Replit PostgreSQL via Drizzle ORM
- Removed lovable-tagger from vite config
- Updated vite to serve on port 5000 with `/api` proxy to Express on port 3000
