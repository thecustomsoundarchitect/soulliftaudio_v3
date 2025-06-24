# Developer Setup - Creative Flow

## Installation
```bash
npm install
```

## Environment Setup
Create `.env` or use Replit secrets:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Run Development Server
```bash
npm run dev
```
App runs on `http://localhost:5000`

## Key Commands
```bash
npm run dev          # Start development server
npx tsc --noEmit     # Type checking
npx eslint .         # Code linting
```

## Project Structure
```
├── client/src/           # React frontend
│   ├── components/       # Reusable UI components
│   ├── pages/           # Main app pages
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utils and API client
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   ├── services/        # Business logic
│   └── storage.ts       # Data layer
├── shared/              # Common types/schemas
└── Config files         # TS, Vite, Tailwind, ESLint
```

## Core Features to Test
1. Create new session → Generate prompts → Add ingredients → AI weave message
2. Navigate to Audio Hug → Record voice → Select music → Preview mix
3. API endpoints: `/api/sessions`, `/api/generate-prompts`, `/api/ai-weave`

## Technology Stack
- React 18 + TypeScript + Vite
- Express.js + TypeScript  
- TailwindCSS + Shadcn/ui
- TanStack Query + Zod validation
- OpenAI GPT-3.5-turbo integration