# Welcome Page — Implementation Notes

## Purpose
Provide a friendly, informative landing experience so users aren’t dropped straight into auth. The welcome page introduces the app value, gives quick calls-to-action, and routes users to `Login`/`Signup` or an exploration flow.

## Goals
- Greet first-time and returning users with clear value proposition.
- Provide entry points: "Get Started", "Explore as guest", "Learn more".
- Reduce friction by explaining features before sign-up.
- Keep layout lightweight and responsive.

## Suggested Layout
- Hero: App name, short tagline, primary CTA (Get Started), secondary CTA (Learn More), small `Login`/`Signup` links.
- Features strip: 3–4 short feature cards with icons.
- How it works: 3-step quick explainer.
- Demo/screenshot: image or short auto-play muted demo (optional).
- Social proof / footer: simple trust indicators and legal links.

## UI Components
- `Welcome.jsx` — page container and layout.
- `Hero.jsx` — title, tagline, CTAs.
- `FeatureCard.jsx` — reusable card for feature list.
- `HowItWorks.jsx` — three-step visual explanation.
- `DemoModal.jsx` (optional) — lightweight modal to show a quick demo.

## Routing
- Use the app root `/` to serve the welcome page.
- Move auth routes to `/login` and `/signup` and keep them accessible from the header/hero.
- If using client-side routing (Vite + React Router), set `<Route path="/" element={<Welcome/>} />` and keep auth routes separate.

## Styling & Assets
- Use Tailwind utilities (project already includes Tailwind) for rapid responsive layout.
- Store images in `frontend/src/assets/` or static hero in `frontend/public/`.
- Keep hero image size optimized and use `loading="lazy"`.

## Accessibility
- Use semantic elements: `<header>`, `<main>`, `<section>`, `<nav>`.
- Ensure CTAs are keyboard-focusable and have descriptive accessible names.
- Add ARIA attributes for modals and dynamic content.
- Color contrast checks for primary buttons and text.

## Behavior & UX
- If user is already authenticated, show a personalized greeting and primary CTA to jump to the app dashboard.
- Support `Explore as guest` path to let users try a limited demo without signing up.
- Subtle entrance animations (fade/slide) for hero and feature cards.
- Smooth scroll from CTAs to sections like features or how-it-works.

## Analytics & Events
- Track CTA clicks: `Get Started`, `Explore as guest`, `Login`, `Signup`.
- Track scroll depth on the welcome page for engagement metrics.

## Security & Privacy
- Avoid collecting PII on the welcome page. Any demo mode should use ephemeral demo sessions on the backend.

## Tests
- Unit: snapshot/behavior tests for `Welcome.jsx` and `FeatureCard.jsx`.
- Accessibility: axe-core or jest-axe checks for the welcome page.
- E2E: a simple Cypress or Playwright test that confirms CTAs route correctly and login/signup links are present.

## Deployment Notes
- No backend changes required unless adding server-side demo sessions or personalized greetings.
- Ensure SPA routing fallback is configured during production build deploy so `/` resolves properly.

## Implementation Steps (quick)
1. Create `frontend/src/components/Welcome.jsx` and small child components.
2. Add route for `/` in `frontend/src/App.jsx` (or router file).
3. Add hero image and small assets to `frontend/src/assets/`.
4. Style with Tailwind and make responsive breakpoints.
5. Add unit and accessibility tests.
6. Enable analytics events for CTA tracking.

## Optional Enhancements
- Add short Lottie animation in hero for motion.
- Add localized versions for multi-language support.
- A/B test different hero taglines and CTAs.

---

Created as a planning file to capture thoughts before implementation.
