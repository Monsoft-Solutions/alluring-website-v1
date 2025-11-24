import type { InsertBlogPost } from '../../schema/blog/blog-post.table'

/**
 * Blog Post: Setting Up a Next.js 15 Project with TypeScript
 *
 * Tutorial post demonstrating Keel brand voice in technical content
 * Category: Development
 * Tags: Next.js, TypeScript, Tutorial
 */

export const post: Omit<
    InsertBlogPost,
    'id' | 'authorId' | 'createdAt' | 'updatedAt'
> = {
    slug: 'setting-up-nextjs-15-with-typescript',
    title: 'Setting Up a Next.js 15 Project with TypeScript',
    metaTitle:
        'Next.js 15 TypeScript Setup Guide | Production-Ready in Minutes',
    metaDescription:
        'Learn how to set up Next.js 15 with TypeScript. Type-safe configuration in 15 minutes. Includes production config and best practices.',
    metaKeywords:
        'Next.js 15, TypeScript, setup guide, Next.js tutorial, React 19, type-safe, production config',
    excerpt:
        'A practical guide to setting up Next.js 15 with TypeScript. Get a production-ready project in 15 minutes with proper configuration and type safety.',
    content: `**TL;DR**
- Next.js 15 includes built-in TypeScript support
- Setup takes ~15 minutes with automatic configuration
- Type safety from routing to API endpoints
- Production-ready configuration included

## Introduction

Next.js 15 ships with first-class TypeScript support. No complex configuration. No manual type definitions. The framework handles it.

This guide walks through setting up a new Next.js 15 project with TypeScript, covering the essentials for production deployment. We'll configure types, set up path aliases, and ensure type safety across your application.

**What you'll need:**
- Node.js 20 or later
- Basic TypeScript knowledge
- 15 minutes

## Create a New Project

The \`create-next-app\` CLI handles TypeScript setup automatically.

\`\`\`bash
npx create-next-app@latest my-app
\`\`\`

When prompted:

\`\`\`
✔ Would you like to use TypeScript? Yes
✔ Would you like to use ESLint? Yes
✔ Would you like to use Tailwind CSS? Yes
✔ Would you like to use the app directory? Yes
✔ Would you like to customize the default import alias? Yes
✔ What import alias would you like configured? @/*
\`\`\`

The CLI generates:
- \`tsconfig.json\` with Next.js defaults
- TypeScript dependencies
- App Router with TypeScript
- ESLint configuration

## TypeScript Configuration

The generated \`tsconfig.json\` includes Next.js-specific settings:

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
\`\`\`

**Key settings:**
- \`strict: true\` - Enables all strict type checking
- \`noEmit: true\` - Next.js handles compilation
- \`paths\` - Import alias configuration
- \`plugins\` - Next.js TypeScript plugin

## Type-Safe Routing

Next.js 15 generates route types automatically. Create a page:

\`\`\`tsx
// app/blog/[slug]/page.tsx
type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BlogPost({ params, searchParams }: PageProps) {
  const { slug } = await params
  
  return (
    <article>
      <h1>Post: {slug}</h1>
    </article>
  )
}
\`\`\`

TypeScript validates:
- Route parameters match file structure
- Search params are properly typed
- Props match expected shape

## Type-Safe API Routes

API routes get automatic type inference:

\`\`\`ts
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'

type Post = {
  id: string
  title: string
  content: string
}

export async function GET(request: NextRequest) {
  const posts: Post[] = [
    { id: '1', title: 'First Post', content: 'Content here' }
  ]
  
  return NextResponse.json(posts)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Type validation happens here
  const post: Post = {
    id: crypto.randomUUID(),
    title: body.title,
    content: body.content,
  }
  
  return NextResponse.json(post, { status: 201 })
}
\`\`\`

The \`NextRequest\` and \`NextResponse\` types provide:
- Request method validation
- Header typing
- Response formatting
- Status code autocomplete

## Server Actions with Types

Server Actions maintain type safety:

\`\`\`tsx
// app/actions.ts
'use server'

type FormData = {
  title: string
  content: string
}

type ActionResult = {
  success: boolean
  error?: string
  data?: { id: string }
}

export async function createPost(formData: FormData): Promise<ActionResult> {
  try {
    // Validation logic
    if (!formData.title || !formData.content) {
      return {
        success: false,
        error: 'Title and content required',
      }
    }
    
    // Save to database
    const postId = crypto.randomUUID()
    
    return {
      success: true,
      data: { id: postId },
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to create post',
    }
  }
}
\`\`\`

Use in components with full type safety:

\`\`\`tsx
// app/components/CreatePostForm.tsx
'use client'

import { createPost } from '@/app/actions'

export function CreatePostForm() {
  async function handleSubmit(formData: FormData) {
    const result = await createPost({
      title: formData.get('title') as string,
      content: formData.get('content') as string,
    })
    
    if (result.success) {
      // TypeScript knows result.data exists
      console.log('Created post:', result.data.id)
    } else {
      // TypeScript knows result.error might exist
      console.error(result.error)
    }
  }
  
  return (
    <form action={handleSubmit}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create Post</button>
    </form>
  )
}
\`\`\`

## Path Aliases

Configure import aliases in \`tsconfig.json\`:

\`\`\`json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"]
    }
  }
}
\`\`\`

Use in code:

\`\`\`tsx
// Instead of: import { Button } from '../../../components/ui/button'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { User } from '@/types/user'
\`\`\`

## Type Definitions

Create shared types in a \`types\` directory:

\`\`\`ts
// types/blog.ts
export type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  publishedAt: Date
  author: Author
  categories: Category[]
  tags: Tag[]
}

export type Author = {
  id: string
  name: string
  bio: string
  avatarUrl: string
}

export type Category = {
  id: string
  name: string
  slug: string
}

export type Tag = {
  id: string
  name: string
  slug: string
}
\`\`\`

Import and use:

\`\`\`tsx
import type { BlogPost } from '@/types/blog'

async function getBlogPosts(): Promise<BlogPost[]> {
  // Fetch logic
  return []
}
\`\`\`

## Environment Variables

Type-safe environment variables with \`@t3-oss/env-nextjs\`:

\`\`\`ts
// env.ts
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    API_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    API_KEY: process.env.API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
})
\`\`\`

Access with type safety:

\`\`\`ts
import { env } from './env'

// TypeScript validates these exist
const dbUrl = env.DATABASE_URL
const appUrl = env.NEXT_PUBLIC_APP_URL
\`\`\`

## Common Issues

**1. Module not found errors**

Clear Next.js cache:

\`\`\`bash
rm -rf .next
npm run dev
\`\`\`

**2. Type errors in \`.next\` directory**

Add to \`.gitignore\`:

\`\`\`
.next/
\`\`\`

Restart TypeScript server in your editor.

**3. Import path not resolved**

Check \`tsconfig.json\` paths match your directory structure. Restart dev server after changes.

## Testing the Setup

Verify TypeScript is working:

\`\`\`bash
# Type check entire project
npx tsc --noEmit

# Run development server
npm run dev
\`\`\`

No type errors = successful setup.

## Production Configuration

For production deployments:

1. **Enable strict mode**
\`\`\`json
{
  "compilerOptions": {
    "strict": true
  }
}
\`\`\`

2. **Add type checking to build**
\`\`\`json
{
  "scripts": {
    "build": "tsc --noEmit && next build"
  }
}
\`\`\`

3. **Configure ESLint**
\`\`\`json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
\`\`\`

## Next Steps

With TypeScript configured:

1. **Add a database**: Drizzle ORM provides end-to-end type safety
2. **Set up validation**: Zod for runtime type validation
3. **Configure testing**: Vitest with TypeScript support
4. **Add auth**: NextAuth.js with proper types

## Conclusion

Next.js 15 makes TypeScript setup straightforward. The framework handles configuration, generates types automatically, and maintains type safety from database to UI.

Total setup time: ~15 minutes. The result: a production-ready project with full type safety.

**Ready to build?** Start with Keel's Next.js 15 template for pre-configured TypeScript, database types, and production-ready patterns.`,
    readingTime: 8,
    status: 'published',
    publishedAt: new Date('2025-10-15T10:00:00Z'),
    isFeatured: true,
    allowComments: true,
}

export const categories = ['Development']
export const tags = ['Next.js', 'TypeScript', 'Tutorial']
