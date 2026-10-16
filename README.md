# A-Class Dental OS & Profit Intelligence System
> **Every Material. Every Case. Every Pound.**  
> *نظام إدارة طب الأسنان المتكامل والمخزون الحيوي والربحية الحقيقية*  
> Designed for Premium Biomimetic & Adhesive Dentistry Clinics — Kom Ombo / Aswan, Egypt.

---

## 1. System Overview

**A-Class Dental OS** is a specialized, production-ready dental clinic management, inventory control, cost accounting, and profitability intelligence platform. Built specifically for modern multi-doctor practices excelling in **Biomimetic Dentistry, Adhesive Restorations, and Advanced Endodontics**, it traces the entire operational and financial lifecycle:

$$\text{Purchase Material Lots} \longrightarrow \text{Receive Stock (FEFO)} \longrightarrow \text{Record Clinical Consumption} \longrightarrow \text{Calculate Exact Procedure Cost} \longrightarrow \text{Bill Patient} \longrightarrow \text{Collect Cash} \longrightarrow \text{Reconcile Inventory \& Cash} \longrightarrow \text{P\&L Statement}$$

### Key Engineering Principles
* **Real Persistent PostgreSQL Database**: Hosted on managed cloud PostgreSQL (AWS us-east-2 via Neon).
* **Strict Accounting Rules**: Enforces the non-negotiable principle:  
  $$\text{Net Earned Revenue} \neq \text{Cash Collected} \neq \text{Net Operating Profit} \neq \text{Cash Account Balance}$$
* **Pure Algebraic Pricing Engine**: Solves for cost-recovery, target contribution margin, and recommended selling prices across multiple doctor commission bases.
* **Biomimetic Dosing & FEFO Lots**: Smart First-Expired-First-Out (FEFO) depletion for composite syringes, bonding bottles, and fiber ribbons.
* **Multi-Clinic Workspace**: Supports independent clinics (e.g., A-Class Kom Ombo & A-Class Nile Elite) with shared master protocols and separated financial ledgers.
* **Bilingual Arabic RTL First**: Native Arabic RTL typography (Cairo) with instant English LTR switching.

---

## 2. Technology Stack

* **Frontend & Framework**: Next.js 14 (App Router), React 18, TypeScript.
* **Styling**: Tailwind CSS with custom clinical palette (Deep Navy `#08131d`, Sage/Mint `#10b981`, Restrained Bronze `#d97706`).
* **Database**: PostgreSQL 18 on Neon Cloud (`neondb`).
* **ORM**: Prisma ORM 5.22 with 32 normalized models, versioned migrations, and transactional updates.
* **Testing**: Automated financial test suite (`npm test`).
* **Icons & UI**: Lucide React, Clsx, Tailwind Merge.
* **Deployment Target**: Vercel + Managed PostgreSQL.

---

## 3. Core Modules & Clinical Capabilities

1. **Live Executive Dashboard (`/`)**: Real-time financial KPIs (Net Earned Revenue, Cash Collected, Doctor Compensation, Materials Consumed, Operating Profit, Break-even Target), cash drawer balances, and recent procedures ledger.
2. **Biomimetic Materials Library (`/materials`)**: Searchable arsenal including Clearfil SE Bond 2, Clearfil Majesty Posterior, GC EverX Flow, Ribbond THM 2mm, K-Etchant 35%, and Bio-C Sealer with live FEFO lots and expiry warnings.
3. **Consumption Calculator & Calibration (`/consumption`)**:
   - 5-Tier Evidence Hierarchy (Manufacturer Spec, Published Protocol, Clinic Measured, Dentist Estimate, Temporary Default).
   - Clearfil SE Bond 2 Primer vs. Bond drop estimator.
   - Composite syringe dose and remnant waste calculator.
   - Ribbond millimeter cut-off and usable tooth count estimator.
   - Real-world case calibration ledger with sample-size warnings.
4. **Services & Fee Catalog (`/services`)**: Clinical protocols, standard recipes, chair-time requirements, and 3 pricing calculations:
   - Cost-Recovery Minimum Price
   - Target Contribution Margin Price
   - Target Full Operating Margin Price
