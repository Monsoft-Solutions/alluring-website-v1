# React 19 Implementation Patterns

This document outlines React 19 patterns that can be adopted incrementally in the admin dashboard.

## ✅ Completed Optimizations

1. **Error Boundaries** - Added `error.tsx` files to all major route segments
2. **Loading States** - Added `loading.tsx` files with skeleton components
3. **Query Caching** - All query functions wrapped with React `cache()`
4. **Suspense Streaming** - Dashboard page refactored with Suspense boundaries
5. **Deferred Values** - DataTable uses `useDeferredValue` for search
6. **Lazy Loading** - Chart components lazy loaded with `next/dynamic`
7. **Metadata** - All pages have proper metadata exports

---

## 🔄 Patterns for Future Implementation

### 1. useActionState Pattern for Forms

**When to Use**: Forms that call server actions

**Current Pattern** (using `useTransition`):

```tsx
'use client'
import { useState, useTransition } from 'react'

import { createBlogPost } from '@/lib/actions/blog.action'

export function PostForm() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        startTransition(async () => {
            const result = await createBlogPost(formData)
            if (!result.success) {
                setError(result.error)
            }
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className='error'>{error}</div>}
            <button disabled={isPending}>
                {isPending ? 'Saving...' : 'Save'}
            </button>
        </form>
    )
}
```

**Recommended Pattern** (using `useActionState`):

```tsx
'use client'
import { useActionState } from 'react'

import { createBlogPost } from '@/lib/actions/blog.action'

export function PostForm() {
    const [state, formAction, isPending] = useActionState(
        async (prevState, formData: FormData) => {
            // Extract and validate data from FormData
            const data = {
                title: formData.get('title') as string,
                slug: formData.get('slug') as string,
                content: formData.get('content') as string,
                // ... other fields
            }

            return await createBlogPost(data)
        },
        null // initial state
    )

    return (
        <form action={formAction}>
            {state?.error && <div className='error'>{state.error}</div>}

            <input name='title' required />
            <input name='slug' required />
            <textarea name='content' required />

            <button disabled={isPending}>
                {isPending ? 'Saving...' : 'Save'}
            </button>
        </form>
    )
}
```

**Benefits**:

- Automatic pending state management
- Error state built-in
- Progressive enhancement (works without JS)
- Cleaner code with less boilerplate

**Files to Refactor**:

- `components/blog/post-form.component.tsx`
- `components/blog/author-form.component.tsx`
- `components/gallery/media-form.component.tsx`
- `components/promotions/promotion-form.component.tsx`
- All forms using `useTransition` + manual error state

---

### 2. useOptimistic Pattern for Instant UI Updates

**When to Use**: Delete operations, status toggles, any mutation where instant feedback improves UX

**Example: Optimistic Blog Post Deletion**:

```tsx
'use client'
import { useOptimistic, useTransition } from 'react'

import { deleteBlogPost } from '@/lib/actions/blog.action'

type Post = {
    id: string
    title: string
    status: string
}

export function PostsList({ initialPosts }: { initialPosts: Post[] }) {
    const [isPending, startTransition] = useTransition()

    const [optimisticPosts, updateOptimisticPosts] = useOptimistic(
        initialPosts,
        (state, deletedId: string) => state.filter((p) => p.id !== deletedId)
    )

    const handleDelete = (id: string) => {
        // Immediately remove from UI
        updateOptimisticPosts(id)

        // Then perform actual deletion
        startTransition(async () => {
            const result = await deleteBlogPost(id)
            if (!result.success) {
                // Handle error - post will reappear on revalidation
                console.error(result.error)
            }
        })
    }

    return (
        <div>
            {optimisticPosts.map((post) => (
                <div key={post.id}>
                    <h3>{post.title}</h3>
                    <button onClick={() => handleDelete(post.id)}>
                        Delete
                    </button>
                </div>
            ))}
        </div>
    )
}
```

**Use Cases**:

- Deleting items from lists
- Toggling status (published/draft)
- Marking items as read/unread
- Any operation where instant feedback matters

**Files to Consider**:

- `app/(dashboard)/blog/posts/page.tsx` - Post deletion
- `app/(dashboard)/contacts/page.tsx` - Contact deletion
- `app/(dashboard)/gallery/media/page.tsx` - Media deletion

---

### 3. useFormStatus for Submit Buttons

**Pattern for submit buttons in separate components**:

```tsx
'use client'
import { useFormStatus } from 'react-dom'

export function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button disabled={pending}>
            {pending ? 'Saving...' : 'Save Post'}
        </button>
    )
}
```

**Benefits**:

- Works with `useActionState`
- Can be in a separate component
- Automatically syncs with form submission state

---

## 🎯 Implementation Priority

### High Priority

1. **Critical Forms** - Post creation/editing forms (most used)
    - `components/blog/post-form.component.tsx`
2. **List Operations** - Delete operations with high user interaction
    - Blog posts deletion
    - Contact form deletions

### Medium Priority

3. **Other Forms** - Author, gallery, promotion forms
4. **Status Toggles** - Post status changes

### Low Priority

5. **Bulk Operations** - Less frequently used features

---

## 📋 Migration Checklist

For each form component:

- [ ] Replace `useTransition` + `useState` with `useActionState`
- [ ] Convert event handlers to FormData handling
- [ ] Update server actions to return proper state objects
- [ ] Add `useFormStatus` to submit buttons if in separate components
- [ ] Test both JS-enabled and progressive enhancement scenarios
- [ ] Update tests to match new patterns

For list components with deletions:

- [ ] Add `useOptimistic` hook
- [ ] Implement optimistic update function
- [ ] Wrap mutation in `startTransition`
- [ ] Test error handling (items should reappear on error)

---

## 🔗 Additional Resources

- [React 19 Docs - useActionState](https://react.dev/reference/react/useActionState)
- [React 19 Docs - useOptimistic](https://react.dev/reference/react/useOptimistic)
- [React 19 Docs - useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus)
- [Next.js 15 Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

## 📝 Notes

- These patterns are **optional optimizations** - current code works fine
- Implement incrementally based on team capacity
- Test thoroughly - forms are critical user flows
- Consider progressive enhancement when refactoring
- useActionState works best with native FormData handling
