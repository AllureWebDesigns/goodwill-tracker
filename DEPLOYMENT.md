# Goodwill Donations Tracker — Deployment Guide

Your app is ready to deploy live. Here's exactly how to do it in 15 minutes.

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in (create account if needed)
2. Click **"New Project"**
3. Choose a project name: `goodwill-tracker`
4. Choose a region (pick closest to you, e.g., us-west-1 for US)
5. Set a secure database password (save this)
6. Click **"Create New Project"** and wait ~2 minutes for setup

## Step 2: Set Up the Database

Once your Supabase project is ready:

1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New Query"** 
3. Copy the entire contents of `supabase.sql` from this folder
4. Paste it into the SQL editor
5. Click **"Run"** (or Cmd+Enter)
6. You should see "Success" — the donations table is now created

## Step 3: Get Your Supabase Credentials

1. Go to **Settings** → **API** (left sidebar)
2. Copy your **Project URL** (looks like `https://xxx.supabase.co`)
3. Copy the **anon public key** (under "Project API keys")
4. Save these — you'll need them in Step 5

## Step 4: Set Up Vercel Deployment

### Option A: Deploy via GitHub (Recommended)

1. Push this folder to GitHub:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/goodwill-tracker
   git push -u origin main
   ```

2. Go to https://vercel.com and sign in with GitHub

3. Click **"New Project"**

4. Find your `goodwill-tracker` repo and click **Import**

5. Under "Environment Variables", add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase Project URL (from Step 3)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your anon key (from Step 3)
   - `ANTHROPIC_API_KEY` → your Claude API key (get from https://console.anthropic.com)

6. Click **Deploy**

7. Wait ~3 minutes. You'll get a live URL like `https://goodwill-tracker-xxx.vercel.app`

### Option B: Deploy Manually (No Git Required)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. In this folder, run:
   ```bash
   vercel
   ```

3. Follow prompts (link GitHub account or create Vercel account)

4. When asked about environment variables, paste:
   - `NEXT_PUBLIC_SUPABASE_URL` 
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`

5. Deployment happens automatically

## Step 5: Get Your Claude API Key

1. Go to https://console.anthropic.com/account/keys
2. Click **Create Key**
3. Copy it and add to Vercel environment variables (see Step 4)

## Step 6: First Use

1. Visit your Vercel URL (e.g., `https://goodwill-tracker-xxx.vercel.app`)
2. Click **"Add donation"**
3. Take a photo or upload one
4. AI will auto-analyze the item
5. Edit if needed, save

**Done!** Your tracker is now live and saves everything to Supabase.

---

## Troubleshooting

### "Can't connect to Supabase"
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are in Vercel environment variables
- Verify they're exactly correct (copy/paste, no extra spaces)
- Redeploy after adding env vars

### "Photo analysis not working"
- Make sure `ANTHROPIC_API_KEY` is set in Vercel
- Check you have API credits at https://console.anthropic.com/account/billing/overview

### "Photos not saving"
- Photos are stored as base64 data in the database (in `photo_url` field)
- No separate file storage needed — they're inline in the database

### Need to make changes?
- Edit code locally
- Push to GitHub
- Vercel auto-redeploys on push

---

## Local Development

If you want to test before deploying:

1. Clone this folder
2. Copy `.env.local.example` to `.env.local`
3. Fill in your Supabase + Claude keys
4. Run:
   ```bash
   npm install
   npm run dev
   ```
5. Open http://localhost:3000

---

## Mobile-First Design

The app is optimized for mobile. On iPhone/Android:
- **Camera capture** works via the file input (`capture="environment"`)
- **Photos** are compressed before storing (~200KB each)
- **Storage** uses Supabase PostgreSQL (no size limits for reasonable use)

---

## Features

✅ Photo capture with auto-analysis (Claude AI)  
✅ FMV estimate tracking  
✅ Category, condition, quantity  
✅ Running total + category breakdown  
✅ Year & category filtering  
✅ CSV export for taxes  
✅ Fully responsive (mobile, tablet, desktop)  
✅ Persistent storage (Supabase)  
✅ Live deployment (Vercel)  

---

## Questions?

- Supabase docs: https://supabase.com/docs
- Vercel docs: https://vercel.com/docs
- Claude API: https://docs.anthropic.com
