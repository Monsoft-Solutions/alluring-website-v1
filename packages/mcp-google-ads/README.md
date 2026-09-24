# @workspace/mcp-google-ads

An MCP server that exposes the practice's Google Ads account to Claude agents,
read-only. A thin adapter over [`@workspace/google-ads`](../google-ads), the
data layer the admin app will share.

## Access

Google sunset Google Ads API developer tokens on **2026-09-09**. API access now
belongs to the Google Cloud project that owns the credentials. The project behind
the shared service account (`vernisai-1739236652392`) has **Explorer** access:
2,880 operations a day on production accounts.

The service account (`GOOGLE_CLIENT_EMAIL`, the same one Search Console and GA4
use) is a **Read only** user on account 447-254-7809. Its domain,
`vernisai-1739236652392.iam.gserviceaccount.com`, had to be added under
Admin → Access and security → Security → Allowed domains first. Without that,
the invite fails with "isn't in an allowed domain".

## Setup

Credentials come from `apps/admin/.env`, the same file the Search Console
server reads:

```
GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
GOOGLE_ADS_CUSTOMER_ID=4472547809
# optional
GOOGLE_ADS_LOGIN_CUSTOMER_ID=   # only when access comes through a manager account
GOOGLE_ADS_API_VERSION=v25      # default
GOOGLE_ADS_TIME_ZONE=America/New_York  # default
```

Build, then register the server. `.mcp.json` is gitignored, so each checkout
adds this itself:

```bash
pnpm build
```

```json
{
    "mcpServers": {
        "google-ads": {
            "command": "node",
            "args": ["packages/mcp-google-ads/dist/index.js"]
        }
    }
}
```

## Tools

Registered under `google-ads` (so `mcp__google-ads__campaign_performance`, and
so on). Every date-ranged result echoes its window. Windows are Miami calendar
days ending yesterday unless `endDate` is given.

| Tool                   | Answers                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `account_overview`     | Totals for a window, plus the account tracking template and final URL suffix                |
| `campaign_performance` | Spend, CPC, CPA, budget, bidding and impression share per campaign                          |
| `daily_trend`          | Day-by-day delivery for the account or one campaign (zero days included)                    |
| `search_terms`         | What people actually typed, with match type and keyword/negative status                     |
| `keywords`             | Keyword spend, quality score and impression share                                           |
| `landing_pages`        | Performance per page, rolled up across tagged variants; `expanded` shows PMax URL expansion |
| `conversion_actions`   | Every conversion action: primary or not, origin, and what it recorded                       |
| `change_history`       | Who changed what (last 30 days), optionally with old → new values                           |
| `lookup_click`         | gclid → campaign, ad group, keyword, device, network (last 90 days)                         |
| `list_fields`          | GAQL field metadata under a prefix                                                          |
| `gaql_search`          | Any GAQL SELECT, rows keyed by field name, money in dollars                                 |

Agent guidance: `.claude/skills/google-ads/SKILL.md`.
