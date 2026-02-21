# DANIER INVENTORY INTELLIGENCE SYSTEM — Complete Product Specification

> Use this prompt to onboard any AI agent to understand every feature, button, dropdown, page, API endpoint, and data flow in the system.

---

## OVERVIEW

**Danier Inventory Intelligence** is a full-stack inventory monitoring and alert system for the fashion brand **Danier**. It processes Excel inventory reports, identifies "Key Items" (items with Season Code `KI00`), detects low stock against configurable thresholds, and sends email alerts to recipients.

**Tech Stack:**
- **Frontend:** React 18 + Tailwind CSS, deployed on **Vercel** at `inventoryreport.ca`
- **Backend:** Python FastAPI, deployed on **Render** at `https://danier-s-alert-system.onrender.com`
- **Database:** SQLite (with persistent disk on Render)
- **Email:** Gmail SMTP (`danieralertsystem@gmail.com`)
- **Repository:** `https://github.com/Sarthak-Sethi28/DANIER-S-ALERT-SYSTEM-.git` (branch: `main`)

**Auto-deploy:** Pushing to `main` auto-deploys frontend (Vercel) and backend (Render).

---

## ARCHITECTURE

```
User → Vercel (React frontend) → Render (FastAPI backend) → SQLite DB
                                                           → Gmail SMTP
                                                           → Excel file storage (uploads/)
```

**Shared State:** A `DataContext` provider wraps the entire React app. On initial load, it prefetches ALL data for every tab in parallel (batch alerts, thresholds, product options) and caches them in both React state and `localStorage` (30-min TTL). This means switching between tabs is instant — no loading spinners.

---

## AUTHENTICATION

### Login Page (`/` when not authenticated)
- **Username field:** Text input
- **Password field:** Password input
- **"Sign In" button:** Submits `POST /auth/login` with `application/x-www-form-urlencoded`
- **"Forgot password?" link:** Switches to reset flow

### Password Reset Flow
- **Step 1:** Enter username → **"Send Code" button** → `POST /auth/request-reset` → sends 6-digit code to registered email recipients
- **Step 2:** Enter 6-digit code + new password + confirm password → **"Confirm Reset" button** → `POST /auth/confirm-reset`
- **"Back to sign in" link:** Returns to login form

### Auth Logic (Backend)
1. **Primary check:** Compares against `APP_USERNAME` and `APP_PASSWORD` environment variables
2. **Fallback:** Checks `UserCredential` table in SQLite (SHA256 hashed with salt)
3. **Safety net:** Accepts password variants `Danier2024!`, `danier2024` for compatibility
4. **On startup:** Syncs admin user from env vars to DB via `_sync_admin_user_on_startup()`
5. **Session:** Returns a `sessionId` string (stateless — frontend stores in `localStorage` as `danier_auth`)

### Header (visible on all pages when authenticated)
- **Brand logo:** "DANIER — Inventory Intelligence"
- **Username display:** Shows logged-in user
- **Theme toggle button (moon/sun icon):** Switches dark/light mode, persists to `localStorage`
- **"Sign Out" button (red):** Clears `localStorage`, redirects to login

---

## NAVIGATION BAR

Horizontal tab bar below header. Tabs:

| Tab | Route | Icon | Description |
|-----|-------|------|-------------|
| **Upload** (has "START" badge) | `/upload` | Upload icon | Upload Excel inventory files |
| **Dashboard** | `/dashboard` | BarChart3 icon | Main alerts dashboard with stats |
| **Thresholds** | `/thresholds` | AlertTriangle icon | Configure stock thresholds per item/size/color |
| **Key Items** | `/key-items` | Package icon | Simple view of all KI00 items with color totals |
| **Recipients** | `/recipients` | Users icon | Manage email alert recipients |
| **Help** | `/help` | HelpCircle icon | Support and documentation |

Active tab has gold/accent background. All tab data is prefetched by `DataContext` on app load.

---

## PAGE 1: UPLOAD (`/upload`)

### Purpose
Upload `.xlsx` inventory Excel files for processing.

### UI Elements
- **Connection status badge** (top): Shows "Checking...", "Connected" (green), or "Disconnected" (red). Calls `GET /health` on mount, retries every 3s if failed.
- **File requirements section:** Lists required format (`.xlsx`, must contain columns: `Season Code`, `Item Description`, `Grand Total`, etc.)
- **Drag-and-drop zone:** Large bordered area. Accepts file drag or click to browse. Only `.xlsx` files accepted.
- **"Upload & Process Report" button:** Uploads file via `POST /upload-report`. Shows progress bar (simulated 0→90%, then 100% on success).
- **Success screen:** Shows checkmark + "Redirecting to Dashboard..." message. After 1.5 seconds, auto-navigates to `/dashboard`.

