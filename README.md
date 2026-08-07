# MirrorFit

MirrorFit is a Next.js 14 web app for the YouCam API Skin AI & Apparel VTO Hackathon.

## Inspiration

Many virtual try-on demos focus only on fit and overlook skin harmony. In styling workflows, shoppers often ask, "Does this color actually flatter me?" MirrorFit was built to answer that question with transparent logic: skin analysis first, deterministic color/fabric filtering second, and virtual try-on third.

## What It Does

MirrorFit runs a 3-step flow:

1. Upload Photo
2. Skin Analysis Results
3. Virtual Try-On

The app sends the user photo to a server route that calls YouCam Skin AI (or fallback mock data if unavailable). It reads redness, undertone, and skin type. Then a deterministic TypeScript rule engine converts those values into:

- Allowed clothing colors
- Blocked clothing colors
- Recommended fabrics
- A plain-language reason string

Only after that filtering stage does MirrorFit send garment + user images to the Apparel VTO route.

## How We Built It

- Next.js 14 App Router + TypeScript
- Tailwind CSS for responsive UI
- Recharts for a B2B analytics mock dashboard
- API isolation in App Router endpoints:
  - `/app/api/skin-analysis/route.ts`
  - `/app/api/apparel-vto/route.ts`

### Authentication Notes (Official Docs)

- For the v2 endpoints used here (AI Skin Analysis and AI Clothes), Perfect Corp docs specify bearer API key auth directly:
  - `Authorization: Bearer YOUR_API_KEY`
- We still keep `YOUCAM_API_SECRET` in environment config for other YouCam products/flows that may require key+secret token exchange.

### Core Technical Decision: Deterministic Rule Engine

The key differentiator is `lib/ruleEngine.ts`.

- AI is used only for raw measurements (redness, undertone, skin type).
- Styling decisions are **not AI-generated**.
- A fixed, commented, deterministic rule table gates which colors and fabrics are acceptable.
- This makes recommendations auditable, repeatable, and easy for judges/retail partners to trust.

## Challenges We Ran Into

- Designing robust fallback behavior so live demos never fail during API outages or quota limits.
- Keeping API calls server-only while still providing immediate UI feedback.
- Converting skin signals into clear, explainable style rules without overfitting to one profile.

## Accomplishments

- End-to-end 3-step MirrorFit wizard is fully functional.
- Harmony Score is visible and explained via deterministic reasons.
- Every API route has graceful fallback-to-mock handling.
- Added a B2B analytics angle for retailer monetization storytelling.

## What’s Next

- Connect real YouCam production endpoints and garment catalogs.
- Add retailer-specific rule presets (luxury, sport, seasonal capsules).
- Expand analytics from mock trends to real cohort-level recommendation outcomes.
- Add user closet persistence and post-try-on conversion tracking.

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.local.example .env.local
```

3. Add your YouCam key in `.env.local`.

4. Start development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`.
