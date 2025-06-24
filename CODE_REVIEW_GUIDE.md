# Creative Flow - Code Review Guide

## Quick Start for Developers

### Project Overview
Creative Flow is a TypeScript full-stack application that helps users create personalized messages through an AI-guided process with audio enhancement capabilities.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + Shadcn/ui
- **Backend**: Express.js + TypeScript + OpenAI integration
- **State**: TanStack Query + Zod validation + Drizzle schema

### Key Architecture Files to Review

#### Core Application Logic
- `client/src/pages/creative-flow.tsx` - Main user journey orchestration
- `client/src/pages/audio-hug.tsx` - Audio recording and mixing features
- `client/src/hooks/use-creative-flow.ts` - State management and API integration

#### Backend Services
- `server/routes.ts` - RESTful API endpoints and business logic
- `server/services/openai.ts` - AI prompt generation and message weaving
- `server/storage.ts` - Data persistence abstraction layer

#### Type Safety & Schema
- `shared/schema.ts` - Database schema and TypeScript types
- `client/src/lib/creative-flow.ts` - API client and data transformations

### User Flow (4 Stages)
1. **Define**: Set recipient, emotional anchor, occasion, tone
2. **Gather**: AI generates story prompts, user adds ingredients  
3. **Craft**: AI weaves ingredients into cohesive message with refinement
4. **Audio Hug**: Record voice, select music, mix and compile final audio

### OpenAI Integration Points
- `generatePersonalizedPrompts()` - Creates 9 story prompts based on user's intention
- `aiWeaveMessage()` - Combines story ingredients into flowing narrative
- `aiStitchMessage()` - Refines and improves existing messages

### Audio System Architecture
- Browser MediaRecorder API for voice capture
- Web Speech API for text-to-speech generation
- Server-generated WAV files for background music (10 tracks)
- Web Audio API for real-time mixing and preview

### Data Flow
```
User Input → AI Prompts → Story Ingredients → AI Weaving → Message → Audio Enhancement → Final Output
```

### Installation & Setup
```bash
npm install
npm run dev  # Starts both frontend and backend on port 5000
```

### Environment Variables Needed
- `OPENAI_API_KEY` - For AI content generation

### Recent Technical Improvements
- Fixed all TypeScript compilation errors
- Implemented real audio generation vs placeholders
- Added comprehensive error handling and session recovery
- Configured ESLint with TypeScript support

### Code Quality Notes
- All functions properly typed with TypeScript
- Comprehensive error boundaries and loading states
- Modular component architecture with clear separation of concerns
- RESTful API design following Express best practices

### Performance Considerations
- Efficient state management with TanStack Query caching
- Lazy loading and code splitting ready
- Optimized audio handling with proper cleanup
- Hot module replacement for development efficiency