---
name: claude-code-project-guide
description: Contributor guide for the Contour Console Plugin. Use this skill to quickly understand the project architecture, edit React/TypeScript plugin code safely, and run the right validation steps before finishing.
disable-model-invocation: true
---

# Claude Code Project Guide

## Goal

Provide a fast, reliable workflow for making code changes in this repository.

## About the Project

The Contour Console Plugin is an OpenShift dynamic console plugin for Project Contour (Envoy-based ingress) that helps users create and manage Routes.

This codebase is primarily TypeScript + React and emphasizes:

- predictable resource interactions (namespace/name consistency)
- secure, explicit URL and query parameter handling
- maintainable UI composition with shared components and hooks
- minimal-risk changes with focused validation

## Project Structure

- `src/pages`: dynamic plugin entry pages (`index`, `list`, `details`)
- `src/components`: UI modules (`form`, `list`, `details`, `metric`, `modals`, `shared`)
- `src/hooks`: reusable data and form hooks
- `src/utils`: helpers for k8s, URL handling, YAML, schema validation, PromQL
- `src/types`: shared TypeScript types
- `integration-tests`: Cypress tests
- `charts/openshift-console-plugin`: Helm chart for deployment

## Core Stack

- React 17 + TypeScript
- OpenShift dynamic plugin SDK
- PatternFly components/charts
- Zustand for state
- Webpack dev server

## Preferred Workflow

1. Read the target files first and keep edits scoped.
2. Reuse existing utilities in `src/utils` before adding new helpers.
3. Keep types explicit for component props and utility return values.
4. For URL/query updates, ensure encoding/escaping and navigation safety.
5. For k8s resources, preserve namespace/name handling consistency.

## Edit Boundaries

- Prefer minimal, local changes over broad refactors.
- Do not rename public exports unless required by the task.
- Avoid introducing new dependencies unless necessary.
- Keep UI behavior consistent with existing PatternFly patterns.

## Validation Commands

Run the smallest command set that proves the change:

```bash
yarn lint
yarn build-dev
```

For runtime checks during development:

```bash
yarn start
```

If test scope includes e2e behavior:

```bash
yarn test-cypress-headless
```

## Change Checklist

- [ ] TypeScript compiles without new errors
- [ ] Linting passes for edited files
- [ ] New helpers are colocated in existing feature folders or `src/utils`
- [ ] User-facing strings are clear and consistent
- [ ] No secrets or environment-specific values are committed

## Common Task Routing

- Add or change forms: `src/components/form/*` + related schema/utils
- Update table/list behavior: `src/components/list/*` + `src/pages/list.tsx`
- Update details/metrics: `src/components/details/*` + metrics utilities
- Fix k8s/resource logic: `src/hooks/useK8sResources.ts` and `src/utils/k8sUtils.ts`
- Fix URL handling/security: `src/utils/urlHelpers.ts`, `src/utils/navigationUtils.ts`, `src/utils/urlSecurity.ts`

## Output Expectations

When finishing a task in this repository:

1. Briefly explain what changed and why.
2. List edited file paths.
3. Report which validation commands were run and results.
4. Call out any follow-up work not completed.