### On Upload Success
1. Backend saves file as `inventory_YYYYMMDD_HHMMSS.xlsx` in `uploads/` directory
2. Deactivates all previous files in DB, creates new `UploadedFile` record
3. Clears ALL backend caches
4. Frontend calls `refreshAll()` from `DataContext` — prefetches batch alerts, thresholds, and options for all tabs
5. Redirects to Dashboard after 1.5s (data is already loaded)

### Backend Processing (`POST /upload-report`)
- Validates file extension and required columns (reads first 10 rows)
- Saves permanently to disk with timestamp filename
- Triggers background cache warm-up
- Returns success with file info

---

## PAGE 2: DASHBOARD (`/dashboard`)

### Purpose
Main overview of all Key Items (KI00) with low stock alerts, stats, search, and email functionality.

### Top Section — Stats Cards (5 cards in a row)
| Card | Value | Clickable? |
|------|-------|------------|
| **Total Items** | Count of all KI00 items | No |
| **Active Alerts** | Total low stock alerts across all items | No |
| **Critical Items** | Alerts with shortage ≥ 10 (excluding order-placed) | No |
| **Order Placed** | Items that have new orders placed | **Yes** → opens Order Placed Modal |
| **Healthy Stock** | Items with 0 alerts | **Yes** → opens Healthy Stock Modal |

### Action Controls (top right)
- **Search input:** Type article name/number → press Enter or click **"Go" button** → searches within cached batch alerts first, falls back to `GET /search/article/{term}`. Scrolls to and expands matching item.
- **"Download All" button (green):** Calls `POST /alerts/download-all` → generates Excel report with all alerts (color-coded by priority), sends email with Excel attachment to all active recipients, downloads Excel file to browser.
- **"Refresh" button (gold):** Re-fetches `GET /key-items/batch-alerts` via context.

### Filter/Sort Bar
- **Filter tabs:** All | Critical | Alerts | Healthy — filters the item list
- **Sort toggle:** Urgency (items with most alerts first) ↔ A–Z (alphabetical)
- **"Expand All" / "Collapse All" button:** Toggles all items open/closed

### Critical Banner
- Appears when critical items exist (shortage ≥ 10)
- Shows count of critical items + **"View Critical" button** (sets filter to critical) + **"Download Report" button**

### Item Cards (main list)
Each KI00 item is a collapsible card:
- **Left side:** Icon (red AlertTriangle if alerts, green Package if healthy), item name, alert count badge
- **Right side:** Alert count badge, chevron expand/collapse icon
- **Border-left color:** Red = has alerts, Green = healthy
- **Click anywhere on header** → toggles expanded view

### Expanded Item View (alert table)
When expanded, shows a table:

| Column | Description |
|--------|-------------|
| Color | Variant color |
| Size | Extracted from variant code |
| Item Number | Item number if available |
| Current Stock | Actual stock level |
| Required | Threshold value |
| Shortage | How many units short (red, bold) |
| New Order | Number of units on order (if any) |
| Order Date | Date of new order (if any) |
| Priority | Badge: "CRITICAL" (red, shortage ≥10), "HIGH" (orange, ≥5), "MEDIUM" (amber, <5), or "ORDER PLACED" (green) |

- **"Email Alerts Active" button** (per item, top-right of table): Sends email alert for this specific item to all active recipients via `POST /email/send-alert`. Shows states: Sending... → Email Sent → (resets after 3s).

### Order Placed Modal
- Triggered by clicking "Order Placed" stats card
- Lists all items that have orders placed (new_order > 0)
- Expandable per item, then expandable per variant showing: Item Number, Current Stock, Required, Shortage, Order qty, Order date
- **"X" button** (top right): Closes modal

### Healthy Stock Modal
- Triggered by clicking "Healthy Stock" stats card
- Grid of cards showing healthy items with name and total stock
- **"X" button**: Closes modal

### Toast Notifications
- Auto-dismissing notifications for success/error/info events
- Appear top-right, dismiss after a few seconds

### Data Source
- Reads from `DataContext.batchAlerts` (prefetched on app load)
- No API call on tab mount — instant display

---

## PAGE 3: THRESHOLD MANAGER (`/thresholds`)

### Purpose
Configure custom stock thresholds per product/size/color combination. When a threshold changes, the system recalculates alerts from the Excel file to identify new shortages.

### Header
- Title: "Threshold Manager"
- Badge: "{N} products loaded" (green, shows when options are ready)

