import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

import { config as baseConfig } from './base.js'

/**
 * A custom ESLint configuration for libraries that use React.
 *
 * @type {import("eslint").Linter.Config} */
export const config = [
    ...baseConfig,
    pluginReact.configs.flat.recommended,
    {
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
            'react-hooks': pluginReactHooks,
        },
        settings: { react: { version: 'detect' } },
        rules: {
            // Enable all recommended react-hooks rules (includes React 19 + Compiler rules)
            // This includes: rules-of-hooks, exhaustive-deps, static-components, use-memo,
            // component-hook-factories, preserve-manual-memoization, immutability, globals,
            // refs, set-state-in-effect, error-boundaries, purity, set-state-in-render, and more
            ...pluginReactHooks.configs.recommended.rules,

            // Maintenance approach: Use recommended preset to automatically pick up new rules
            // from future plugin updates. All rules remain as errors to ensure React Compiler
            // compatibility and optimal performance. Fix issues as they arise rather than
            // downgrading to warnings.

            // React scope no longer necessary with new JSX transform
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
        },
    },
]
