# Drip AI — AI-Powered Personal Fashion Stylist

Drip AI is a premium, portfolio-worthy web application that acts as an AI-powered personal fashion stylist. Users enter natural language prompts describing their styling requirements (occasion, budget, season, preferred colors, styling tone, and fit) and receive a fully coordinated outfit recommendation composed of real-world shopping items.

Designed with a sleek, minimalist aesthetic inspired by industry leaders like Apple, Linear, and Notion, Drip AI delivers a highly polished, interactive experience.

---

## 🌟 Key Features (MVP - V1)

- **AI Prompt Console**: A custom command-palette-like console that parses style queries with granular filter overrides (e.g., budget caps, fits, occasion settings, colors).
- **Curated Outfit Recommendations**: Beautiful, glassmorphic presentation cards containing outfit details with custom styling names (e.g., *Midnight Elegance*, *Street Royalty*).
- **Product Breakdowns**: Card decks for tops, bottoms, shoes, and accessories featuring live prices, matching confidence percentages, and direct shopping links.
- **Trial Closet**: A client-side workspace where users can drag/add recommended clothing items to a temporary interactive tray to mix-and-match looks and dynamically track total cost updates.
- **Responsive Workspace**: Optimized layouts for mobile and desktop screens.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) + TypeScript
- **Styling**: Vanilla CSS Modules (using strict design tokens via CSS variables for theme management)
- **AI Orchestration**: Google Gemini 2.5 (Generative Language & Multimodal API)
- **Backend & Database**: Supabase JS Client (Direct metadata logging & saved configuration storage)
- **Icons**: Lucide React

---

## 📂 Project Structure

```
drip-ai/
├── public/                 # Branding SVGs, static assets
├── src/
│   ├── app/                # Next.js Pages & Route Handlers
│   │   ├── layout.tsx      # Main layout & Google Font provider
│   │   ├── page.tsx        # Unified landing page & interactive workspace
│   │   └── api/            # Serverless endpoint handlers
│   │       └── style/      # POST: Styling orchestration endpoint
│   ├── components/         # Modular React Components
│   │   ├── ui/             # Reusable design components (Buttons, Inputs, Drawers)
│   │   ├── stylist/        # Outfit display cards & search inputs
│   │   └── trial-closet/   # Mix-and-match client-side interactive panel
│   ├── hooks/              # Custom React hooks (e.g., localState sync)
│   ├── lib/                # Client initializations (Supabase, Gemini)
│   ├── services/           # Decoupled business logic services
│   │   └── search/         # Modular Product retrieval engine
│   ├── styles/             # Modular CSS System
│   │   ├── variables.css   # Core design system tokens (colors, margins, borders)
│   │   ├── globals.css     # Global resets and root styling
│   │   └── workspace.module.css # Common grid/glassmorphic patterns
│   └── types/              # Unified TypeScript definitions
```

---

## ⚙️ Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18.x or higher recommended) and npm or yarn.

### 2. Environment Setup
Copy the example environment file and fill in your API credentials:
```bash
cp .env.example .env.local
```

### 3. Installation
Install the project dependencies:
```bash
npm install
```

### 4. Running the Development Server
Launch the local dev environment:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application workspace.
