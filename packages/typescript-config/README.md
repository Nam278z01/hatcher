# `@workspace/typescript-config`

Shared typescript configuration for the workspace.

Usage
- Base: `"extends": "@workspace/typescript-config/base.json"`
- Next.js app: `"extends": "@workspace/typescript-config/nextjs.json"`
- NestJS service: `"extends": "@workspace/typescript-config/nest.json"`

NestJS notes
- Uses NodeNext module/resolution, `emitDecoratorMetadata`, and `experimentalDecorators`.
- Sets `lib` to [`ES2023`] and `types` to [`node`] (no DOM globals).
- Outputs to `dist/` by default; override per-app if needed.
