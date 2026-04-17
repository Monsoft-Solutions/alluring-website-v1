# Update Page Metadata

Automatically detect changed static pages and update their `lastModified` dates in `apps/web/lib/data/page-metadata.ts` for accurate sitemap generation and optimal SEO.

## Purpose

This command ensures that the sitemap reflects accurate update timestamps by:

- Detecting changed files (staged or vs master branch)
- Mapping file paths to URL paths in `page-metadata.ts`
- Updating `lastModified` dates to today's date
- Reporting all changes made

## Process

The command will:

1. **Detect Changed Files**: Check staged files first, fallback to comparing current branch against master
2. **Filter Tracked Pages**: Only process static pages that are tracked in `page-metadata.ts`
3. **Map to URLs**: Convert file paths to their corresponding URL paths
4. **Update Dates**: Replace old dates with today's date (YYYY-MM-DD format)
5. **Report Results**: Show what was detected and updated

## Detection Strategy

### Primary: Staged Files

```bash
git diff --cached --name-only
```

If staged files exist, process only those files.

### Fallback: Branch Comparison

```bash
git diff master...HEAD --name-only
```

If no staged files, compare current branch against master.

## File Path to URL Mapping

### Static Page Mappings

| File Path                                               | URL Path                           |
| ------------------------------------------------------- | ---------------------------------- |
| `apps/web/app/page.tsx`                                 | `/`                                |
| `apps/web/app/about/page.tsx`                           | `/about`                           |
| `apps/web/app/contact-us/page.tsx`                      | `/contact-us`                      |
| `apps/web/app/plastic-surgery-financing-miami/page.tsx` | `/plastic-surgery-financing-miami` |
| `apps/web/app/miami-plastic-surgery-specials/page.tsx`  | `/miami-plastic-surgery-specials`  |
| `apps/web/app/thank-you/page.tsx`                       | `/thank-you`                       |
| `apps/web/app/privacy/page.tsx`                         | `/privacy`                         |
| `apps/web/app/terms/page.tsx`                           | `/terms`                           |
| `apps/web/app/cookies/page.tsx`                         | `/cookies`                         |

### Special Cases

**Surgeon Data Files**: Any file in `apps/web/lib/data/surgeons/*.ts` triggers updates to ALL surgeon pages:

- `/dr-karlinsky`
- `/dr-rita-shats`

**Dynamic Pages (Skip These)**:

- Blog posts: `apps/web/app/[slug]/page.tsx` (for blog posts at root level)
- Gallery: `apps/web/app/gallery/[slug]/page.tsx` and `apps/web/app/gallery/media/[slug]/page.tsx`
- Promotions: `apps/web/app/promotions/[slug]/page.tsx`
- Procedures: `apps/web/app/procedures/[slug]/page.tsx`

These use database `updatedAt` timestamps automatically.

## Implementation Steps

### Step 1: Detect Changed Files

Run git commands to get the list of changed files:

```bash
# First try staged files
git diff --cached --name-only

# If empty, try branch comparison
git diff master...HEAD --name-only
```

### Step 2: Filter and Map Files

For each changed file, determine if it's a tracked static page:

**Pattern Detection**:

- Extract path after `apps/web/app/`
- Remove `/page.tsx` suffix
- Handle root page (`apps/web/app/page.tsx` → `/`)
- Detect surgeon data files
- Skip files with `[slug]` or other dynamic segments

### Step 3: Get Today's Date

Calculate today's date in W3C format (date-only):

```typescript
const today = new Date().toISOString().slice(0, 10)
// Example: '2025-12-16'
```

### Step 4: Read Current Metadata

Read `apps/web/lib/data/page-metadata.ts` to get current dates.

### Step 5: Update Each URL

For each URL path that needs updating, use `StrReplace` to update the date:

```typescript
// Find current line
'/about': '2025-12-15',

// Replace with new date
'/about': '2025-12-16',
```

### Step 6: Report Results

Display a summary showing:

- Files detected with their URL mappings
- Old date → New date for each URL
- Total count of updated pages

## Mapping Logic

### Static Page Pattern

```
File: apps/web/app/{folder}/page.tsx
URL:  /{folder}

Examples:
- apps/web/app/about/page.tsx → /about
- apps/web/app/contact-us/page.tsx → /contact-us
- apps/web/app/plastic-surgery-financing-miami/page.tsx → /plastic-surgery-financing-miami
```

### Root Page Pattern

```
File: apps/web/app/page.tsx
URL:  /
```

### Surgeon Data Pattern

```
File: apps/web/lib/data/surgeons/*.ts
URLs: /dr-karlinsky, /dr-rita-shats (both)
```

### Skip Patterns

Ignore files matching these patterns:

- Contains `[slug]` or `[...slug]`
- Paths: `blog/`, `gallery/`, `promotions/`, `procedures/[slug]`
- List pages: `blog/page.tsx`, `gallery/page.tsx`, `procedures/page.tsx`

## Expected Output

### When Changes Are Detected

```
🔍 Checking for changed pages...

Detection mode: Staged files
Found 2 changed file(s)

Detected changes:
  • apps/web/app/about/page.tsx → /about
  • apps/web/app/contact-us/page.tsx → /contact-us

✅ Updated page-metadata.ts:
  • /about: 2025-12-15 → 2025-12-16
  • /contact-us: 2025-12-14 → 2025-12-16

📋 2 page(s) updated with today's date (2025-12-16)
```

### When Surgeon Data Changes

