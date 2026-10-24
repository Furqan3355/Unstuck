# Unstuck

Unstuck turns an overwhelming assignment into one clear, tiny action. It is a calm, accessibility-first productivity tool built for the moment before starting.

## Why it exists

Large assignments create friction before the work even begins. Unstuck removes that friction by extracting the deadline, requirements, and useful actions from pasted instructions, then guiding the user through a smaller step ladder.

## Hackathon story

The strongest part of Unstuck is not another task list. It is the interaction loop:

1. Paste a real assignment.
2. See the brief decoded into a plain-language plan.
3. Start with one tiny action.
4. Press **Done** to move forward or **I’m stuck** to make the step smaller.
5. Use the optional two-minute timer to create a gentle starting ritual.

This makes the product feel responsive and human instead of static. The live progress strip confirms that the plan is changing as the user works.

## Features

- Client-side assignment parsing with deadline, actions, and requirements.
- Progressive step ladder that gets smaller when the user is stuck.
- Live completion progress and a focused current-step view.
- Two-minute timer with pause and reset controls.
- Voice input when the browser supports Web Speech recognition.
- Keyboard shortcuts: **N** for done and **S** for smaller.
- Accessibility controls for text size, high contrast, dyslexia-friendly spacing, and reduced motion.
- Privacy-first demo: pasted text stays in the browser.

## Tech stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS imports with custom CSS tokens
- Lucide React icons
- Vercel Analytics in production

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and paste an assignment to try the full flow.

## Product direction

For a production-ready version, the next high-impact improvements are:

- Add an AI extraction mode with a server-side route and structured JSON validation.
- Add a shareable plan link so a student can return to a plan later.
- Add real-time sync for accountability partners or study groups.
- Add lightweight analytics around where users get stuck, without storing assignment text.
- Add a small onboarding example and a “try a smaller step” explanation for first-time users.

## Judging pitch

Unstuck is memorable because it solves a specific emotional problem: starting. It combines a clear social use case, an immediately testable interaction, accessibility controls, and a distinctive calm visual system. The demo is strongest when you paste a genuinely intimidating assignment and show how one click turns it into a next action you can do in under two minutes.
