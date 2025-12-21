import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import turboPlugin from 'eslint-plugin-turbo'
import tseslint from 'typescript-eslint'

const TYPESCRIPT_FILES_GLOB = '**/*.{ts,tsx,mts,cts}'
const TYPESCRIPT_TOOLING_FILES_GLOBS = [
    '**/tailwind.config.ts',
    '**/drizzle.config.ts',
]

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
    js.configs.recommended,
    eslintConfigPrettier,
    // Tooling/config TS files: lint without type information to avoid requiring tsconfig includes.
    ...tseslint.configs.recommended.map((untypedConfig) => ({
        ...untypedConfig,
        files: TYPESCRIPT_TOOLING_FILES_GLOBS,
        languageOptions: {
            ...untypedConfig.languageOptions,
            parser: tseslint.parser,
        },
    })),
    // Enable type-aware linting across the monorepo (TypeScript files only).
    // Uses TypeScript-ESLint's project service to pick up the nearest tsconfig.json.
    ...tseslint.configs.recommendedTypeChecked.map((typedConfig) => ({
        ...typedConfig,
        files: typedConfig.files ?? [TYPESCRIPT_FILES_GLOB],
        ignores: [
            ...(typedConfig.ignores ?? []),
            ...TYPESCRIPT_TOOLING_FILES_GLOBS,
        ],
        languageOptions: {
            ...typedConfig.languageOptions,
            parser: tseslint.parser,
            parserOptions: {
                ...(typedConfig.languageOptions?.parserOptions ?? {}),
                projectService: true,
                // Some TS scripts live outside package tsconfig include globs.
                // Allow these to be linted with a default project instead of erroring.
                allowDefaultProject: ['**/scripts/**/*.ts', '**/turbo/**/*.ts'],
            },
        },
    })),
    {
        plugins: {
            turbo: turboPlugin,
        },
        rules: {
            'turbo/no-undeclared-env-vars': 'warn',
            'no-restricted-properties': [
                'error',
                {
                    object: 'process',
                    property: 'env',
                    message:
                        'Use env module instead (e.g., import { env } from "apps/web/env" or "packages/db/src/env")',
                },
            ],
        },
    },
    {
        rules: {
            // Upgrade unused-vars to error in all packages/apps.
            '@typescript-eslint/no-unused-vars': 'error',

            // High-signal, type-aware rules commonly enforced in large OSS TS codebases.
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    disallowTypeAnnotations: false,
                    fixStyle: 'separate-type-imports',
                },
            ],
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': [
                'error',
                {
                    checksVoidReturn: {
                        arguments: false,
                        attributes: false,
                    },
                },
            ],
            '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        },
        files: [TYPESCRIPT_FILES_GLOB],
        ignores: TYPESCRIPT_TOOLING_FILES_GLOBS,
    },
    {
        ignores: ['dist/**', '.next/**', '.turbo/**', 'coverage/**'],
    },
    // Seed post content can contain non-breaking spaces and other “irregular” characters on purpose.
    {
        files: ['**/src/seed/posts/**/*.ts'],
        rules: {
            'no-irregular-whitespace': 'off',
        },
    },
    // Admin app is an internal tool; keep type-aware linting enabled but relax the noisiest
    // type-safety rules until the codebase is incrementally hardened.
    {
        files: ['**/apps/admin/**/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/require-await': 'off',
            '@typescript-eslint/no-unnecessary-type-assertion': 'off',
            '@typescript-eslint/consistent-type-imports': 'off',
            '@next/next/no-img-element': 'off',
        },
    },
    {
        rules: {
            // Allow env access in dedicated env modules
            'no-restricted-properties': 'off',
        },
        files: ['**/*/env.ts', '**/*/env.mjs', '**/*/env.cjs'],
    },
    {
        files: ['packages/seo/**'],
        rules: {
            // Temporarily allow process.env in SEO package until migrated
            'no-restricted-properties': 'off',
        },
    },
]
