# PaddleToWater

A spot discovery map for stand-up paddleboarders in the SF Bay Area.

**Live:** [paddletowater.com](https://paddletowater.com)

## What it does

- 73 geocoded SUP launch spots across the Bay Area
- Filter by region, water type (flatwater / bay / river), and free-only access
- Interactive map with color-coded pins + detail drawer for each spot
- Feedback form for suggestions and corrections

## Stack

- Next.js 16 (App Router, fully static)
- Tailwind CSS v4
- React Leaflet
- Formspree (contact form)
- Deployed on Vercel

## Data

All spot data lives in `data/spots.json` (73 spots, committed). The source is `raw-data/sup.xlsx`, geocoded via `raw-data/phase0_geocode.py`. To refresh the data, re-run the script and commit the updated JSON.

## Dev

```bash
npm run dev       # http://localhost:3000
npm run build     # production build
vercel --prod --yes  # deploy
```

## Roadmap

- **V1:** Supabase auth + ratings + trip reports + photo uploads
- **V2:** Community spot submissions, tide/wind API overlay
