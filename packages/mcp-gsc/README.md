# @workspace/mcp-gsc

An MCP server that exposes the site's Google Search Console data to Claude
agents, so content work can start from what the site actually ranks for.

It is a thin adapter. All the data logic lives in
[`@workspace/seo/search-console`](../seo/src/search-console), which the admin
app's `/api/admin/search-console/*` routes use as well — the dashboard and the
agents read the same numbers from the same code.

## Setup

The server reads credentials from `apps/admin/.env` (falling back to
`.env.local` and the repo root), so nothing secret goes in the committed
`.mcp.json`:

```
GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
GOOGLE_SEARCH_CONSOLE_SITE_URL=sc-domain:example.com
```

Variables already set in the environment win over the files, so an MCP client
may pass them explicitly instead.

Build before first use — `.mcp.json` runs the compiled output:

```bash
pnpm build              # builds @workspace/seo, then this package
```

Re-run it after changing either package; a stale `dist/` will keep serving the
old tools.

Then register the server. `.mcp.json` is gitignored, so each checkout adds this
itself:

```json
{
    "mcpServers": {
        "search-console": {
            "command": "node",
            "args": ["packages/mcp-gsc/dist/index.js"]
        }
    }
}
```

The client spawns it from the repo root; the server resolves the env files from
its own location, so it works regardless of the working directory.

## Tools

Registered under the `search-console` server (so
`mcp__search-console__content_gaps`, and so on). Read-only throughout —
`submitSitemap` exists in the service layer but is deliberately not exposed.

| Tool                    | Answers                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `summary`               | Site-wide clicks, impressions, CTR, average position, top query                    |
| `top_queries`           | Which queries bring the most traffic                                               |
| `search_queries`        | Every query containing a term, with metrics                                        |
| `query_trend`           | Is one query gaining or slipping, day by day                                       |
| `top_pages`             | Which pages earn the most search traffic                                           |
| `search_pages`          | Performance for a path substring or content type                                   |
| `queries_for_page`      | What a specific page is already found for                                          |
| `pages_for_query`       | Which pages compete for one query (cannibalization)                                |
| `page_trend`            | Did a rewrite move anything                                                        |
| `content_opportunities` | High impressions, weak CTR, and what to do                                         |
| `content_gaps`          | Candidate topics with demand and seemingly no page (verify with `pages_for_query`) |
| `position_changes`      | Ranking winners and losers between two periods                                     |
| `performance_trend`     | Site-wide daily traffic shape                                                      |
| `inspect_url`           | Live index status for one URL (2,000/day quota)                                    |
| `list_sitemaps`         | Submitted sitemaps, warnings, errors, indexed counts                               |

Every date-ranged result is wrapped with the `window` it covers. Search Console
data lags about three days, so windows end three days before today.

When credentials are missing, tools return an explanatory error rather than
empty data, so an agent can tell "nothing ranks" from "nothing is wired up."

### `content_gaps` is a heuristic

It flags a query when the URL of its best-ranking page contains none of the
query's words longer than three characters, so a page covering the topic in
different words reads as a gap — `bbl smell` flags despite `/why-do-bbl-stink`
ranking for it at position 10. Verify with `pages_for_query` before treating a
result as a gap; if a page already ranks, it is a CTR problem, not a gap.

Tracked in [#204](https://github.com/Monsoft-Solutions/alluring-website-v1/issues/204).

## Agent guidance

`.claude/skills/search-console/SKILL.md` tells agents when to reach for which
tool and how to turn query data into copy without keyword-stuffing.
