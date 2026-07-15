# FanBridge AI — Project Guidelines (Ponytail Principles)

All future features and adjustments to this codebase should adhere strictly to the following Senior-Developer principles:

## 1. The Ponytail Implementation Ladder
Before writing new code, stop at the first rung that holds:
1. **Does this need to exist?** If no, do not build it. Keep features strictly within requirements (YAGNI).
2. **Already in this codebase?** Reuse existing utility functions and layout containers rather than writing duplicates.
3. **Standard library does it?** Use built-in JavaScript/TypeScript objects and DOM methods.
4. **Native platform feature?** Prefer native HTML elements (e.g., `<input type="date">`, browser speech API) over importing external React UI libraries.
5. **Installed dependency?** Utilize Tailwind CSS v4 or default Next.js configurations already present.
6. **Minimum code that works:** Write clean, readable code with robust validation and security. Do not over-engineer.

## 2. Front-End Guidelines
- **Responsive Layout:** Keep the viewport locked (`h-screen overflow-hidden`) to prevent double scrollbars. Scoped inner container scrolling only.
- **Minimalist Styling:** Use light-theme glassmorphic card designs (`bg-white/60 backdrop-blur-md border border-white/60`) and soft Dribbble shadow depths.
- **Aesthetic Accents:** Maintain clear, contrasty typography and color indicators for status badges.