5. **Interactive What-If Simulator (`/simulator`)**: Real-time simulation of clinic rent, salaries, occupancy, and doctor commission with before-and-after chair-hour costing and break-even analysis.
6. **Price List Versions & Diff Viewer (`/price-versions`)**: Versioned price lists (Draft, Reviewed, Approved, Archived) with snapshot preservation.
7. **Inventory & Stock Movements (`/inventory`)**: Immutable stock movement ledger, additions, write-offs, and room transfers.
8. **Fixed Assets & Reusable Instruments (`/assets`)**: Sirona Intego chair, autoclave, intraoral sensor depreciation, and cost-per-use tracking for diamond burs and rotary files.
9. **Financial Reports & Analytics (`/reports`)**: Official Statement of Profit and Loss (P&L), doctor productivity reports, CSV export with Arabic UTF-8 BOM, and printable PDF formatting.
10. **Patients, Invoices & Collections (`/patients`, `/invoices`)**: Patient balances, visit tracking, procedure finalization, and payment receipts.

---

## 4. Mathematical & Accounting Engine

### A. Chair-Hour Costing Formula
$$\text{Productive Chair Hours} = \text{Active Chairs} \times \text{Working Days} \times \text{Daily Hours} \times \text{Occupancy Rate}$$
$$\text{Cost per Chair Hour} = \frac{\text{Monthly Fixed Operating Expenses}}{\text{Productive Chair Hours}}$$
$$\text{Cost per Chair Minute} = \frac{\text{Cost per Chair Hour}}{60}$$

### B. Algebraic Pricing Equation
For selling price $P$, doctor commission rate $d$, clinic target margin $m$, contingency buffer $b$, tax rate $t$, direct costs $C_{\text{direct}}$, effective lab cost $C_{\text{lab}}$, and allocated chair overhead $C_{\text{overhead}}$:

* **When commission applies to collected/billed price**:
  $$P = \frac{C_{\text{direct}} + C_{\text{lab}} + C_{\text{overhead}}}{1 - d - m - b - t}$$

* **When commission applies to price less lab (`PRICE_LESS_LAB`)**:
  $$P = \frac{C_{\text{direct}} + (1 - d) C_{\text{lab}} + C_{\text{overhead}}}{1 - d - m - b - t}$$

* **When commission applies to price less lab and materials (`PRICE_LESS_LAB_AND_MATERIALS`)**:
  $$P = \frac{(1 - d)(C_{\text{direct}} + C_{\text{lab}}) + C_{\text{overhead}}}{1 - d - m - b - t}$$

* **Validation Rule**: If $1 - d - m - b - t \le 0$, the engine blocks price calculation with an explicit audit diagnostic.

---

## 5. Automated Verification Test Suite

Run the automated financial tests:
```bash
npm test
```
**Test Results**:
```text
====================================================
 RUNNING A-CLASS DENTAL OS CORE FINANCIAL TESTS
====================================================
--- Test Suite 1: Chair-Hour Costing & Overhead ---
  [PASS] Total Available Hours is 416 (2 chairs * 26 days * 8h)
  [PASS] Productive Occupied Hours at 70% is 291.2h
  [PASS] Chair Hour Cost is approx 103.02 EGP/h
  [PASS] Chair Minute Cost is approx 1.717 EGP/min
--- Test Suite 2: Unified Algebraic Pricing Engine ---
  [PASS] Price calculation is valid with reasonable percentages
  [PASS] Direct costs sum: 150 + 20 + 30 = 200 EGP
  [PASS] Allocated overhead is approx 77.26 EGP
  [PASS] Total full cost is approx 277.26 EGP
  [PASS] Selling price solved algebraically: 925 EGP
  [PASS] Doctor compensation at 35% is approx 323.75 EGP
  [PASS] Indirect restoration with PRICE_LESS_LAB solved successfully
  [PASS] Doctor commission excludes laboratory expense
  [PASS] Engine blocks invalid allocations exceeding 100%
  [PASS] Engine gives explicit audit explanation
--- Test Suite 3: Material Consumption Estimator ---
  [PASS] Base cost per gram is 244.898 EGP/g
  [PASS] Theoretical applications: 4.9 / 0.35 = 14.0
  [PASS] Usable applications after 6% waste is 13.2
  [PASS] Cost per application is approx 91.19 EGP
  [PASS] Calibration active with 25 cases
  [PASS] Sample size labeled preliminary (10-30 cases)
--- Test Suite 4: Clearfil SE Bond 2 Protocol ---
  [PASS] Primer drop cost is 3.82 EGP
  [PASS] Bond drop cost is 5.42 EGP
  [PASS] Microbrushes cost: 2 * 1.80 = 3.60 EGP
  [PASS] Total SE Bond 2 Protocol cost is 12.84 EGP
--- Test Suite 5: Break-Even & Financial Target ---
  [PASS] Break-even calculation is valid
  [PASS] Contribution per procedure is 925 EGP
  [PASS] Contribution margin ratio is 50.0%
  [PASS] Break-even volume: 30000 / 925 = 33 procedures/month
  [PASS] Break-even rate is 1.3 procedures/day
  [PASS] Volume for 25k profit: (30000+25000)/925 = 60 procedures/month
  [PASS] Expected scenario delivers target operating profit
====================================================
 RESULTS: 31 PASSED, 0 FAILED
====================================================
```