### Create/Update Form
**Row 1 — Product Name:**
- **Dropdown (`<select>`):** Lists all KI00 product names (from `GET /key-items/all-options`, preloaded via DataContext). Selecting a product instantly populates size/color dropdowns from cached data.

**Row 2 — Three columns:**
- **Size dropdown:** Shows available sizes for selected product. If a color is selected first, filters to sizes available in that color. Shows count: "Size (N)".
- **Color dropdown:** Shows available colors for selected product. If a size is selected first, filters to colors available in that size. Shows count: "Color (N)".
- **Threshold input:** Number field, minimum 0. Enter the desired threshold value.

**Row 3:**
- **"Save Threshold" button (blue, full width):** Disabled until all fields filled. Calls `POST /thresholds/set` with `item_name`, `size`, `color`, `threshold`. Backend persists to `ThresholdOverride` table, records change in `ThresholdHistory`, recalculates alerts from Excel, and returns affected variants.

### Recalculated Alerts Display
After saving, shows a yellow box:
- Title: "Recalculated Alerts for {item_name}" with count
- Table: Size | Color | Stock | Threshold | Status (LOW STOCK in red, or OK in green)
- This shows the immediate impact of the threshold change

### Existing Overrides List
- Title: "Existing Overrides" + **"Refresh" button**
- If empty: "No custom thresholds set yet."
- Each override shows:
  - Item name (bold)
  - Size + Color
  - **Inline threshold input:** Edit value directly, saves on blur
  - **"Edit" button:** Pre-fills the create form with this override's values
  - **"Reset" button (red):** Calls `DELETE /thresholds/reset/{item}/{size}/{color}` to remove custom threshold and revert to default

### Recent Changes (History)
- Title: "Recent Changes (for {item_name})" — shows history for currently selected product
- Each entry: Item • Size • Color, Old → New threshold, timestamp
- Fetched via `GET /thresholds/history?item_name={name}&limit=50`

### Threshold Logic (Backend)
Priority order:
1. **Custom override** (from ThresholdOverride table) — highest priority
2. **Product group derived** — Women's (product group '10xx'): different defaults per size (3XS:5, 2XS:15, XS:30, S:40, M:40, L:30, XL:15). Men's (product group '20xx'): XS:5, S:20, M:50, L:50, XL:50, 2XL:20, 3XL:10
3. **Global default** — `SIZE_THRESHOLD` env var, default `30`

### Data Source
- Reads from `DataContext.thresholds` and `DataContext.allOptions` (prefetched)
- Instant on tab mount

---

## PAGE 4: KEY ITEMS DASHBOARD (`/key-items`)

### Purpose
Simple, clean view of all KI00 items with total stock and color breakdowns.

### Header
- Title: "Key Items Dashboard"
- Subtitle: "Click on any key item to view detailed stock alerts"
- "{N} items loaded" count
- **"Refresh" button:** Re-fetches batch alerts. Shows spinning icon during refresh.

### Item Cards (collapsible list)
Each item is a card:
- **Package icon** (blue) + **Item name** (bold)
- **"Total stock: {N}" badge** (green)
- **"{N} alerts" badge** (red, only if alerts > 0)
- **Chevron** → click to expand

### Expanded View
Shows "Total by Colour" section:
- Grid of cards (3 columns on desktop)
- Each card: Color name | Total stock in units

### Loading State
- Skeleton placeholder rows (6 animated rows) while loading

### Data Source
- Reads directly from `DataContext.batchAlerts.key_items`
- Instant on tab mount

---

## PAGE 5: RECIPIENTS (`/recipients`)

### Purpose
Manage email recipients who receive stock alerts.

### Email Status Card (top)
- Shows whether SMTP is configured
- Data from `GET /email/status`

### Stats Cards (3 cards)
| Card | Value |
|------|-------|
| Active Recipients | Count of active recipients |
| Total Recipients | Total count |
| Most Active | Recipient with most emails sent |

### Add Recipient Form
- **"Add Recipient" button:** Shows the form
- **Email input:** Required
- **Name input:** Optional
- **Department input:** Optional
- **"Add Recipient" submit button:** Calls `POST /recipients`
- **"Cancel" button:** Hides form

### Recipients Table
| Column | Description |
|--------|-------------|
| Email | Recipient email address |
| Name | Display name |
| Department | Department |
| Emails Sent | Count of emails sent to this recipient |
| Last Sent | Timestamp of last email |
| Actions | Edit and Delete buttons |

- **"Edit" button:** Opens inline edit form (name, department editable) → **"Update Recipient" button** → `PUT /recipients/{email}`
- **"Delete" button:** Calls `DELETE /recipients/{email}` (soft delete)

