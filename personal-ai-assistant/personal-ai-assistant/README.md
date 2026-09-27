# Personal AI Assistant v1

Modules: Study, SutaOshon, Soulful Ayhas, Approval.

## Environment variables
Create `.env.local` from `.env.example`:
NEXT_PUBLIC_SUPABASE_URL=your Supabase API URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your Supabase publishable/anon key

Never use the Supabase secret/service-role key in `NEXT_PUBLIC_` variables or browser code.

## Run locally
npm install
npm run dev

## Deploy to Vercel
Import this project into GitHub, then import the repository into Vercel. Add the two environment variables in Vercel Project Settings > Environment Variables.

## Current scope
This is a dashboard starter. It does NOT automatically publish to Facebook/Instagram. Approval is required and publishing integration can be added later.