---

## 6. Installation & Deployment Guide

### Local Development Setup
1. **Clone the repository and install dependencies**:
   ```bash
   git clone https://github.com/your-username/aclass-dental-os.git
   cd aclass-dental-os
   npm install
   ```
2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and provide your PostgreSQL connection string:
   ```bash
   cp .env.example .env
   ```
3. **Synchronize Database & Seed Reference Data**:
   ```bash
   npm run prisma:push
   npm run prisma:seed
   ```
4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.

### Vercel Deployment Workflow
1. Push this repository to GitHub or GitLab.
2. In the **Vercel Dashboard**, click **New Project** and import the repository.
3. In **Environment Variables**, add:
   - `DATABASE_URL`: Your pooled PostgreSQL connection URL (e.g. Neon connection string).
   - `DIRECT_URL`: Your direct PostgreSQL connection URL.
   - `NEXTAUTH_SECRET`: A secure 32+ character token.
   - `NEXT_PUBLIC_APP_NAME`: `A-Class Dental OS`
   - `NEXT_PUBLIC_CLINIC_LOCATION`: `Kom Ombo / Aswan, Egypt`
   - `NEXT_PUBLIC_DEFAULT_CURRENCY`: `EGP`
4. Deploy! Vercel runs `prisma generate && next build` automatically.

---

## 7. Database Backup & Restoration

### Backup via PostgreSQL Dump
```bash
pg_dump "postgresql://neondb_owner:password@ep-your-db.neon.tech/neondb?sslmode=require" \
  --format=custom \
  --file="backup_aclass_$(date +%Y%m%d).dump"
```

### Restoration
```bash
pg_restore --clean --no-owner --dbname="postgresql://neondb_owner:password@ep-your-db.neon.tech/neondb?sslmode=require" \
  "backup_aclass_20261016.dump"
```

---

## 8. Excel & CSV Import Templates
Pre-validated import templates are available in `public/templates/`:
- `public/templates/materials_import_template.csv`
- `public/templates/services_import_template.csv`

---

## 9. Assumptions and Limitations
1. **Fixed Operating Expenses Baseline**: The 30,000 EGP baseline represents an initial planning assumption for the Kom Ombo practice (Facility Rent: 14,000 EGP, Staff Salaries: 12,000 EGP, Utilities: 4,000 EGP). True profitability is calculated from real recorded expenses.
2. **Damaged / Missing Source Rows**: For items with missing supplier pricing (such as the intraoral scanner demo row), the system preserves the empty/zero value and presents an explicit audit flag rather than fabricating a price.
3. **Clinical Role**: A-Class Dental OS is an operational, inventory, and cost intelligence system, not a substitute for clinical judgment.

---

## License
Proprietary — Developed for A-Class Dental Clinic (Aswan / Kom Ombo, Egypt). All rights reserved.