### Status Messages
- Green success or red error messages after actions

---

## PAGE 6: SEARCH (`/search`)

### Purpose
Search for specific articles/items across inventory.

### UI Elements
- **Search input:** Text field for item name, article number, or variant code
- **"Search" button:** Calls `GET /search/article/{term}`
- **Results list:** Each result shows item name, color, size, current stock

---

## PAGE 7: HELP (`/help`)

### Purpose
Support documentation and contact information.

### Sections
- **Contact card:** Email (`support@inventoryreport.ca`), response time (24 hours), company (Danier), languages (English, French)
- **Quick action cards:** Emergency Support, Feature Requests, Training
- **Help sections:** Premium Support details, System Features overview, Fashion Intelligence explanation
- **"Contact Premium Support" button:** Opens mailto link

---

## BACKEND API ENDPOINTS (Complete Reference)

### Authentication
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/auth/status` | Debug: returns expected username from env |
| `POST` | `/auth/login` | Login with username/password (form-encoded) |
| `POST` | `/auth/request-reset` | Request password reset code |
| `POST` | `/auth/confirm-reset` | Confirm reset with code + new password |

### File Upload & Management
| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/upload-report` | Upload `.xlsx` inventory file |
| `GET` | `/inventory-files` | List all uploaded files with key items |
| `GET` | `/inventory-files/{filename}/alerts` | Alerts for specific file |
| `GET` | `/upload-history` | Upload history with cache validation |
| `GET` | `/files/list-fast` | Ultra-fast file list |
| `GET` | `/files/stats/{filename}` | Cached stats for file |
| `GET` | `/files/enhanced-list` | Enhanced file list with metadata |
| `GET` | `/files/archive` | File archive (recent vs old) |
| `GET` | `/files/archive/{filename}/download` | Download archived file |

### Key Items & Alerts
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/key-items/batch-alerts` | **Primary endpoint:** All items with all alerts in one call |
| `GET` | `/key-items/alerts` | Current alerts from latest file |
| `GET` | `/key-items/list` | List of key item names |
| `GET` | `/key-items/{item_name}/alerts` | Alerts for specific item |
| `GET` | `/key-items/summary` | Summary of all items |
| `GET` | `/key-items/details/{item_name}` | Details for single item |
| `GET` | `/key-items/options/{item_name}` | Sizes/colors for one item |
| `GET` | `/key-items/all-options` | Sizes/colors for ALL items (one call) |

### Thresholds
| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/thresholds/set` | Set custom threshold (form-encoded) |
| `GET` | `/thresholds/get/{item}/{size}/{color}` | Get threshold for combination |
| `GET` | `/thresholds/all` | All custom thresholds |
| `GET` | `/thresholds/overrides` | All DB-persisted overrides |
| `GET` | `/thresholds/history` | Change history (optional `?item_name=` filter) |
| `DELETE` | `/thresholds/reset/{item}/{size}/{color}` | Reset to default |

### Email
| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/email/send-alert` | Send alert email (optional `item_name` form param) |
| `GET` | `/email/status` | SMTP configuration status |

### Recipients
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/recipients` | List all active recipients |
| `POST` | `/recipients` | Add recipient (form: email, name, department) |
| `PUT` | `/recipients/{email}` | Update recipient |
| `DELETE` | `/recipients/{email}` | Soft-delete recipient |

### Search
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/search/article/{term}` | Search items by name/code/color |

### File Comparison & Analysis
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/files/smart-analysis/{file1}/{file2}` | Compare two inventory files |
| `GET` | `/files/performance-analysis` | Performance across all files |
| `GET` | `/threshold-analysis` | Threshold changes between uploads |

