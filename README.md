# Goodwill Donations Tracker

A mobile-first web app for tracking charitable donations with photos, AI-powered valuation estimates, and CSV export for tax season.

**Live in 15 minutes:** See `DEPLOYMENT.md` for exact setup steps.

## Features

- 📸 **Photo Capture** — Use your phone camera or upload files
- 🤖 **AI Valuation** — Claude analyzes photos and suggests fair market value
- 📊 **Running Totals** — Track by category, filter by year
- 🎁 **Full Details** — Date, condition, quantity, notes
- 📥 **CSV Export** — For your CPA at tax time
- 📱 **Mobile-First** — Optimized for phone, works everywhere

## Tech Stack

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **Photo Analysis:** Anthropic Claude API

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Fill in your keys:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - ANTHROPIC_API_KEY

# Run dev server
npm run dev
```

Visit http://localhost:3000

## Deployment

See `DEPLOYMENT.md` for complete Supabase + Vercel setup (takes ~15 minutes).

## Architecture

- **Database:** Single `donations` table with 8 fields (id, description, date, category, condition, quantity, value, notes, photo_url, created_at)
- **Photos:** Stored as base64 data URLs in the database (compressed to ~200KB each)
- **API:** REST endpoints for CRUD + photo analysis
- **Auth:** None (single-user app for now; easily added via Supabase RLS if needed)

## Photo Analysis

When you upload a photo:

1. Image is compressed (1400px max, JPEG quality 0.78) for fast storage
2. Sent to Claude API with prompt for analysis
3. Claude returns: description, category, condition, suggested value, reasoning
4. Form pre-fills with suggestions (you can edit before saving)

No photos are stored externally — all data lives in your Supabase database.

## Files Structure

```
goodwill-tracker-app/
├── app/
│   ├── api/
│   │   ├── donations/          # GET all, POST new
│   │   ├── donations/[id]/      # DELETE, PATCH
│   │   └── analyze-photo/       # POST photo analysis
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main tracker page
│   └── globals.css
├── lib/
│   └── supabase.ts             # Supabase client + types
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── .env.local.example          # Template for env vars
├── supabase.sql                # Database schema
├── DEPLOYMENT.md               # Full setup guide
└── README.md                   # This file
```

## IRS / Tax Notes

For non-cash charitable donations:
- **≤ $500 total per year:** Keep receipt + photo + estimate. Form 8283 not required.
- **> $500:** Same + Form 8283 Section A (non-qualified property).
- **> $5,000:** Requires qualified appraiser + Form 8283 Section B.

This tracker generates the documentation. Get a Goodwill receipt at drop-off.

## Future Enhancements

- [ ] Multi-user with auth (Supabase RLS)
- [ ] Bulk upload (CSV import)
- [ ] Recurring donations
- [ ] Tax form auto-generation (Form 8283)
- [ ] Sync across devices
- [ ] Dark mode toggle

## License

MIT — use freely.

---

**Questions?** See DEPLOYMENT.md or check the code comments.
