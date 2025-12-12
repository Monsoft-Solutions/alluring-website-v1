# Analyze Staged Files

Perform a comprehensive code quality analysis on all staged Git files to ensure they meet project standards before committing.

## Analysis Checklist

### 1. File Naming Conventions

Verify files follow the `<name>.<type>.<ext>` pattern:

- ✅ Components: `*.component.tsx`
- ✅ Hooks: `*.hook.ts`
- ✅ Types: `*.type.ts`
- ✅ Schemas: `*.schema.ts`
- ✅ Services: `*.service.ts`
- ✅ Actions: `*.action.ts`
- ✅ Utils: `*.util.ts`
- ✅ Queries: `*.query.ts`
- ✅ Constants: `*.constant.ts`
- ✅ Enums: `*.enum.ts`
- ❌ Flag: Generic names like `index.ts`, `utils.ts`, `helpers.ts` (except in `packages/*/src/index.ts`)

### 2. TypeScript Naming Conventions

Check all identifiers follow proper casing:

- ✅ Variables & Functions: `camelCase` (getUserData, userName, calculateTotal)
- ✅ Types, Interfaces, Classes: `PascalCase` (UserProfile, ApiResponse)
- ✅ Constants: `SCREAMING_SNAKE_CASE` (MAX_RETRIES, API_BASE_URL)
- ✅ Boolean vars: Proper prefixes (is, has, can, should, will)
- ✅ Event handlers: `handle` or `on` prefix (handleSubmit, onUserClick)
- ❌ Flag: Hungarian notation, type info in names (strName, userObj)

### 3. Type Safety

Enforce strict type safety:

- ❌ **Critical**: Usage of `any` type
- ❌ **Critical**: Type assertions with `as any`
- ❌ **Critical**: Missing return types on functions
- ❌ **Critical**: Implicit `any` in function parameters
- ✅ Use `unknown` for truly unknown types
- ✅ Explicit types on exports
- ✅ Proper generics instead of type casting

### 4. Import Patterns

Verify imports follow project guidelines:

- ❌ **Critical**: Barrel file imports (e.g., `from '@/components/forms'`)
- ✅ Direct imports from source files (e.g., `from '@/components/forms/button.component'`)
- ❌ Flag: Imports from `index.ts` files (except packages)
- ❌ Flag: `export *` patterns
- ✅ Selective exports only
- ✅ Organized import order (external → internal → relative)

### 5. Component Quality (React/TSX)

Analyze React components for proper architecture:

- ❌ **Critical**: Components over 250 lines (should be decomposed)
- ❌ **Critical**: Multiple components in one file
- ❌ Flag: More than 10 props (consider composition)
- ❌ Flag: Nested components (define outside parent)
- ❌ Flag: Business logic in render functions
- ✅ Single responsibility per component
- ✅ Proper component decomposition
- ✅ Hooks extracted to separate files
- ✅ Types extracted to `*.type.ts` files

### 6. DRY Principle

Detect code duplication and repetition:

- ❌ **Critical**: Duplicate functions (3+ similar implementations)
- ❌ **Critical**: Copy-pasted code blocks
- ❌ Flag: Repeated logic patterns (should be extracted)
- ❌ Flag: Similar component structures (consider shared component)
- ❌ Flag: Duplicate type definitions
- ✅ Proper abstraction and reusability
- ✅ Shared utilities for common logic
- ✅ Shared components for UI patterns

### 7. AI Slop Indicators

Identify AI-generated code that needs human refinement:

- ❌ **Critical**: Generic variable names (data, result, response, temp, value)
- ❌ **Critical**: Excessive defensive checks (unnecessary try/catch, null checks everywhere)
- ❌ Flag: Over-commented code (every line explained)
- ❌ Flag: Redundant comments ("// Create a user" above createUser())
- ❌ Flag: Inconsistent commenting style with existing code
- ❌ Flag: TODO/FIXME/NOTE comments without context
- ❌ Flag: Generic function names (handleClick, handleSubmit, handleChange without context)
- ❌ Flag: Boilerplate error messages ("An error occurred")
- ✅ Descriptive, context-specific names
- ✅ Comments only for complex logic explanation
- ✅ Error messages that help debugging

### 8. Code Organization

Verify proper file and function organization:

- ❌ **Critical**: Functions/types in wrong directories
- ❌ Flag: File over 300 lines (consider splitting)
- ❌ Flag: More than 5 exports from one file
- ❌ Flag: Mixed concerns in one file
- ✅ Single responsibility per file
- ✅ Related code grouped together
- ✅ Proper directory structure
- ✅ Clear separation of concerns

### 9. Function Quality