### Downloads
| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/alerts/download-all` | Generate Excel + email it + return file |

### System
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Health check with memory info |
| `GET` | `/test` | System test with latest file |
| `POST` | `/clear-cache` | Clear all caches |
| `POST` | `/warm-cache` | Warm up caches |

---

## DATABASE TABLES

### UploadedFile
Tracks uploaded Excel files.
- `id`, `filename`, `file_path`, `file_size`, `upload_date`, `is_active` (only latest is active), `total_items`, `low_stock_count`

### Recipient
Email recipients for alerts.
- `id`, `email` (unique), `name`, `department`, `is_active`, `created_at`, `last_sent`, `email_count`, `preferences` (JSON)

### ThresholdOverride
Custom threshold overrides per item/size/color.
- `id`, `item_name`, `size`, `color`, `threshold`, `updated_at`

### ThresholdHistory
Audit trail for threshold changes.
- `id`, `item_name`, `size`, `color`, `old_threshold`, `new_threshold`, `changed_at`, `note`

### UserCredential
Login credentials.
- `id`, `username` (unique), `password_hash`, `password_salt`, `email`, `reset_code_hash`, `reset_code_expires_at`, `updated_at`

---

## KEY BUSINESS LOGIC

### What is a "Key Item"?
Any inventory row where `Season Code == 'KI00'`. These are critical items that need stock monitoring.

### How are alerts generated?
For each KI00 item variant (unique combination of item name + size + color):
1. Get stock level from `Grand Total` column
2. Get threshold (custom override → product group derived → global default of 30)
3. If `stock < threshold` → LOW STOCK alert with `shortage = threshold - stock`

### Alert Priority
- **CRITICAL:** shortage ≥ 10
- **HIGH:** shortage ≥ 5
- **MEDIUM:** shortage < 5
- **ORDER PLACED:** `new_order > 0` (overrides other priorities)

### Size Extraction
Sizes are extracted from `Variant Code` column using pattern matching (e.g., `990.3XS` → `3XS`, `990.L` → `L`).

---

## CACHING STRATEGY

### Backend
- **File cache:** Parsed DataFrame cached in memory per file path
- **Batch alerts cache:** All processed alerts cached with 30-min TTL, keyed by file path + modification time
- **Options cache:** All product options (sizes/colors) cached in memory
- **Cache warming:** On startup, background thread loads latest file and pre-builds all caches
- **Cache invalidation:** ALL caches cleared on file upload or threshold change
- **GZip:** All responses > 500 bytes are compressed

### Frontend
- **DataContext:** Holds batch alerts, thresholds, and options in React state
- **localStorage:** Mirrors DataContext with 30-min TTL keys
- **Stale-while-revalidate:** Shows cached data immediately, fetches fresh data in background

---

## ENVIRONMENT VARIABLES

### Backend (Render)
| Variable | Purpose | Default |
|----------|---------|---------|
| `APP_USERNAME` | Admin login username | `danier_admin` |
| `APP_PASSWORD` | Admin login password | `danier2024` |
| `SIZE_THRESHOLD` | Default stock threshold | `30` |
| `SMTP_USER` | Gmail address for sending | `danieralertsystem@gmail.com` |
| `SMTP_PASS` | Gmail App Password | (hardcoded fallback) |
| `UPLOAD_DIR` | File upload directory | `uploads` |
| `DATABASE_URL` | SQLite path | `sqlite:///./danier_alerts.db` |

### Frontend (Vercel)
| Variable | Purpose | Default |
|----------|---------|---------|
| `REACT_APP_API_BASE_URL` | Backend URL | `https://danier-s-alert-system.onrender.com` |

---

## DEPLOYMENT

- **Frontend:** Vercel auto-deploys from `main` branch. Root directory: `frontend/`. Build command: `CI=false react-scripts build`.
- **Backend:** Render auto-deploys from `main` branch. Uses `requirements.txt` for dependencies. Has persistent disk for SQLite + uploads.
- **Domain:** `inventoryreport.ca` points to Vercel deployment.

---

## FILE STRUCTURE

```
danier-alert-system/
├── frontend/
│   ├── src/
│   │   ├── App.js                    # Routing, auth, navigation, theme
│   │   ├── DataContext.js            # Shared state provider (prefetches all data)
│   │   ├── config.js                 # API_BASE_URL configuration
│   │   ├── services/
│   │   │   └── api.js                # All API methods with retry logic
│   │   └── components/
│   │       ├── Login.jsx             # Authentication + password reset
│   │       ├── UploadPage.jsx        # File upload with drag-and-drop
│   │       ├── Dashboard.jsx         # Main dashboard with stats, alerts, modals
│   │       ├── ThresholdManager.jsx  # Threshold configuration
│   │       ├── KeyItemsDashboard.jsx # Simple key items view
│   │       ├── Recipients.jsx        # Email recipient management
│   │       ├── SearchBar.jsx         # Article search
│   │       └── HelpPage.jsx          # Help and support
│   ├── vercel.json                   # Vercel deployment config
│   └── package.json                  # Dependencies + build script
├── backend/
│   ├── main.py                       # FastAPI app with all endpoints
│   ├── key_items_service.py          # Core business logic + caching
│   ├── email_service.py              # Gmail SMTP email sending
│   ├── models.py                     # SQLAlchemy database models
│   ├── file_storage_service.py       # File management
│   ├── comparison_service.py         # File comparison analysis
│   ├── recipients_storage.py         # Recipient management
│   ├── threshold_analysis_service.py # Threshold analysis
│   └── requirements.txt              # Python dependencies
└── render.yaml                       # Render deployment config
```
