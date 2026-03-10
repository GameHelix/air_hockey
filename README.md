# 🏒 Air Hockey — Neon Arena

A fast-paced, browser-based air hockey game built with Next.js, TypeScript, and Tailwind CSS. Challenge an AI opponent in a stunning neon/glassmorphism arena.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)

---

## ✨ Features

- **HTML5 Canvas** game rendering at 60 fps
- **Physics engine** — elastic collisions, friction, speed cap, paddle impulse transfer
- **AI opponent** with 3 difficulty tiers (Easy / Medium / Hard)
- **Neon + Glassmorphism** visual theme with glow effects and puck trail
- **Sound effects** generated via Web Audio API (no external files needed)
- **Score tracking** — first to 7 goals wins
- **High score** stored in `localStorage`
- **Pause / resume** (Space bar or button)
- **Animated UI** — goal flash, score pop, win/lose screen with particle effects
- **Fully responsive** — desktop, tablet, and mobile
- **Touch controls** — drag to control your paddle on mobile
- **Deploy-ready** for Vercel (zero configuration)

---

## 🎮 Controls

### Desktop
| Action | Control |
|---|---|
| Move paddle | Mouse movement |
| Pause / Resume | `Space` or ⏸ button |
| Restart | Button on pause/end screen |

### Mobile
| Action | Control |
|---|---|
| Move paddle | Touch and drag anywhere on canvas |
| Pause | Tap the ⏸ PAUSE button |

---

## 🤖 AI Difficulty

| Level | Speed | Behavior |
|---|---|---|
| **Easy** | Slow | Loose tracking, mostly stays home |
| **Medium** | Moderate | Tracks puck with some reaction error |
| **Hard** | Fast & fierce | Aggressive pursuit, minimal error |

---

## 🛠 Tech Stack

- **[Next.js 15](https://nextjs.org/)** — App Router, React 19
- **[TypeScript](https://www.typescriptlang.org/)** — strict mode
- **[Tailwind CSS v4](https://tailwindcss.com/)** — utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** — animations & transitions
- **HTML5 Canvas** — game rendering
- **Web Audio API** — procedural sound effects

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, metadata, viewport
│   ├── page.tsx            # Game orchestrator (state machine)
│   └── globals.css
├── components/
│   ├── game/
│   │   ├── GameCanvas.tsx  # Canvas + overlay manager
│   │   ├── GameHUD.tsx     # Score, pause button
│   │   ├── PauseScreen.tsx
│   │   └── EndScreen.tsx
│   └── ui/
│       ├── MainMenu.tsx
│       ├── DifficultySelector.tsx
│       └── Button.tsx
├── hooks/
│   ├── useGameEngine.ts    # rAF loop, rendering, input
│   ├── useAI.ts            # AI paddle logic
│   ├── useSound.ts
│   └── useHighScore.ts
├── lib/
│   ├── types.ts
│   ├── constants.ts
│   └── physics.ts
└── utils/
    └── audio.ts            # Web Audio API sounds
```

---

## 🚀 Run Locally

```bash
git clone <your-repo-url>
cd air_hockey
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## ☁️ Deploy to Vercel

### Option 1 — Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option 2 — Vercel Dashboard
1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository → **Deploy**

No environment variables required.

---

## 📜 License

MIT