Analyze function design and implementation:

- ❌ **Critical**: Functions over 50 lines (decompose)
- ❌ **Critical**: More than 4 parameters (use options object)
- ❌ Flag: Nested functions more than 3 levels deep
- ❌ Flag: Missing JSDoc for exported functions
- ✅ Pure functions where possible
- ✅ Clear single purpose
- ✅ Descriptive names that explain behavior
- ✅ Proper error handling

### 10. Modern Best Practices

Ensure code uses modern patterns:

- ✅ Async/await instead of Promise chains
- ✅ Optional chaining (`?.`) and nullish coalescing (`??`)
- ✅ Destructuring for cleaner code
- ✅ Template literals instead of string concatenation
- ✅ Array methods (map, filter, reduce) instead of loops
- ✅ Const/let instead of var
- ❌ Flag: Old patterns that should be modernized

### 11. Performance Considerations

Check for common performance issues:

- ❌ **Critical**: Expensive operations in render/loops without memoization
- ❌ Flag: Missing React.memo for expensive components
- ❌ Flag: Missing useMemo/useCallback where beneficial
- ❌ Flag: Unnecessary re-renders
- ❌ Flag: Large bundle imports (import entire lodash instead of specific function)

### 12. Security & Data Handling

Verify secure coding practices:

- ❌ **Critical**: Hardcoded secrets or API keys
- ❌ **Critical**: SQL injection vulnerabilities
- ❌ **Critical**: XSS vulnerabilities (dangerouslySetInnerHTML without sanitization)
- ❌ Flag: Missing input validation
- ❌ Flag: Sensitive data in logs
- ✅ Proper sanitization
- ✅ Validation on all inputs
- ✅ Environment variables for secrets

## Analysis & Fix Process

### Phase 1: Analysis

For each staged file, provide:

1. **File**: Path and name
2. **Status**: ✅ Pass | ⚠️ Warning | ❌ Critical Issues
3. **Issues Found**: List each issue with:
    - Category (from checklist above)
    - Severity (Critical/Flag/Warning)
    - Line number(s) if applicable
    - Specific problem
    - Recommended fix
4. **Code Snippets**: Show problematic code with suggested improvements
5. **Summary Score**: Percentage of checks passed

### Phase 2: Automatic Fixes

After analysis, **automatically fix all identified issues**:

1. **Critical Issues** (Must fix):
    - Remove all `any` types and replace with proper types
    - Fix file naming conventions
    - Convert barrel imports to direct imports
    - Decompose oversized components/functions
    - Remove duplicate code by extracting to shared utilities
    - Fix naming convention violations
    - Add missing return types and parameter types
    - Remove hardcoded secrets

2. **AI Slop Cleanup**:
    - Replace generic variable names with descriptive ones
    - Remove redundant/excessive comments
    - Remove unnecessary defensive checks
    - Improve error messages with context
    - Remove boilerplate code

3. **Code Quality Improvements**:
    - Extract repeated logic to utilities
    - Split large files into focused modules
    - Decompose complex components
    - Extract types to separate `*.type.ts` files
    - Extract hooks to separate `*.hook.ts` files
    - Add proper JSDoc to exported functions

4. **Modern Pattern Updates**:
    - Convert Promise chains to async/await
    - Use optional chaining and nullish coalescing
    - Apply destructuring where beneficial
    - Convert string concatenation to template literals
    - Modernize array operations

5. **Performance Optimizations**:
    - Add memoization where needed
    - Split large imports to specific functions
    - Optimize expensive operations

## Final Report

After fixing all issues, provide:

- **Overall Status**: ✅ All Issues Fixed
- **Total Files Analyzed**
- **Total Files Modified**
- **Critical Issues Fixed**: Count and brief description
- **Warnings Addressed**: Count and brief description
- **Code Quality Improvements**: Summary of enhancements
- **Files Ready to Commit**: List of all improved files

## Guidelines

- **Fix everything automatically** - don't just report, take action
- Be thorough but practical - focus on actual issues, not nitpicking
- Prioritize critical issues first, then warnings
- Preserve functionality while improving code quality
- Test that fixes don't break existing logic
- Maintain consistent style with the rest of the codebase
- Consider the context (test files may have different standards)
- Document significant refactoring in comments
- If no staged files exist, check the most recently modified files instead
- After all fixes, verify linting passes with no errors

## Expected Outcome

Files should be transformed from problematic code to:
✅ Properly named and organized
✅ Fully typed with no `any`
✅ No code duplication
✅ Well-decomposed components
✅ Clean, human-written quality
✅ Following all project standards
✅ Ready to commit with confidence

Start the analysis and fix process now.