```
🔍 Checking for changed pages...

Detection mode: Branch comparison (vs master)
Found 1 changed file(s)

Detected changes:
  • apps/web/lib/data/surgeons/surgeons-data.ts → [all surgeon pages]

✅ Updated page-metadata.ts:
  • /dr-karlinsky: 2025-12-10 → 2025-12-16
  • /dr-rita-shats: 2025-12-10 → 2025-12-16

📋 2 page(s) updated with today's date (2025-12-16)
```

### When No Changes Detected

```
🔍 Checking for changed pages...

Detection mode: Staged files
Found 0 changed file(s)

ℹ️ No tracked pages have changed. page-metadata.ts is up to date.
```

### When Only Dynamic Pages Changed

```
🔍 Checking for changed pages...

Detection mode: Staged files
Found 3 changed file(s)

Skipped files (use database timestamps):
  • apps/web/app/[slug]/page.tsx (blog posts at root level)
  • apps/web/app/gallery/[slug]/page.tsx
  • apps/web/app/promotions/[slug]/page.tsx

ℹ️ No tracked static pages changed. page-metadata.ts is up to date.
```

## Edge Cases Handling

### New Static Pages Not in Metadata

If a new static page is detected that follows the pattern but isn't in `pageLastModified`:

```
⚠️ New page detected: /new-service
This page is not tracked in page-metadata.ts.
Please add it manually:

'/new-service': '2025-12-16',
```

### Mixed Changes (Static + Dynamic)

Process static pages, skip dynamic pages, report both:

```
Detected changes:
  • apps/web/app/about/page.tsx → /about

Skipped files (use database timestamps):
  • apps/web/app/[slug]/page.tsx (blog posts at root level)

✅ Updated page-metadata.ts:
  • /about: 2025-12-15 → 2025-12-16
```

### No Git Repository

If not in a git repository:

```
❌ Error: Not in a git repository
This command requires git to detect changed files.
```

### Git Command Failures

If git commands fail:

```
❌ Error: Failed to detect changes
Could not run git commands. Please ensure you're in a git repository.
```

## File Reference

**Target File**: `apps/web/lib/data/page-metadata.ts`

**Format**:

```typescript
export const pageLastModified: Record<string, string> = {
    '/': '2025-12-16',
    '/about': '2025-12-16',
    // ... more entries
}
```

## Command Execution

To run this command:

1. Open Cursor Command Palette (Cmd/Ctrl + Shift + P)
2. Type "Cursor: Run Command"
3. Select "Update Page Metadata"
4. The command will automatically detect changes and update dates

## Related Files

- **Rule**: `.cursor/rules/page-metadata-updater.mdc` - Agent that watches for changes
- **Data**: `apps/web/lib/data/page-metadata.ts` - The file being updated
- **Sitemap**: `apps/web/app/sitemap/pages.xml/route.ts` - Consumes these dates

## Benefits

✅ **SEO Performance**: Google prioritizes crawling pages with accurate change dates
✅ **Crawl Efficiency**: Reduces wasted crawl budget on unchanged pages
✅ **Index Freshness**: Updated pages get re-indexed faster
✅ **Automation**: No manual date tracking needed
✅ **Accuracy**: Dates reflect actual content changes

---

**Now execute the command logic below:**

## Execution Instructions

1. Run `git diff --cached --name-only` to check for staged files
2. If no staged files, run `git diff master...HEAD --name-only`
3. Filter the results to only include tracked static pages
4. For each tracked page:
    - Map file path to URL path
    - Get today's date in YYYY-MM-DD format
    - Read current `page-metadata.ts`
    - Use `StrReplace` to update the date for that URL
5. Report all changes made

### Detailed Execution Steps

#### Step 1: Detect Changes

```bash
# Check staged files first
STAGED=$(git diff --cached --name-only)

if [ -z "$STAGED" ]; then
    # No staged files, check branch vs master
    CHANGED=$(git diff master...HEAD --name-only)
    MODE="Branch comparison (vs master)"
else
    CHANGED="$STAGED"
    MODE="Staged files"
fi
```

#### Step 2: Process Each File

For each file in `$CHANGED`:

**A. Static Page Detection**:

```
Pattern: apps/web/app/*/page.tsx (but not [slug])
Action: Extract folder name as URL

Example:
  File: apps/web/app/about/page.tsx
  Extract: about
  URL: /about
```

**B. Root Page Detection**:

```
Pattern: apps/web/app/page.tsx (exact match)
Action: Map to root URL

Example:
  File: apps/web/app/page.tsx
  URL: /
```

**C. Surgeon Data Detection**:

```
Pattern: apps/web/lib/data/surgeons/*.ts
Action: Queue all surgeon URLs for update

URLs to update:
  - /dr-karlinsky
  - /dr-rita-shats
```

**D. Dynamic Page Detection (Skip)**:

```
Patterns to skip:
  - Contains [slug]
  - Contains [id]
  - Contains [...
  - Path contains: blog/, gallery/, promotions/, procedures/[slug]
```

#### Step 3: Update Metadata File

For each URL collected:

1. Get today's date: `new Date().toISOString().slice(0, 10)`
2. Read `apps/web/lib/data/page-metadata.ts`
3. Find the line for this URL: `'/about': '2025-12-15',`
4. Replace with new date: `'/about': '2025-12-16',`
5. Track old date → new date for reporting

#### Step 4: Generate Report

Display:

- Detection mode used
- Number of files found
- List of detected changes with mappings
- List of updates made (old → new dates)
- Total count
- Any warnings for new pages not in metadata

## Implementation Notes

- Use shell commands for git operations
- Use `Read` tool to read current metadata file
- Use `StrReplace` tool to update each URL's date
- Process all URLs in sequence
- Handle errors gracefully
- Provide clear user feedback

**Execute these steps now to update page-metadata.ts based on detected changes.**
