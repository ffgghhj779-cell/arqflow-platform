# ArqFlow - Payment & Token-Wallet Billing Reference

This file serves as the system reference for the **Token-Wallet Billing Model** and `usage_counters` tracking. Before executing any task related to payments, subscriptions, upgrades, or bot usage limits, review this document.

---

## 1. Core Architecture: Token-Wallet Model
ArqFlow has replaced the traditional monthly message count quota with a **prepaid EGP wallet**. 
* **The Flow:** The client pays the package price in EGP. This translates into a real token budget (`balance_egp`) and a client-facing balance (`wallet_egp`). The bot replies until the budget runs out or the 1-month validity period expires.
* **Profit Margin:** The margin (`margin_egp`) is hidden from the client.
  * Formula: `token_budget_egp = monthly_fee_egp - margin_egp`
* **Upgrade Price Calculation:**
  $$\text{Upgrade Price} = (\text{New Setup Fee} - \text{Old Setup Fee}) + \text{New Plan Package Price}$$
  * A standard renewal on the same plan costs only the package price (`monthly_fee_egp`).

---

## 2. Database Schema: `usage_counters`
The `usage_counters` table aggregates monthly usage per business. 

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Unique record ID |
| `business_id` | `uuid` (FK) | Reference to `businesses.id` |
| `period_start` | `date` | Start date of the billing month |
| `period_end` | `date` | Expiration date of the period (subscription end date) |
| `balance_egp` | `numeric` | **The real token budget** (e.g. 300 EGP). Used for cutoff enforcement. |
| `wallet_egp` | `numeric` | **The customer-facing wallet balance** (e.g. 500 EGP). Used for UI display. |
| `cost_egp` | `numeric` | The actual token costs consumed by the bot (converted to EGP). |
| `total_tokens` | `bigint` | Accumulated tokens (input + output) for the period. |
| `updated_at` | `timestamptz` | Last updated timestamp |

### Key Math & UI Logic:
1. **Allowed to Reply:** 
   The bot is allowed to reply to a user if and only if:
   $$\text{cost\_egp} < \text{balance\_egp} \quad \text{AND} \quad \text{period\_end} \ge \text{current\_date} \quad \text{AND} \quad \text{business is Active}$$
2. **Remaining Display Balance (for UI):**
   $$\text{Remaining Display EGP} = \text{wallet\_egp} \times \left(1 - \frac{\text{cost\_egp}}{\text{balance\_egp}}\right)$$

---

## 3. Database Functions (PostgreSQL RPCs)
The system relies on three RPC functions defined in Supabase:

### A. `wallet_status(b_id uuid)`
* **Purpose:** Pre-check executed before sending the message to the LLM (typically called by n8n or middleware).
* **Usage:** `SELECT * FROM wallet_status('business_uuid');`
* **Returns:** `allowed (bool)`, `balance_egp`, `cost_egp`, `remaining_egp`, `wallet_egp`, `remaining_display_egp`, `used_pct`, `expires_on`, `biz_status`.
* **Action:** If `allowed = false`, abort LLM execution and prompt the client to renew/upgrade.

### B. `increment_usage(b_id uuid, in_tokens integer, out_tokens integer, msg_cost numeric)`
* **Purpose:** Deducts consumption after each successful bot response.
* **Usage:** `SELECT * FROM increment_usage('business_uuid', in_tokens, out_tokens, msg_cost_egp);`
* **Calculation:** `msg_cost = provider_cost_usd * usd_to_egp` (using the rate in `app_settings`).
* **Returns:** Updated wallet status metrics.

### C. `wallet_topup(b_id uuid, add_budget numeric, add_wallet numeric, new_end date)`
* **Purpose:** Processes top-ups, renewals, and upgrades. Executed when admin approves a payment.
* **Rollover Logic:** Carries over unused budget and wallet display values if the wallet is not expired and has a positive balance:
  * `carry_budget = max(balance_egp - cost_egp, 0)`
  * `carry_wallet = max(wallet_egp * (1 - cost_egp / balance_egp), 0)`
* **Same-Day Renewal:** Resets `cost_egp` to `0` and adds the rollover to prevent UI showing consumed percentage immediately.

---

## 4. Key Files and Routes to Inspect

| File Path | Role |
| :--- | :--- |
| [`src/lib/payments.ts`](file:///c:/Users/makka/Claude/Projects/Arq%20Flow%20Website/Arq_Flow_website-main/src/lib/payments.ts) | Core payment business logic (`approvePayment` / `applySubscriptionPayment`) |
| [`src/lib/plans.ts`](file:///c:/Users/makka/Claude/Projects/Arq%20Flow%20Website/Arq_Flow_website-main/src/lib/plans.ts) | Static configuration of subscription tiers |
| [`src/app/api/dashboard/subscription/pay/route.ts`](file:///c:/Users/makka/Claude/Projects/Arq%20Flow%20Website/Arq_Flow_website-main/src/app/api/dashboard/subscription/pay/route.ts) | Route handler for handling renewal/upgrade receipt uploads |
| [`src/app/api/dashboard/usage/check/route.ts`](file:///c:/Users/makka/Claude/Projects/Arq%20Flow%20Website/Arq_Flow_website-main/src/app/api/dashboard/usage/check/route.ts) | Automated trigger checking 75%/90%/100% usage thresholds |
| [`src/app/dashboard/subscription/SubscriptionClient.tsx`](file:///c:/Users/makka/Claude/Projects/Arq%20Flow%20Website/Arq_Flow_website-main/src/app/dashboard/subscription/SubscriptionClient.tsx) | Client-side UI for viewing plans and paying |
| [`src/app/dashboard/usage/UsageClient.tsx`](file:///c:/Users/makka/Claude/Projects/Arq%20Flow%20Website/Arq_Flow_website-main/src/app/dashboard/usage/UsageClient.tsx) | Client-side UI for viewing real-time usage stats |
| [`docs/TOKEN_WALLET_BILLING.md`](file:///c:/Users/makka/Claude/Projects/Arq%20Flow%20Website/Arq_Flow_website-main/docs/TOKEN_WALLET_BILLING.md) | Technical instructions for n8n workflows integration |
| [`docs/PAYMENTS.md`](file:///c:/Users/makka/Claude/Projects/Arq%20Flow%20Website/Arq_Flow_website-main/docs/PAYMENTS.md) | Full guide on payment/onboarding webhooks and Telegram alerts |
