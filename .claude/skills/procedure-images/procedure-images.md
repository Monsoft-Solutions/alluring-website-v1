---
name: procedure-images
description: Generate professional images for all procedure pages. Lists procedures needing images, guides selection, generates AI images via fal.ai, and updates data files with contentImages arrays.
invocation: user
user_invocation: /procedure-images
version: 1.0.0
---

# Procedure Page Image Generation

<command-name>procedure-images</command-name>

Generate professional images for Alluring Plastic Surgery procedure pages using fal.ai image generation.

## Quick Start

When invoked, this skill:

1. Shows all procedures and their current image status
2. Guides you through selecting a procedure
3. Generates images for each section (hero, content, process, recovery)
4. Downloads and saves images to the correct directory
5. Updates the procedure data file with `contentImages` array

## Workflow

### Step 1: Review Current Status

Display the following procedures with their image status:

| Procedure           | Slug                          | Has contentImages? |
| ------------------- | ----------------------------- | ------------------ |
| Breast Augmentation | breast-augmentation-miami     | Check file         |
| Facelift            | facelift-miami                | Check file         |
| Liposuction         | liposuction-miami             | Check file         |
| Brazilian Butt Lift | brazilian-butt-lift-bbl-miami | Check file         |
| Tummy Tuck          | tummy-tuck-miami              | Check file         |
| Breast Lift         | breast-lift-miami             | Check file         |
| Blepharoplasty      | blepharoplasty-miami          | Check file         |
| Breast Reduction    | breast-reduction-miami        | Check file         |

Read each data file at `apps/web/lib/data/procedures/{slug}.data.ts` and check for `contentImages` property.

### Step 2: User Selects Procedure

Ask the user which procedure to generate images for. Use the AskUserQuestion tool with procedure options.

### Step 3: Delegate to Agent

Use the **procedure-image-creator** agent to handle image generation. Pass the selected procedure slug and title.

```
Task: Generate images for {procedure_title} ({slug})

The procedure-image-creator agent will:
1. Analyze procedure content
2. Propose 5-6 image concepts (hero, content x3, process, recovery)
3. Get user approval for each image prompt
4. Generate images using fal.ai (gpt-image-1.5 or nano-banana-pro)
5. Download and save to apps/web/public/images/procedures/{slug}/
6. Update the data file with contentImages array
```

### Step 4: Verification

After the agent completes, verify:

- [ ] Images exist in `apps/web/public/images/procedures/{slug}/`
- [ ] Data file has `contentImages` array with correct structure
- [ ] Image paths match the saved files

## Reference: Mommy Makeover Pattern

The target structure follows mommy-makeover-miami.data.ts:

```typescript
contentImages: [
    {
        id: 'hero',
        src: '/images/procedures/{slug}/hero.webp',
        alt: 'Descriptive alt text for SEO',
        section: 'hero',
        variant: 'full-width',
    },
    {
        id: 'technique-1',
        src: '/images/procedures/{slug}/technique-1.webp',
        alt: 'Description of the technique or result',
        caption: 'Engaging caption for the image',
        section: 'content',
        variant: 'full-width',
    },
    // ... more content images
    {
        id: 'consultation',
        src: '/images/procedures/{slug}/consultation.webp',
        alt: 'Patient consultation description',
        caption: 'Caption about the consultation process',
        section: 'process',
        variant: 'full-width',
    },
    {
        id: 'recovery-lifestyle',
        src: '/images/procedures/{slug}/recovery-lifestyle.webp',
        alt: 'Recovery and lifestyle description',
        caption: 'Caption about enjoying results',
        section: 'recovery',
        variant: 'full-width',
    },
]
```

## Image Specifications

- **Format:** WebP
- **Aspect Ratio:** 3:2 (landscape)
- **Quality:** High (professional medical content)
- **Style by Section:**
    - **Hero:** Miami Editorial (glamorous, cover-worthy)
    - **Content:** Artistic/Sensual (elegant, sophisticated)
    - **Process:** Lifestyle/Casual (warm, approachable)
    - **Recovery:** Lifestyle/Casual (authentic, relatable)

## Directory Structure

Images are stored in the web app's public directory:

```
apps/web/public/images/procedures/
├── mommy-makeover/          # Reference implementation
│   ├── hero.webp
│   ├── breast-enhancement.webp
│   ├── tummy-tuck.webp
│   ├── liposuction-contouring.webp
│   ├── consultation.webp
│   └── recovery-lifestyle.webp
├── breast-augmentation/     # New directories created per procedure
│   ├── hero.webp
│   ├── implant-options.webp
│   ├── natural-results.webp
│   ├── consultation.webp
│   └── recovery-lifestyle.webp
├── facelift/
│   └── ...
└── [other-procedures]/
```

## Requirements

- **MCP Server:** `fal-create-image` must be configured (uses `@monsoft/mcp-fal-ai`)

## Related Resources

- **Agent:** `procedure-image-creator` - Handles the actual image generation workflow
- **Reference:** `mommy-makeover-miami.data.ts` - Example of complete contentImages array
- **Image Creator:** `image-creator-expert` agent - General fal.ai usage patterns
