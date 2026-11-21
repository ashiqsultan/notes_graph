# Project Overview

We are building a local notes web app.

## Techstack

React app build with TS
Styling: Tailwind
App level state: Zustand store in src/store.ts
Components lib: ShadCN
Icons: lucide-react
IndexedDB: dexie in src/db.ts

## Coding Principles

- Small, focused functions: Each function should have one clear responsibility. Separate business logic into well named functions.
- Avoid nested logic: Minimize deeply nested conditions, loops, and callbacks. Use early returns and helper functions to keep code flat and readable.
- Meaningful naming: Use descriptive names that clearly communicate what a function does.
- Small files and components: Avoid oversized files. Split unrelated logic and independent components into separate files with clear responsibilities.
- Readable over clever: Prefer straightforward, self explanatory code over clever or unnecessarily complex implementations.
- Avoid overengineering: Extract logic when it improves readability and maintainability. Do not create unnecessary abstractions or wrapper functions just to split code.
