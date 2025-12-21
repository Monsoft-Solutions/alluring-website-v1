import pluginNext from '@next/eslint-plugin-next'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

import { config as baseConfig } from './base.js'

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const nextJsConfig = [
    ...baseConfig,
    {
        ...pluginReact.configs.flat.recommended,
        languageOptions: {
            ...pluginReact.configs.flat.recommended.languageOptions,
            globals: {
                ...globals.serviceworker,
                ...globals.browser,
            },
        },
    },
    {
        plugins: {
            '@next/next': pluginNext,
        },
        rules: {
            ...pluginNext.configs.recommended.rules,
            ...pluginNext.configs['core-web-vitals'].rules,
        },
    },
    {
        plugins: {
            'react-hooks': pluginReactHooks,
        },
        settings: { react: { version: 'detect' } },
        rules: {
            // Enable all recommended react-hooks rules for React 19 + Next.js 16
            // This includes: rules-of-hooks, exhaustive-deps, static-components, use-memo,
            // component-hook-factories, preserve-manual-memoization, immutability, globals,
            // refs, set-state-in-effect, error-boundaries, purity, set-state-in-render,
            // config, gating, and future React Compiler optimization rules
            ...pluginReactHooks.configs.recommended.rules,

            // Maintenance approach: Use recommended preset to automatically pick up new rules
            // from future plugin updates. All React Compiler rules remain as errors to ensure
            // optimal performance and React Compiler compatibility.
            //
            // Intentionally using recommended preset instead of whitelisting only 2 rules.
            // React Compiler rules enabled as errors:
            // - static-components: Prevents components created during render
            // - use-memo: Enforces proper memoization patterns
            // - component-hook-factories: Ensures hooks follow naming conventions
            // - preserve-manual-memoization: Maintains existing memoization
            // - immutability: Prevents state mutation
            // - refs: Enforces proper ref usage
            // - error-boundaries: Ensures error boundaries follow patterns
            // - purity: Enforces pure render functions
            // - set-state-in-effect: Prevents setState in useEffect (cascading renders)
            // - set-state-in-render: Prevents setState during render
            //
            // These rules prepare the codebase for React Compiler optimization and prevent
            // performance issues. Fix violations rather than downgrading to warnings.

            // React scope no longer necessary with new JSX transform
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/no-unescaped-entities': 'error',
        },
    },
]
