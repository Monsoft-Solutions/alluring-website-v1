---
name: vercel-blob-upload
description: Upload images to Vercel Blob storage with organized folder structure and descriptive naming. Updates code references to use CDN URLs.
invocation: user
user_invocation: /upload-to-vercel
version: 1.0.0
---

# Vercel Blob Image Upload

<command-name>upload-to-vercel</command-name>

Upload local images to Vercel Blob storage with organized folder structure, descriptive naming, and automatic reference updates.

## Quick Start

When invoked, this skill:

1. Identifies images to upload (staged files, specified folder, or user selection)
2. Organizes images into logical folders on Vercel Blob
3. Uploads with descriptive names and brand suffix
4. Updates code references to use CDN URLs
5. Optionally removes local files

## Naming Convention

All uploaded images follow this pattern:

```
{folder}/{descriptive-name}-alluring-plastic-surgery-miami.{ext}
```

**Examples:**

- `procedures/brazilian-butt-lift/hero-alluring-plastic-surgery-miami.webp`
- `procedures/tummy-tuck/recovery-timeline-alluring-plastic-surgery-miami.webp`
- `blog/mommy-makeover-guide/featured-alluring-plastic-surgery-miami.webp`

## Workflow

### Step 1: Identify Images

Check for images to upload in this order:

1. **Git staged images** - Check `git status` for staged image files (A status)
2. **User-specified folder** - If user provides a path
3. **Interactive selection** - Ask user to specify

```bash
# Check for staged images
git status --porcelain | grep -E "^A.*\.(webp|jpg|jpeg|png|gif|svg)$"
```

### Step 2: Determine Organization

Ask the user about the upload context:

```
Where should these images be stored?
1. procedures/{procedure-slug}/ - For procedure page images
2. blog/{post-slug}/ - For blog post images
3. gallery/ - For general gallery images
4. custom/ - Specify a custom path
```

### Step 3: Generate Descriptive Names

For each image, ensure it has a descriptive name:

| Original Name       | Transformed Name                                   |
| ------------------- | -------------------------------------------------- |
| `hero.webp`         | `hero-alluring-plastic-surgery-miami.webp`         |
| `IMG_1234.jpg`      | Ask user for descriptive name                      |
| `bbl-recovery.webp` | `bbl-recovery-alluring-plastic-surgery-miami.webp` |

**Naming Rules:**

- Use kebab-case (lowercase with hyphens)
- Be descriptive (what the image shows)
- Always append `-alluring-plastic-surgery-miami` before extension
- Preserve original extension

### Step 4: Upload to Vercel Blob

Use the `mcp__vercel-blob__vercel-blob-put-file` tool for each image:

```typescript
// Upload parameters
{
  filePath: "/absolute/path/to/local/image.webp",
  pathname: "procedures/brazilian-butt-lift/hero-alluring-plastic-surgery-miami.webp",
  addRandomSuffix: false  // Keep exact names for predictable URLs
}
```

**Parallel Uploads:** Upload multiple images in parallel when possible for efficiency.

### Step 5: Update References

After successful upload, update all code references:

**Before:**

```typescript
src: '/images/procedures/brazilian-butt-lift/hero.webp'
```

**After:**

```typescript
src: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/brazilian-butt-lift/hero-alluring-plastic-surgery-miami.webp'
```

Search for references using:

```bash
# Find files referencing the old path
grep -r "/images/procedures/{slug}/" apps/web/
```

### Step 6: Cleanup (Optional)

Ask user if they want to:

1. Remove local image files
2. Unstage from git
3. Keep local copies as backup

## Folder Structure on Vercel Blob

```
vercel-blob/
├── procedures/
│   ├── brazilian-butt-lift/
│   │   ├── hero-alluring-plastic-surgery-miami.webp
│   │   ├── curve-enhancement-alluring-plastic-surgery-miami.webp
│   │   └── recovery-timeline-alluring-plastic-surgery-miami.webp
│   ├── tummy-tuck/
│   │   └── ...
│   └── breast-augmentation/
│       └── ...
├── blog/
│   ├── mommy-makeover-guide/
│   │   └── featured-alluring-plastic-surgery-miami.webp
│   └── bbl-recovery-tips/
│       └── ...
├── gallery/
│   ├── before-after-alluring-plastic-surgery-miami.webp
│   └── ...
└── team/
    └── ...
```

## MCP Tools Used

| Tool                                     | Purpose                     |
| ---------------------------------------- | --------------------------- |
| `mcp__vercel-blob__vercel-blob-put-file` | Upload file from local path |
| `mcp__vercel-blob__vercel-blob-list`     | List existing blobs         |
| `mcp__vercel-blob__vercel-blob-delete`   | Remove old/duplicate blobs  |
| `mcp__vercel-blob__vercel-blob-head`     | Check if blob exists        |

## Base URL

All uploaded images are available at:

```
https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/{pathname}
```

## Validation

Before uploading, validate each image:

- [ ] File exists and is not empty (size > 0 bytes)
- [ ] Valid image format (webp, jpg, jpeg, png, gif, svg)
- [ ] Reasonable file size (warn if > 5MB)
- [ ] Name follows convention (descriptive, kebab-case)

## Example Session

```
User: /upload-to-vercel

Claude: I found 11 staged images in apps/web/public/images/procedures/brazilian-butt-lift/:
- hero.webp (1.54 MB)
- curve-enhancement.webp (1.59 MB)
- body-contouring.webp (1.47 MB)
...

Where should these be uploaded?
1. procedures/brazilian-butt-lift/ (Recommended)
2. Custom path

User: 1

Claude: Uploading 11 images to procedures/brazilian-butt-lift/...
✓ hero-alluring-plastic-surgery-miami.webp uploaded
✓ curve-enhancement-alluring-plastic-surgery-miami.webp uploaded
...

Updated references in:
- brazilian-butt-lift-bbl-miami.data.ts (12 references)

Should I remove the local image files?
1. Yes, remove local files
2. No, keep as backup
```

## Error Handling

| Error                 | Action                            |
| --------------------- | --------------------------------- |
| Empty file (0 bytes)  | Skip and warn user                |
| Upload failed         | Retry once, then report error     |
| Reference not found   | Log warning, continue with others |
| Duplicate blob exists | Ask user: overwrite or skip       |

## Requirements

- **MCP Server:** `vercel-blob` must be configured with valid `BLOB_READ_WRITE_TOKEN`
- **Environment:** Vercel Blob storage enabled on project
