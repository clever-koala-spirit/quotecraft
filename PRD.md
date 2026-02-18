# QuoteCraft — Product Requirements Document

**Version:** 1.0
**Date:** 18 February 2026
**Author:** QuoteCraft Product Team
**Status:** Draft — Ready for Review

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Market Analysis](#2-market-analysis)
3. [User Stories & Jobs to Be Done](#3-user-stories--jobs-to-be-done)
4. [Core Features — MVP (Phase 1)](#4-core-features--mvp-phase-1)
5. [Phase 2 Features](#5-phase-2-features)
6. [Phase 3 Features](#6-phase-3-features)
7. [Technical Architecture](#7-technical-architecture)
8. [Data Model](#8-data-model)
9. [API Specification](#9-api-specification)
10. [UI/UX Requirements](#10-uiux-requirements)
11. [Pricing Strategy](#11-pricing-strategy)
12. [Go-to-Market Strategy](#12-go-to-market-strategy)
13. [Success Metrics & KPIs](#13-success-metrics--kpis)
14. [Risk Assessment](#14-risk-assessment)
15. [Legal & Compliance](#15-legal--compliance)
16. [Timeline & Milestones](#16-timeline--milestones)

---

## 1. Executive Summary

### Vision

QuoteCraft is the fastest way for any tradesperson to turn a job description, photo, or document into a professional quote — in 60 seconds or less.

### Mission

Eliminate the quoting bottleneck for sole traders and small trade businesses by replacing spreadsheets, Word docs, and scribbled notes with an AI-powered tool that does one thing brilliantly: quotes.

### Problem Statement

Tradespeople lose revenue and professionalism because quoting is painful:

- **Time drain:** The average tradie spends 3–5 hours per week preparing quotes manually — evenings on the couch, copying and pasting from old quotes in Word or Excel.
- **Lost jobs:** Slow quotes lose jobs. A homeowner requesting quotes from three electricians will hire whoever responds fastest. Studies show 44% of customers go with the first quote received.
- **Unprofessional output:** Hand-typed emails or scribbled estimates on the back of a business card undermine credibility and make it harder to charge premium rates.
- **Existing tools are overkill:** simPRO, ServiceM8, Tradify, Fergus, and Jobber all try to be full job-management platforms with scheduling, invoicing, inventory, timesheets, and CRM. A sole trader doing 5–15 jobs a month doesn't need — or want — a $50–$200/mo platform. They need great quotes.

### Target User Persona

| | |
|---|---|
| **Name** | Dave Mitchell |
| **Age** | 34 |
| **Trade** | Electrician (sole trader) |
| **Location** | Western suburbs of Melbourne, Australia |
| **Business size** | Just him + occasional subcontractor |
| **Revenue** | ~$180K/year |
| **Tech comfort** | Medium — uses iPhone daily, can navigate apps, but won't watch a 20-minute onboarding tutorial |
| **Current quoting method** | Copy-pastes from old Word docs, sometimes just texts a price. Has a rough Excel template he hates. |
| **Pain points** | Quoting takes too long; quotes look unprofessional; forgets to follow up; no idea which quotes were accepted |
| **What he wants** | Something dead simple: describe the job → get a proper quote → send it → know when they've read it |

### Value Proposition

> **"Upload anything. Describe the job. Get a professional quote in 60 seconds."**

QuoteCraft is the anti-platform. No scheduling. No timesheets. No CRM. Just fast, AI-powered, beautiful quotes — for $15/month.

---

## 2. Market Analysis

### Total Addressable Market (TAM)

| Region | Licensed Tradespeople | Source |
|--------|----------------------|--------|
| Australia | ~1.1 million | ABS Labour Force data (2025) — electricians, plumbers, carpenters, painters, landscapers, HVAC, tilers, concreters, roofers |
| United States | ~6.5 million | Bureau of Labor Statistics — specialty trade contractors, maintenance/repair |
| **Combined** | **~7.6 million** | |

**TAM (revenue):** 7.6M × $15/mo × 12 = **$1.37 billion/year**

### Serviceable Addressable Market (SAM)

Filtering for:
- Sole traders and businesses with 1–5 employees (≈60% of all trades businesses)
- English-speaking, digitally active (own a smartphone, use email) — ≈80% of that subset
- In trades that regularly quote (excludes salaried/employed tradies) — ≈50%

**SAM:** 7.6M × 0.60 × 0.80 × 0.50 = **1.82 million businesses**
**SAM (revenue):** 1.82M × $15/mo × 12 = **$328M/year**

### Serviceable Obtainable Market (SOM) — Year 1

Realistic target: 500 paying users in 12 months.

**SOM (revenue):** 500 × $15/mo × 12 = **$90,000/year**

### Competitor Landscape

| Product | Price | Quoting | Full Platform | AI Quoting | Photo Upload | Target |
|---------|-------|---------|---------------|------------|--------------|--------|
| **simPRO** | $50–$200/user/mo | ✅ | ✅ Job mgmt, scheduling, invoicing, inventory | ❌ | ❌ | 10–200 employee businesses |
| **ServiceM8** | $29–$149/mo | ✅ | ✅ Job mgmt, scheduling, invoicing | ❌ | Basic (attach only) | 1–20 employees, AU-focused |
| **Tradify** | $49/user/mo | ✅ | ✅ Job mgmt, scheduling, timesheets | ❌ | Basic | 1–20 employees, NZ/AU |
| **Fergus** | $49–$85/user/mo | ✅ | ✅ Job mgmt, invoicing, scheduling | ❌ | Basic | 1–50 employees, NZ/AU |
| **Jobber** | $39–$259/mo | ✅ | ✅ CRM, scheduling, invoicing, payments | ❌ | Basic | 1–50 employees, US/CA |
| **Invoice2go** | $5–$12/mo | Partial | ✅ Invoicing-first | ❌ | ❌ | Freelancers, sole traders |
| **Quotient** | $25/mo | ✅ | ❌ Quotes only | ❌ | ❌ | All industries |
| **QuoteCraft** | **$15/mo** | **✅** | **❌ Quotes only** | **✅ GPT-4o** | **✅ Vision AI** | **Sole traders, 1–5 employees** |

### Our Positioning

QuoteCraft occupies a unique position: **quoting-only + AI-first + affordable**.

- Competitors bundle quoting into bloated platforms. We unbundle it.
- Quotient does quotes-only but has zero AI — it's just a form builder.
- No competitor uses AI vision to analyze job photos and generate line items.
- At $15/mo, we're 50–90% cheaper than every job-management platform.

---

## 3. User Stories & Jobs to Be Done

### Core Jobs to Be Done

1. **Create a quote quickly** when I'm still on-site or driving home
2. **Look professional** so customers trust me and I can charge what I'm worth
3. **Know what's happening** with my quotes (viewed? accepted? ghosted?)
4. **Follow up** without it being awkward or forgotten
5. **Get paid faster** by making it easy for customers to say yes

### User Stories

#### Quote Creation

**US-01:** As Dave (electrician), I want to describe a job in plain English ("rewire downlights in kitchen, 6 LED downlights, replace old dimmer switch") and have AI generate a detailed, itemised quote so that I don't have to manually type every line item.

**US-02:** As Dave, I want to upload photos of a job site (e.g., a switchboard that needs upgrading) and have AI analyze them to suggest scope and line items, so that I can create quotes on the spot before leaving the site.

**US-03:** As Sarah (painter), I want to upload an old quote (PDF, Word doc, or photo of handwritten notes) and have QuoteCraft extract the details and create a new formatted quote, so I can digitise my existing quotes without retyping.

**US-04:** As Dave, I want to forward a customer's email (describing the work they need) to QuoteCraft and have it generate a draft quote from the email contents, so I can respond to enquiries in minutes instead of hours.

**US-05:** As Marco (landscaper), I want to select from my saved templates ("Standard Garden Maintenance", "Retaining Wall Build") and modify the pre-filled items for this specific job, so I can quote common jobs in under 30 seconds.

#### Quote Editing & Customisation

**US-06:** As Dave, I want to edit any line item (description, quantity, unit price) in the AI-generated quote before sending, so the quote is accurate and reflects my actual pricing.

**US-07:** As Sarah, I want to choose from at least 10 professional PDF templates and see a live preview, so my quotes match my brand and look polished.

**US-08:** As Sarah, I want to add my logo, business name, ABN, licence number, and payment terms to my business profile once and have them appear on every quote automatically, so I don't have to re-enter this information.

**US-09:** As Marco, I want to add optional line items that the customer can choose to include or exclude, so I can upsell additional services (e.g., "Add mulching — $350").

**US-10:** As Dave, I want to add notes, terms and conditions, and warranty information to the bottom of my quote, so the customer has all the information they need to make a decision.

#### Sending & Tracking

**US-11:** As Dave, I want to send a quote via email with one tap, and have the customer receive a professional, branded email with a link to view the quote online, so they don't get a random PDF attachment.

**US-12:** As Dave, I want to know when a customer has viewed my quote (and how many times), so I can gauge their interest and time my follow-up.

**US-13:** As Sarah, I want customers to be able to accept or decline a quote directly from the online link (with a digital signature or "Accept" button), so I get a clear answer without chasing.

**US-14:** As Dave, I want to see a dashboard showing all my quotes with their status (draft, sent, viewed, accepted, declined, expired), so I have a clear picture of my pipeline.

#### Business Profile & Setup

**US-15:** As Dave, I want to complete my business profile (name, ABN, licence, logo, phone, email, address, bank details, payment terms) in under 5 minutes during onboarding, so I'm ready to send professional quotes immediately.

**US-16:** As Marco, I want to set default payment terms (e.g., "50% deposit, balance on completion" or "Net 14 days") that auto-populate on every quote, so I don't have to type them each time.

#### Client Management

**US-17:** As Sarah, I want to save client details (name, email, phone, address) when I create a quote, so I can quickly select them for future quotes without re-entering their info.

**US-18:** As Dave, I want to see all quotes I've sent to a specific client in one place, so I can reference previous work when quoting new jobs for repeat customers.

#### PDF & Output

**US-19:** As Dave, I want to download any quote as a PDF so I can attach it to a text message or print it for clients who prefer paper.

**US-20:** As Marco, I want the PDF to include my logo, ABN, and a unique quote number, so it looks professional and meets Australian business requirements.

---

## 4. Core Features — MVP (Phase 1)

### 4.1 AI Quote Builder

The centrepiece feature. Three input modes, one output: a professional quote.

**Input modes:**
1. **Text description** — User types or pastes a job description. GPT-4o-mini extracts line items, quantities, and suggests pricing based on trade type and location.
2. **Photo upload** — User uploads 1–5 photos. GPT-4o (vision) analyzes the images, identifies the work needed, and generates line items. User confirms/edits.
3. **Document upload** — User uploads a PDF, Word doc, or image of an old quote. AI extracts line items, client details, and creates a new formatted quote.

**AI behaviour:**
- Generates structured JSON: `{ lineItems: [{ description, qty, unit, unitPrice }], notes, subtotal, gst, total }`
- Uses trade-specific knowledge (e.g., an electrician's quote should include compliance testing, an RCD check)
- Suggests pricing based on trade averages for the user's region (AU metro, AU regional, US by state)
- Always editable — AI is a starting point, never the final word
- GST handling: auto-calculates 10% GST for AU businesses; US tax is excluded (noted as "plus applicable tax")

**Token budget:** ~2,000 tokens per quote generation (GPT-4o-mini). ~4,000 tokens for vision-based quotes (GPT-4o). Target cost: $0.01–0.05 per quote.

### 4.2 PDF Templates

10 built-in professional templates:

| # | Name | Style | Best For |
|---|------|-------|----------|
| 1 | **Clean** | Minimal, modern, lots of white space | All trades |
| 2 | **Bold** | Dark header, strong typography | Builders, concreters |
| 3 | **Classic** | Traditional layout, serif fonts | Established businesses |
| 4 | **Trade Blue** | Blue accent, tradesman feel | Plumbers, electricians |
| 5 | **Earth** | Green/brown tones | Landscapers, tree services |
| 6 | **Monochrome** | Black & white, high contrast | Minimalists, print-friendly |
| 7 | **Stripe** | Alternating row colours | Complex multi-line quotes |
| 8 | **Compact** | Dense layout, small text | Large quotes (20+ items) |
| 9 | **Photo** | Includes uploaded job photos in PDF | Renovation, painting |
| 10 | **Premium** | Gold accents, luxury feel | High-end fit-outs |

All templates include: logo, business name, ABN/EIN, licence number, quote number, date, expiry, client details, line items, subtotal, GST/tax, total, payment terms, T&Cs, digital acceptance link.

**Custom branding (Pro):** Upload logo, set primary colour, choose font family.

### 4.3 Photo-to-Quote (AI Vision)

- Accepts JPEG, PNG, HEIC (converted server-side), WebP
- Max 5 photos per quote, max 10MB each
- GPT-4o vision analyzes photos and returns:
  - Identified work required
  - Suggested line items with descriptions
  - Estimated quantities where visible
  - Confidence indicators (high/medium/low) for each suggestion
- User reviews, edits, adjusts pricing, then confirms
- Photos optionally embedded in the PDF output

### 4.4 Quote Sending & Tracking

**Email delivery:**
- Transactional email via Resend (or SendGrid)
- Professional HTML email template with:
  - Business logo and name
  - Quote summary (total, expiry date)
  - "View Quote" CTA button linking to public quote page
  - PDF attached as fallback
- Tracking events: `sent`, `delivered`, `opened`, `viewed` (via tracking pixel + link click), `accepted`, `declined`

**Public quote page:**
- Unique URL: `quotecraft.com.au/q/{shortId}`
- Displays full quote in branded, responsive format
- "Accept Quote" button → captures digital acceptance (name, date, IP)
- "Decline" option with optional reason field
- No login required for the client

### 4.5 Business Profile

Required fields:
- Business name
- Owner name
- Email, phone
- Address
- ABN (Australia) or EIN (US) — validated format
- Trade type (dropdown: electrician, plumber, builder, painter, landscaper, HVAC, tiler, roofer, concreter, carpenter, other)
- Logo upload (PNG/JPG, max 2MB)

Optional fields:
- Licence/registration number
- Insurance details
- Default payment terms (free text or presets)
- Default T&Cs
- Bank details for payment (displayed on quote, not processed by us)
- Website URL
- Social media links

### 4.6 Dashboard

**Summary cards:**
- Quotes this month (count)
- Total value quoted ($$)
- Acceptance rate (%)
- Average quote value

**Quote list:**
- Filterable by status: All | Draft | Sent | Viewed | Accepted | Declined | Expired
- Sortable by date, value, client name
- Search by client name or quote number
- Quick actions: View, Edit, Duplicate, Resend, Download PDF

### 4.7 Mobile-First Responsive Design

- Primary design target: iPhone (375px width)
- Fully functional on mobile — every feature works without desktop
- Touch-optimised: large tap targets (min 44px), swipe actions on quote list
- Camera integration for photo upload (direct capture, not just gallery)
- Responsive breakpoints: 375px (mobile), 768px (tablet), 1024px (desktop)

---

## 5. Phase 2 Features

Target: Month 3–6 post-launch.

### 5.1 Voice-to-Quote
- Record audio description of the job (up to 2 minutes)
- Whisper API transcribes → GPT-4o-mini generates quote
- "Just got off the phone with a customer, let me dictate this quote while I drive"

### 5.2 Saved Quote Templates
- Save any quote as a reusable template
- Name it (e.g., "Standard Hot Water Replacement")
- One-tap to create new quote from template, then customise

### 5.3 Follow-Up Automation
- If quote not viewed after 24 hours → gentle email reminder
- If viewed but not accepted after 3 days → follow-up email
- If no action after 7 days → final nudge
- Configurable: user can adjust timing or disable
- Smart: doesn't send if client has already responded

### 5.4 Quote → Invoice Conversion
- One-tap convert accepted quote to invoice
- Adds payment details, due date, invoice number
- Separate PDF template for invoices
- Basic invoice tracking (sent, paid, overdue)

### 5.5 SMS Delivery
- Send quote link via SMS in addition to email
- Twilio integration
- Higher open rates than email (~98% vs ~20%)
- User pays per SMS or included in Business tier

### 5.6 Stripe Billing Integration
- Subscription management via Stripe
- Usage tracking for free tier limits
- Upgrade prompts when approaching limits

### 5.7 Client Portal
- Clients get a link to view all their quotes from this business
- No login required (magic link via email)
- Accept/decline, view history, download PDFs

### 5.8 Multi-Language Support
- Initially: English (AU), English (US)
- Phase 2: Spanish (US market), Mandarin (AU market)
- Affects UI labels, email templates, and AI-generated content

---

## 6. Phase 3 Features

Target: Month 6–12 post-launch.

### 6.1 Team Features
- Multiple users per business account
- Roles: Owner, Admin, Quoter (can create/send but not change settings)
- Per-seat pricing addition

### 6.2 Quote Analytics
- Win rate by trade type, quote value range, client, month
- Average time from sent → accepted
- Revenue pipeline (sum of outstanding quotes)
- Trends over time (charts)

### 6.3 Accounting Integrations
- Xero (priority — dominant in AU)
- MYOB (AU)
- QuickBooks Online (US)
- Sync: push accepted quotes / invoices as transactions

### 6.4 Materials/Inventory Database
- Saved materials with descriptions and unit prices
- Quick-add from materials list when building quotes
- Price update alerts (e.g., copper price changes)

### 6.5 Geolocation-Based Pricing
- Different default rates by region
- Metro vs regional pricing suggestions
- State-based tax handling (US)

### 6.6 White-Label Option
- Trade associations or franchises can offer QuoteCraft under their brand
- Custom domain, logo, colours
- Bulk licensing

### 6.7 Mobile App (React Native)
- iOS and Android native app
- Offline quote creation (sync when online)
- Push notifications for quote events
- Camera integration for photo-to-quote

---

## 7. Technical Architecture

### System Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend    │────▶│   Backend    │────▶│   Database   │
│  React 19    │     │  Express 5   │     │   SQLite     │
│  Vite + TW4  │     │  Node.js     │     │  (→ Postgres)│
│  Vercel      │     │  GCP VM      │     │              │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                    ┌───────┴────────┐
                    │                │
              ┌─────▼─────┐  ┌──────▼──────┐
              │  OpenAI   │  │   Resend    │
              │  GPT-4o   │  │   (Email)   │
              │  Vision   │  │             │
              └───────────┘  └─────────────┘
```

### Frontend

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | React 19 | Industry standard, large ecosystem, RSC support |
| Bundler | Vite 6 | Fast HMR, ESM-native |
| Styling | Tailwind CSS v4 | Utility-first, rapid prototyping, small bundle |
| State | Zustand | Lightweight, no boilerplate |
| Routing | React Router 7 | Standard, supports lazy loading |
| Forms | React Hook Form + Zod | Validation with type safety |
| HTTP | Axios | Interceptors for auth, error handling |
| PDF Preview | react-pdf | Client-side PDF rendering for template preview |
| Hosting | Vercel | Free tier, global CDN, easy deploys from GitHub |

### Backend

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Runtime | Node.js 22 LTS | JavaScript end-to-end, async I/O |
| Framework | Express 5 (ESM) | Mature, minimal, async middleware support |
| Database | SQLite via better-sqlite3 | Zero-config, single-file, fast for <10K users. Migrate to PostgreSQL when needed. |
| ORM | Drizzle ORM | Type-safe, lightweight, supports SQLite + PostgreSQL |
| Auth | JWT (access + refresh tokens) | Stateless, scalable |
| Password | bcrypt (cost factor 12) | Industry standard |
| File Upload | Multer → local disk | Simple. Move to S3-compatible (GCS) at scale. |
| PDF Generation | pdfkit | Programmatic PDF creation, full layout control |
| AI | OpenAI SDK (GPT-4o, GPT-4o-mini) | Best vision model, good structured output |
| Email | Resend SDK | Developer-friendly, good deliverability, free tier (100 emails/day) |
| Validation | Zod | Shared schemas with frontend |
| Logging | Pino | Fast JSON logging |
| Hosting | GCP e2-micro VM (free tier) → e2-small | Cost-effective, scales to thousands of users |

### AI Pipeline

```
User Input (text / photos / document)
        │
        ▼
  ┌─────────────┐
  │ Input Parser │  ← Determines input type, extracts text/images
  └──────┬──────┘
         │
         ▼
  ┌─────────────────┐
  │  Prompt Builder  │  ← Constructs system + user prompt with:
  │                  │     - Trade type context
  │                  │     - Regional pricing hints
  │                  │     - Business profile data
  │                  │     - Output schema (JSON)
  └──────┬──────────┘
         │
         ▼
  ┌─────────────────┐
  │   OpenAI API    │  ← GPT-4o (vision) or GPT-4o-mini (text-only)
  │                  │     Structured output mode (JSON schema)
  └──────┬──────────┘
         │
         ▼
  ┌─────────────────┐
  │  Post-Processor  │  ← Validates JSON, calculates totals,
  │                  │     applies GST rules, formats currency
  └──────┬──────────┘
         │
         ▼
    Quote Object (ready for review/edit)
```

### Infrastructure

- **Domain:** quotecraft.com.au (AU primary), quotecraft.app (global)
- **SSL:** Let's Encrypt (auto-renewed via Caddy or Certbot)
- **CI/CD:** GitHub Actions → deploy frontend to Vercel, backend to GCP VM via SSH
- **Monitoring:** UptimeRobot (free), Sentry (error tracking)
- **Backups:** Daily SQLite backup to GCS bucket (cron job)

---

## 8. Data Model

### Entity Relationship Overview

```
User (1) ──── (N) Quote
User (1) ──── (N) Client
User (1) ──── (1) BusinessProfile
User (1) ──── (N) QuoteTemplate
Quote (N) ──── (1) Client
Quote (1) ──── (N) LineItem
Quote (1) ──── (N) QuoteEvent
Quote (1) ──── (N) QuoteFile
```

### Tables

#### `users`
```sql
CREATE TABLE users (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  quotes_this_month INTEGER NOT NULL DEFAULT 0,
  month_reset_at TEXT
);
```

#### `business_profiles`
```sql
CREATE TABLE business_profiles (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id           TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name     TEXT NOT NULL,
  owner_name        TEXT,
  email             TEXT,
  phone             TEXT,
  address_line1     TEXT,
  address_line2     TEXT,
  city              TEXT,
  state             TEXT,
  postcode          TEXT,
  country           TEXT NOT NULL DEFAULT 'AU' CHECK (country IN ('AU', 'US')),
  abn               TEXT,          -- AU: 11-digit ABN
  ein               TEXT,          -- US: EIN
  trade_type        TEXT,
  licence_number    TEXT,
  insurance_details TEXT,
  logo_path         TEXT,
  website           TEXT,
  default_payment_terms TEXT,
  default_terms_conditions TEXT,
  bank_name         TEXT,
  bank_bsb          TEXT,
  bank_account      TEXT,
  bank_account_name TEXT,
  primary_colour    TEXT DEFAULT '#2563EB',
  template_id       TEXT DEFAULT 'clean',
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### `clients`
```sql
CREATE TABLE clients (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  address     TEXT,
  city        TEXT,
  state       TEXT,
  postcode    TEXT,
  notes       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_clients_user ON clients(user_id);
```

#### `quotes`
```sql
CREATE TABLE quotes (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id       TEXT REFERENCES clients(id) ON DELETE SET NULL,
  quote_number    TEXT NOT NULL,         -- e.g., "QC-2026-0042"
  short_id        TEXT NOT NULL UNIQUE,  -- 8-char for public URL
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','sent','viewed','accepted','declined','expired')),
  title           TEXT,                  -- e.g., "Kitchen Rewire — 14 Smith St"
  description     TEXT,                  -- Job description (user input)
  subtotal        REAL NOT NULL DEFAULT 0,
  tax_rate        REAL NOT NULL DEFAULT 10.0,  -- 10% GST for AU, 0 for US
  tax_amount      REAL NOT NULL DEFAULT 0,
  total           REAL NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'AUD',
  notes           TEXT,                  -- Additional notes on the quote
  terms           TEXT,                  -- Payment terms for this quote
  valid_until     TEXT,                  -- Expiry date
  accepted_at     TEXT,
  accepted_name   TEXT,                  -- Digital signature name
  accepted_ip     TEXT,
  declined_at     TEXT,
  decline_reason  TEXT,
  template_id     TEXT DEFAULT 'clean',
  ai_model_used   TEXT,                  -- 'gpt-4o' or 'gpt-4o-mini'
  ai_input_type   TEXT,                  -- 'text', 'photo', 'document', 'voice'
  ai_tokens_used  INTEGER,
  sent_at         TEXT,
  sent_via        TEXT CHECK (sent_via IN ('email', 'sms', 'both')),
  viewed_at       TEXT,
  view_count      INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_quotes_user ON quotes(user_id);
CREATE INDEX idx_quotes_short_id ON quotes(short_id);
CREATE INDEX idx_quotes_status ON quotes(user_id, status);
```

#### `line_items`
```sql
CREATE TABLE line_items (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  quote_id    TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  quantity    REAL NOT NULL DEFAULT 1,
  unit        TEXT DEFAULT 'each',      -- each, hour, m², m, sqft, lot
  unit_price  REAL NOT NULL DEFAULT 0,
  total       REAL NOT NULL DEFAULT 0,  -- quantity × unit_price
  is_optional INTEGER NOT NULL DEFAULT 0,  -- 1 = optional/add-on item
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_line_items_quote ON line_items(quote_id);
```

#### `quote_files`
```sql
CREATE TABLE quote_files (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  quote_id    TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  file_path   TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  file_type   TEXT NOT NULL,            -- 'photo', 'document', 'pdf_output'
  mime_type   TEXT NOT NULL,
  file_size   INTEGER NOT NULL,         -- bytes
  ai_analysis TEXT,                     -- JSON: AI's interpretation of this file
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_quote_files_quote ON quote_files(quote_id);
```

#### `quote_events`
```sql
CREATE TABLE quote_events (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  quote_id   TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL
               CHECK (event_type IN ('created','edited','sent','delivered','opened','viewed','accepted','declined','expired','reminder_sent')),
  metadata   TEXT,                      -- JSON: additional event data
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_quote_events_quote ON quote_events(quote_id);
```

#### `quote_templates`
```sql
CREATE TABLE quote_templates (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,            -- e.g., "Standard Hot Water Install"
  description TEXT,
  line_items  TEXT NOT NULL,            -- JSON array of line item templates
  notes       TEXT,
  terms       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_quote_templates_user ON quote_templates(user_id);
```

### Data Retention Policy

| Data Type | Retention | Rationale |
|-----------|-----------|-----------|
| User accounts | Indefinite while active; 90 days after deletion request | Allow recovery period |
| Quotes | 7 years from creation | Australian tax record requirements (5 years + buffer) |
| Uploaded files | 12 months after quote expiry or decline | Storage cost management |
| Quote events | 2 years | Analytics needs |
| Deleted account data | Anonymised after 90-day grace period | Privacy compliance |

---

## 9. API Specification

### Base URL

```
Production: https://api.quotecraft.com.au/v1
Development: http://localhost:3000/v1
```

### Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

Access tokens expire in 15 minutes. Refresh tokens expire in 30 days.

### Rate Limits

| Tier | Rate Limit |
|------|-----------|
| Free | 30 requests/minute |
| Pro | 60 requests/minute |
| Business | 120 requests/minute |
| AI endpoints | 10 requests/minute (all tiers) |

### Endpoints

#### Auth

```
POST /v1/auth/register
  Body: { email, password, name }
  Response: { user, accessToken, refreshToken }

POST /v1/auth/login
  Body: { email, password }
  Response: { user, accessToken, refreshToken }

POST /v1/auth/refresh
  Body: { refreshToken }
  Response: { accessToken, refreshToken }

POST /v1/auth/forgot-password
  Body: { email }
  Response: { message: "Reset email sent" }

POST /v1/auth/reset-password
  Body: { token, newPassword }
  Response: { message: "Password updated" }
```

#### Business Profile

```
GET  /v1/profile
  Response: { profile: BusinessProfile }

PUT  /v1/profile
  Body: { businessName, ownerName, email, phone, ... }
  Response: { profile: BusinessProfile }

POST /v1/profile/logo
  Body: multipart/form-data (file)
  Response: { logoUrl: string }
```

#### Clients

```
GET    /v1/clients?search=&page=1&limit=20
  Response: { clients: Client[], total: number }

POST   /v1/clients
  Body: { name, email, phone, address, ... }
  Response: { client: Client }

GET    /v1/clients/:id
  Response: { client: Client }

PUT    /v1/clients/:id
  Body: { name, email, phone, ... }
  Response: { client: Client }

DELETE /v1/clients/:id
  Response: { message: "Deleted" }
```

#### Quotes

```
GET    /v1/quotes?status=&page=1&limit=20&search=
  Response: { quotes: Quote[], total: number }

POST   /v1/quotes
  Body: { clientId?, title, description, lineItems: [], notes, terms, validUntil, templateId }
  Response: { quote: Quote }

GET    /v1/quotes/:id
  Response: { quote: Quote, lineItems: LineItem[], files: QuoteFile[], events: QuoteEvent[] }

PUT    /v1/quotes/:id
  Body: { title, description, lineItems, notes, terms, ... }
  Response: { quote: Quote }

DELETE /v1/quotes/:id
  Response: { message: "Deleted" }

POST   /v1/quotes/:id/duplicate
  Response: { quote: Quote }  // New quote with same line items

POST   /v1/quotes/:id/send
  Body: { via: "email" | "sms" | "both", recipientEmail?, recipientPhone? }
  Response: { message: "Quote sent", sentAt: string }

GET    /v1/quotes/:id/pdf
  Response: application/pdf (streamed)

GET    /v1/quotes/:id/events
  Response: { events: QuoteEvent[] }
```

#### AI Generation

```
POST /v1/ai/generate
  Body: multipart/form-data {
    tradeType: string,
    description?: string,         // Text description of the job
    photos?: File[],              // Up to 5 photos
    document?: File,              // PDF/Word/image of existing quote
    region?: "AU-metro" | "AU-regional" | "US",
  }
  Response: {
    lineItems: [{ description, quantity, unit, unitPrice, confidence: "high"|"medium"|"low" }],
    suggestedTitle: string,
    suggestedNotes: string,
    aiModel: string,
    tokensUsed: number
  }
```

#### Public Quote (No Auth)

```
GET  /v1/public/quotes/:shortId
  Response: { quote: PublicQuote, business: PublicBusinessProfile }

POST /v1/public/quotes/:shortId/accept
  Body: { name: string }
  Response: { message: "Quote accepted", acceptedAt: string }

POST /v1/public/quotes/:shortId/decline
  Body: { reason?: string }
  Response: { message: "Quote declined" }
```

#### Dashboard Stats

```
GET /v1/dashboard/stats?period=month
  Response: {
    quotesCount: number,
    totalValue: number,
    acceptanceRate: number,
    averageValue: number,
    byStatus: { draft: n, sent: n, viewed: n, accepted: n, declined: n, expired: n }
  }
```

#### File Upload

- Max file size: 10MB per file
- Accepted types: image/jpeg, image/png, image/heic, image/webp, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
- Max 5 files per request
- Files stored at: `./uploads/{userId}/{quoteId}/{filename}`

---

## 10. UI/UX Requirements

### Design System

#### Colours

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#2563EB` (Blue 600) | CTAs, links, active states |
| **Primary Dark** | `#1D4ED8` (Blue 700) | Hover states |
| **Secondary** | `#F59E0B` (Amber 500) | Accents, highlights, badges |
| **Success** | `#10B981` (Emerald 500) | Accepted, positive metrics |
| **Warning** | `#F59E0B` (Amber 500) | Pending, expiring soon |
| **Danger** | `#EF4444` (Red 500) | Declined, errors, destructive actions |
| **Neutral 50** | `#F9FAFB` | Page background |
| **Neutral 100** | `#F3F4F6` | Card backgrounds |
| **Neutral 200** | `#E5E7EB` | Borders |
| **Neutral 500** | `#6B7280` | Secondary text |
| **Neutral 900** | `#111827` | Primary text |

#### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| **H1** | Inter | 28px / 1.75rem | 700 (Bold) |
| **H2** | Inter | 22px / 1.375rem | 600 (Semibold) |
| **H3** | Inter | 18px / 1.125rem | 600 |
| **Body** | Inter | 16px / 1rem | 400 (Regular) |
| **Small** | Inter | 14px / 0.875rem | 400 |
| **Caption** | Inter | 12px / 0.75rem | 500 (Medium) |

#### Spacing Scale

Based on 4px grid: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px.

#### Border Radius

- Small (inputs, badges): 6px
- Medium (cards, buttons): 8px
- Large (modals, panels): 12px
- Full (avatars, pills): 9999px

### Key Screens

#### Screen 1: Dashboard (Home)

```
┌─────────────────────────────────────┐
│ ☰  QuoteCraft          [+ New Quote]│
├─────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │ 12     │ │ $14.2K │ │ 67%    │   │
│ │ Quotes │ │ Value  │ │ Won    │   │
│ └────────┘ └────────┘ └────────┘   │
├─────────────────────────────────────┤
│ Filter: [All ▾] [Search...       ]  │
├─────────────────────────────────────┤
│ ┌───────────────────────────────┐   │
│ │ QC-2026-0042  ● Viewed        │   │
│ │ Sarah Chen — Kitchen Rewire   │   │
│ │ $2,450.00        3 Feb 2026   │   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ QC-2026-0041  ● Accepted      │   │
│ │ Mike Torres — Deck Build      │   │
│ │ $8,900.00        1 Feb 2026   │   │
│ └───────────────────────────────┘   │
│ ...                                 │
├─────────────────────────────────────┤
│ [Dashboard] [Quotes] [Clients] [⚙] │
└─────────────────────────────────────┘
```

#### Screen 2: New Quote (AI Builder)

```
┌─────────────────────────────────────┐
│ ← New Quote                         │
├─────────────────────────────────────┤
│                                     │
│  How would you like to create       │
│  this quote?                        │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 📝  Describe the Job        │    │
│  │ Type or paste a description │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 📷  Upload Photos           │    │
│  │ AI analyzes your job photos │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 📄  Upload Document         │    │
│  │ PDF, Word, or photo of      │    │
│  │ existing quote              │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ ✏️  Start from Scratch      │    │
│  │ Blank quote, add items      │    │
│  │ manually                    │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

#### Screen 3: Quote Editor

```
┌─────────────────────────────────────┐
│ ← Edit Quote           [Preview] 💾 │
├─────────────────────────────────────┤
│ Client: [Sarah Chen          ▾]     │
│ Title:  [Kitchen Rewire — 14 Sm...] │
├─────────────────────────────────────┤
│ LINE ITEMS                   [+ Add]│
│ ┌───────────────────────────────┐   │
│ │ Supply & install 6x LED       │   │
│ │ downlights (IC-4 rated)       │   │
│ │ 6 × $85.00          = $510.00 │   │
│ │                        [✎] [🗑]│   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ Replace existing dimmer       │   │
│ │ switch with LED-compatible    │   │
│ │ 1 × $120.00         = $120.00 │   │
│ │                        [✎] [🗑]│   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ Electrical compliance test    │   │
│ │ & certificate                 │   │
│ │ 1 × $150.00         = $150.00 │   │
│ │                        [✎] [🗑]│   │
│ └───────────────────────────────┘   │
├─────────────────────────────────────┤
│              Subtotal:    $780.00   │
│              GST (10%):    $78.00   │
│              TOTAL:       $858.00   │
├─────────────────────────────────────┤
│ Notes: [                         ]  │
│ Valid until: [14 Feb 2026      ]    │
│ Template: [Clean               ▾]  │
├─────────────────────────────────────┤
│ [Save Draft]        [Send Quote →]  │
└─────────────────────────────────────┘
```

#### Screen 4: Public Quote View (Client-Facing)

```
┌─────────────────────────────────────┐
│         [LOGO]                      │
│   Dave's Electrical Services        │
│   ABN: 12 345 678 901               │
│   Licence: EC12345                  │
├─────────────────────────────────────┤
│   QUOTE #QC-2026-0042              │
│   Date: 3 February 2026            │
│   Valid until: 17 February 2026    │
├─────────────────────────────────────┤
│   Prepared for:                     │
│   Sarah Chen                        │
│   14 Smith Street                   │
│   Hawthorn VIC 3122                │
├─────────────────────────────────────┤
│   Kitchen Rewire                    │
│                                     │
│   Item               Qty    Amount  │
│   ─────────────────────────────── │
│   LED downlights       6   $510.00  │
│   Dimmer switch        1   $120.00  │
│   Compliance test      1   $150.00  │
│   ─────────────────────────────── │
│   Subtotal                 $780.00  │
│   GST                       $78.00  │
│   TOTAL                   $858.00   │
├─────────────────────────────────────┤
│   Payment: 50% deposit, balance     │
│   on completion.                    │
├─────────────────────────────────────┤
│                                     │
│   [ ✅ Accept Quote ]               │
│   [ ✕ Decline ]                     │
│                                     │
│   [📥 Download PDF]                 │
└─────────────────────────────────────┘
```

### Mobile-Specific Considerations

- Bottom navigation bar (thumb-friendly)
- Swipe left on quote card → quick actions (resend, duplicate, delete)
- Pull-to-refresh on quote list
- Camera opens directly for photo-to-quote (no file picker first)
- Sticky "Send Quote" button on editor screen
- Keyboard-aware layout — inputs scroll above keyboard
- Haptic feedback on key actions (quote sent, accepted)

### Accessibility Requirements

- WCAG 2.1 AA compliance
- All interactive elements keyboard-navigable
- Colour contrast ratio ≥ 4.5:1 for text
- Screen reader labels on all buttons and form fields
- Focus indicators visible
- Alt text on all images
- Error messages associated with form fields via `aria-describedby`

---

## 11. Pricing Strategy

### Tier Comparison

| Feature | Free | Pro ($15/mo) | Business ($29/mo) |
|---------|------|-------------|-------------------|
| Quotes per month | 3 | Unlimited | Unlimited |
| AI quote generation | ✅ | ✅ | ✅ Priority (GPT-4o always) |
| Photo-to-Quote | 1/month | Unlimited | Unlimited |
| PDF templates | 3 basic | All 10 + custom branding | All 10 + custom branding |
| Quote tracking | ❌ | ✅ Viewed/accepted/declined | ✅ |
| Custom logo on PDF | ❌ | ✅ | ✅ |
| Email sending | ✅ (QuoteCraft branding) | ✅ (Your branding) | ✅ |
| SMS sending | ❌ | ❌ | ✅ (50/mo included) |
| Voice-to-Quote | ❌ | ❌ | ✅ |
| Follow-up automation | ❌ | ❌ | ✅ |
| Quote → Invoice | ❌ | ❌ | ✅ |
| Client portal | ❌ | ✅ | ✅ |
| Support | Community | Email (24h) | Priority email (4h) |

### Annual Pricing

- Pro: $150/year ($12.50/mo — save $30, equivalent to 2 months free)
- Business: $290/year ($24.17/mo — save $58, equivalent to 2 months free)

### Price Justification

**Why $15/mo for Pro:**
- Competitors charge $29–$200/mo for platforms where quoting is just one feature
- Quotient (quotes-only, no AI) charges $25/mo — we're cheaper AND smarter
- $15/mo is approximately one hour of a tradie's time — if QuoteCraft saves 3+ hours per week, the ROI is 12:1 minimum
- Low enough to be an impulse decision, not a budget discussion
- ServiceM8 Starter is $29/mo; we offer better quoting at half the price

**Why $29/mo for Business:**
- Voice-to-quote and automation are high-value features for busy tradies
- Quote→Invoice conversion reduces the need for a separate invoicing tool
- Still 40–85% cheaper than full platforms
- SMS delivery alone (50 messages) would cost ~$5/mo via Twilio

**Why Free tier exists:**
- Removes friction for trial — no credit card needed
- 3 quotes/month is enough to experience the value but not enough to run a business on
- Conversion funnel: Free → "Wow this is easy" → Pro by month 2

### AI Cost Per Quote

| Model | Input | Output | Cost/Quote |
|-------|-------|--------|------------|
| GPT-4o-mini (text) | ~800 tokens | ~500 tokens | ~$0.002 |
| GPT-4o (vision, 1 photo) | ~1,500 tokens | ~500 tokens | ~$0.02 |
| GPT-4o (vision, 5 photos) | ~5,000 tokens | ~800 tokens | ~$0.05 |

At $15/mo with an estimated 20 quotes/month per user, AI cost is ~$0.10–0.50/user/month (1–3% of revenue). Healthy margin.

---

## 12. Go-to-Market Strategy

### Phase 1: Beta (Month 1)

**Channel:** Personal network
- Leo recruits 10 tradie mates (electricians, plumbers, painters) to beta test
- Goal: validate core flow, identify bugs, gather testimonials
- Incentive: free Pro for life if they provide detailed feedback + a video testimonial
- Feedback collection: simple Google Form + fortnightly Zoom/phone call

### Phase 2: Soft Launch (Month 2)

**Channels:** Organic social, trade groups

- **Facebook Groups:** Join 20+ trade-specific groups (e.g., "Aussie Sparkies", "Plumbers of Australia", "US Electricians Forum"). Contribute value first (answer questions), then share QuoteCraft when relevant. Not spammy — genuinely helpful.
- **Reddit:** r/electricians, r/plumbing, r/Construction, r/AusFinance (as a side project story)
- **Product Hunt:** Launch for visibility with dev/startup audience
- **X (Twitter):** Build-in-public content — share progress, metrics, learnings

### Phase 3: Paid Acquisition (Month 3+)

#### Facebook/Instagram Ads

**Targeting:**
- AU: Males 25–55, interests in "tradesman", "electrician", "plumber", specific trade tool brands (Milwaukee, DeWalt, Makita), ServiceM8, Tradify
- US: Similar demographics, interests in construction, trade tools, Jobber, Housecall Pro
- Lookalike audiences from beta users (once pixel has data)

**Creative strategy:**
- **Hook:** "Still quoting on the back of an envelope?" / "Your quotes shouldn't take longer than the job"
- **Format:** 15-second video showing photo → AI generates quote → send → done (screen recording)
- **Social proof:** Quote from beta tester Dave: "I used to spend Sunday night doing quotes. Now I do them in the van."

**Budget:**
- Month 3–4: $500/mo (testing creatives and audiences)
- Month 5–6: $1,000/mo (scale winners)
- Month 7–12: $2,000/mo (optimise CAC)

**Expected metrics:**
- CPC: $1.50–3.00 (trade services niche)
- Landing page conversion: 8–12%
- Free → Pro conversion: 20–30%
- Target CAC (Pro subscriber): $30–50
- LTV (12-month): $150–180 (accounting for ~15% monthly churn)
- LTV:CAC ratio: 3:1 to 5:1

#### Google Ads

- Keywords: "quoting software tradies", "trade quote template", "electrician quote app", "plumber quoting tool"
- Search volume is lower but intent is extremely high
- Budget: $300/mo from Month 4

### Content Marketing & SEO

**Target keywords:**
- "free quote template electrician" (high volume, we offer free tier)
- "quoting software for tradies"
- "how to quote a job" + [trade type]
- "plumber quote template Australia"
- "contractor estimate template"
- "AI quoting tool"

**Blog topics:**
1. "How to Write a Quote That Wins the Job (Tradie's Guide)"
2. "Quote vs Estimate: What's the Difference and When to Use Each"
3. "10 Quoting Mistakes That Are Costing You Jobs"
4. "How Long Should a Quote Be Valid? A Guide for Australian Tradies"
5. "Free Electrician Quote Template (Download + Online Tool)"
6. "Why Tradies Lose 30% of Jobs to Slow Quoting"

**Distribution:** Blog on quotecraft.com.au/blog, repurpose to LinkedIn, Facebook groups, and short-form video.

### Partnerships

| Partner | Type | Value |
|---------|------|-------|
| **Bunnings Trade** | Cross-promotion | Access to 500K+ trade account holders |
| **Master Electricians Australia** | Affiliate/endorsed tool | Credibility + distribution to 6,000+ members |
| **Master Plumbers Association** | Same model | |
| **TAFE / trade schools** | Educational partner | Teach new tradies to quote properly using QuoteCraft |
| **Accountants (regional)** | Referral | "Tell your tradie clients about this" |
| **Tool/material suppliers** | Co-marketing | Bundle mentions in newsletters |

### Referral Program

- Existing user refers a friend → both get 1 month free (Pro)
- Unique referral link on dashboard
- Track referrals and display count ("You've referred 3 tradies!")
- Cap: 6 free months per year via referrals (prevents abuse)

---

## 13. Success Metrics & KPIs

### North Star Metric

**Quotes sent per week (across all users)**

This captures both user acquisition AND engagement. A growing number means more users, more active users, or both.

### Weekly KPIs

| Metric | Target (Month 6) |
|--------|-----------------|
| New signups | 25/week |
| Free → Pro conversion rate | 25% |
| Quotes created | 200/week |
| Quotes sent | 150/week |
| Quote acceptance rate (client-side) | 40%+ |
| Weekly active users (created or sent ≥1 quote) | 80 |

### Monthly KPIs

| Metric | Definition |
|--------|-----------|
| MRR | Monthly recurring revenue |
| Paying users | Users on Pro or Business |
| Churn rate | % of paying users who cancel |
| CAC | Cost to acquire a paying user |
| LTV | Average revenue per user over lifetime |
| NPS | Net Promoter Score (survey quarterly) |

### Month-by-Month Targets (Year 1)

| Month | Total Users | Paying Users | MRR | Cumulative Revenue |
|-------|-------------|-------------|------|--------------------|
| 1 | 15 | 0 | $0 | $0 |
| 2 | 40 | 5 | $75 | $75 |
| 3 | 80 | 15 | $225 | $300 |
| 4 | 130 | 30 | $480 | $780 |
| 5 | 200 | 55 | $875 | $1,655 |
| 6 | 300 | 100 | $1,600 | $3,255 |
| 7 | 400 | 140 | $2,240 | $5,495 |
| 8 | 520 | 190 | $3,040 | $8,535 |
| 9 | 650 | 250 | $4,000 | $12,535 |
| 10 | 800 | 310 | $4,960 | $17,495 |
| 11 | 970 | 390 | $6,240 | $23,735 |
| 12 | 1,150 | 500 | $8,000 | $31,735 |

**Assumptions:**
- Average revenue per paying user: $16/mo (mix of Pro at $15 and Business at $29)
- Free-to-paid conversion: 25% over first 60 days
- Monthly churn: 8% (high initially, improving to 5% by month 12)
- Paid ads begin Month 3; organic + referrals carry Month 1–2

### Revenue Projections (Year 2 if targets met)

- Month 12 MRR: $8,000
- Projected Month 24 MRR (with continued growth): $25,000–40,000
- Annual run rate at Month 24: $300K–480K

---

## 14. Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **AI generates inaccurate pricing** | High | Medium | Always present AI output as editable draft; never auto-send. Show confidence indicators. Collect pricing feedback to improve prompts. |
| **OpenAI API downtime** | Low | High | Implement fallback to manual quote creation. Cache common responses. Alert users of degraded mode. Consider secondary AI provider (Anthropic Claude). |
| **OpenAI pricing increases** | Medium | Medium | Abstract AI layer so provider is swappable. Monitor cost per quote. Budget ceiling alerts. |
| **SQLite scaling limits** | Low (long-term) | Medium | Migration path to PostgreSQL already planned via Drizzle ORM. Trigger at 5,000+ users. |
| **File storage costs** | Low | Low | Compress images server-side. Enforce file size limits. Prune expired quote files. |

### Market Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Tradies won't pay for quoting software** | Medium | Critical | Free tier eliminates risk for user. $15/mo is trivially low. Focus on time-saved messaging. |
| **Low awareness / hard to reach tradies** | Medium | High | Facebook groups and word-of-mouth are primary channels. Tradies trust other tradies — referral program is key. |
| **Tradies prefer WhatsApp / text quotes** | Medium | Medium | QuoteCraft quotes can be shared via link on any channel. SMS delivery in Phase 2. The quote is a webpage, not locked to email. |

### Competitive Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **ServiceM8/Tradify add AI quoting** | High (12–18 months) | Medium | First-mover advantage. They'll add AI as a feature; we build the entire experience around it. Their AI will be bolted on; ours is native. Their price is still 2–10x ours. |
| **New AI-first competitor** | Medium | High | Move fast, build brand loyalty, lock in with templates and data. Network effects from saved quotes and client relationships. |
| **ChatGPT / generic AI makes dedicated tool unnecessary** | Low | Medium | ChatGPT can't send branded emails, track views, handle acceptances, generate branded PDFs, or manage a quote pipeline. We're the last mile. |

### Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Solo founder burnout** | Medium | Critical | Keep scope minimal (quotes only!). Don't feature-creep. Automate everything possible. Set realistic timelines. |
| **Support burden at scale** | Medium | Medium | In-app help, FAQ, video tutorials. Chatbot for common questions. Community forum. |

---

## 15. Legal & Compliance

### Australia

#### Quote Legal Requirements
- Quotes must include the business's **ABN** (Australian Business Number) — required for any business transaction over $82.50 (including GST)
- GST-registered businesses (turnover >$75K) must show GST separately or state "Total includes GST"
- Quotes should clearly state **validity period** (common: 14 or 30 days)
- **Australian Consumer Law (ACL):** If a quote is accepted, it forms a binding agreement. The quote should clearly state terms, scope, and exclusions.
- State-specific licensing: Electrical work requires an electrical licence number to be displayed (varies by state). Similar for plumbing, building.
- QuoteCraft must prompt users to enter their licence number and include it on quotes for relevant trades.

#### Consumer Protection
- Quotes must not be misleading or deceptive (ACL Section 18)
- Price should be the total price payable (including GST for B2C)
- Any conditions or limitations must be clearly stated

### United States

#### Estimate/Quote Requirements
- No federal law mandating specific quote format
- **State-level requirements vary:**
  - California: Home improvement contracts over $500 require written agreement
  - Many states require contractor licence number on estimates
  - Some states require "Estimate" vs "Quote" distinction (estimate = non-binding, quote = fixed price)
- QuoteCraft should clearly label documents and let users choose "Quote" or "Estimate"
- EIN (Employer Identification Number) display is standard but not always legally required

### Privacy & Data Protection

#### Australian Privacy Act 1988
- Applies to businesses with annual turnover >$3M (QuoteCraft itself may fall below initially, but best practice to comply)
- **APP 1:** Open and transparent management of personal information — publish a privacy policy
- **APP 3:** Collection of personal information must be necessary and lawful
- **APP 5:** Notify individuals about collection (privacy notice at signup)
- **APP 6:** Use and disclosure only for collected purpose
- **APP 8:** Cross-border disclosure — if data stored outside AU (GCP region should be AU)
- **APP 11:** Security — reasonable steps to protect personal information
- **APP 12:** Access — individuals can request their data
- **APP 13:** Correction — individuals can request corrections
- **Notifiable Data Breaches (NDB):** Must notify OAIC and affected individuals if eligible data breach occurs

#### Data Handling Specifics
- **Uploaded documents:** May contain client PII (names, addresses, phone numbers). Encrypted at rest. Auto-deleted per retention policy.
- **AI processing:** Data sent to OpenAI API. OpenAI's data use policy: API data is NOT used for training (as of 2024+). Document this in privacy policy.
- **Payment data:** Never stored. Stripe handles all payment processing (PCI DSS compliant).
- **Location data:** Country/region stored for pricing suggestions. No GPS tracking.
- **Cookie policy:** Minimal cookies (auth token, preferences). No third-party tracking cookies in MVP.

### Required Legal Documents

1. **Privacy Policy** — What we collect, why, how it's stored, user rights
2. **Terms of Service** — Liability limitations, acceptable use, subscription terms
3. **Cookie Policy** — What cookies, why, opt-out
4. **Acceptable Use Policy** — Don't use QuoteCraft for fraud, spam, etc.
5. **Data Processing Addendum** — For when we handle client data on behalf of users

### Implementation Notes

- Host data in **GCP Sydney region (australia-southeast1)** for AU users
- GCP US region for US users (when US expansion begins)
- Encrypt all data at rest (SQLite encryption extension or filesystem-level encryption)
- HTTPS everywhere (enforced)
- Regular security audits (quarterly self-assessment, annual third-party when budget allows)
- Implement data export (user can download all their data as JSON/CSV)
- Implement data deletion (user can delete account and all associated data)

---

## 16. Timeline & Milestones

### Week 1–2: MVP Build

| Day | Milestone |
|-----|-----------|
| 1–2 | Project setup: React + Vite + Tailwind frontend, Express backend, SQLite schema, auth (register/login/JWT) |
| 3–4 | Business profile CRUD, client CRUD, core quote CRUD (manual creation) |
| 5–6 | AI integration: text-to-quote (GPT-4o-mini), photo-to-quote (GPT-4o vision) |
| 7–8 | PDF generation (2–3 templates), quote editor UI |
| 9–10 | Email sending (Resend), public quote page, accept/decline flow, tracking events |
| 11–12 | Dashboard with stats, mobile responsive polish, quote list with filters |
| 13–14 | Testing, bug fixes, deploy to Vercel + GCP VM, SSL, domain setup |

**MVP Definition of Done:**
- ✅ User can register, set up business profile, create AI-generated quote (text + photo), edit it, send via email, and track status
- ✅ Client can view quote at public URL, accept/decline
- ✅ Dashboard shows quote stats
- ✅ Works well on mobile
- ✅ 3 PDF templates functional

### Month 1: Beta Testing

| Week | Activity |
|------|----------|
| 3 | Recruit 10 beta testers (Leo's network) |
| 3 | Onboard individually — watch them use it (screen share or in-person) |
| 4 | Collect feedback, prioritise bug fixes and UX improvements |
| 4 | Iterate: fix top 5 issues, polish onboarding |

**Beta Exit Criteria:**
- 10 users have each sent ≥3 real quotes
- NPS ≥ 40
- No critical bugs
- <5 second quote generation time
- 2+ video testimonials collected

### Month 2: Soft Launch

| Week | Activity |
|------|----------|
| 5 | Enable Stripe billing, implement free tier limits |
| 5 | Remaining PDF templates (10 total) |
| 6 | Launch in 5 Facebook trade groups (organic posts) |
| 6 | Product Hunt launch |
| 7 | Reddit posts (build-in-public story) |
| 8 | First 5 paying customers (target) |

### Month 3: Growth Begins

| Week | Activity |
|------|----------|
| 9 | Facebook Ads start ($500/mo budget) |
| 9 | Start blog (2 SEO articles) |
| 10 | Google Ads start ($300/mo budget) |
| 10 | Implement referral program |
| 11 | Begin Phase 2 development (voice-to-quote, saved templates) |
| 12 | 15 paying users target |

### Month 4–6: Scale & Iterate

- Phase 2 features ship incrementally
- Increase ad spend as CAC proves out
- Target: **100 paying users by Month 6**
- Monthly revenue target: **$1,600 MRR**

### Month 7–12: Acceleration

- Phase 3 features begin (team, analytics, integrations)
- Evaluate mobile app need based on user feedback
- Target partnerships (one trade association)
- Target: **500 paying users by Month 12**
- Monthly revenue target: **$8,000 MRR**

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **ABN** | Australian Business Number — 11-digit identifier for businesses |
| **ACL** | Australian Consumer Law |
| **EIN** | Employer Identification Number (US equivalent of ABN) |
| **GST** | Goods and Services Tax (10% in Australia) |
| **MRR** | Monthly Recurring Revenue |
| **CAC** | Customer Acquisition Cost |
| **LTV** | Lifetime Value (of a customer) |
| **NPS** | Net Promoter Score |
| **Tradie** | Australian/NZ slang for tradesperson |

## Appendix B: Open Questions

1. **Domain:** quotecraft.com.au is ideal for AU launch. quotecraft.app for global. Check availability and pricing.
2. **ABN validation:** Should we verify ABN against the ABR (Australian Business Register) API? Adds legitimacy but adds complexity.
3. **Document upload AI:** How well does GPT-4o handle handwritten quotes in photos? Needs testing with real tradie handwriting.
4. **Pricing for US market:** $15 AUD ≈ $10 USD. Should US pricing be $15 USD ($22 AUD)? Or keep it equivalent?
5. **Mobile app timing:** React Native app is Phase 3, but if 80%+ of users are on mobile, should it be prioritised?
6. **Insurance:** Do we need professional indemnity insurance given we're generating pricing suggestions? Probably yes — consult lawyer.

---

*This document is a living artifact. Update it as decisions are made and the product evolves.*

**Last updated:** 18 February 2026
