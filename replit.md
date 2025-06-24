# Creative Flow Application

## Overview

Creative Flow is a full-stack web application designed to help users create personalized, heartfelt messages for their loved ones through an AI-guided creative process. The application guides users through three main stages: defining intention (anchor), gathering emotional ingredients through story prompts, and weaving these elements into a final message.

## System Architecture

This is a modern full-stack TypeScript application built with:

**Frontend Architecture:**
- React 18 with TypeScript
- Vite for development and build tooling
- Wouter for client-side routing
- TanStack Query for state management and API communication
- Tailwind CSS with Shadcn/ui components for styling
- Glass morphism design aesthetic

**Backend Architecture:**
- Express.js server with TypeScript
- RESTful API design
- Session-based storage (currently in-memory with fallback to database)
- OpenAI integration for AI-powered content generation

**Database Layer:**
- PostgreSQL database (configured but may not be actively used)
- Drizzle ORM for database interactions
- Schema-driven data modeling with Zod validation

## Key Components

### Frontend Components
- **Creative Flow Pages:** Multi-stage user journey (anchor → palette → loom)
- **Audio Hug Page:** Audio recording and AI voice generation features
- **Shadcn/ui Component Library:** Comprehensive UI component system
- **Custom Hooks:** `use-creative-flow` for state management, `use-mobile` for responsive behavior

### Backend Services
- **Session Management:** CRUD operations for creative flow sessions
- **OpenAI Integration:** AI prompt generation, message weaving, and content stitching
- **Storage Layer:** Abstracted storage interface with memory and database implementations

### Data Models
- **Users:** Basic user authentication schema
- **Creative Flow Sessions:** Complex session data including prompts, ingredients, and final messages
- **JSON Data Types:** Rich data structures for prompts, ingredients, and descriptors

## Data Flow

1. **Session Creation:** User starts by defining their intention (recipient, emotional anchor, occasion, tone)
2. **AI Prompt Generation:** System generates personalized story prompts based on user's intention
3. **Ingredient Collection:** User responds to prompts, creating "ingredients" (story fragments)
4. **Message Composition:** AI weaves ingredients into cohesive message, user can refine with AI assistance
5. **Audio Enhancement:** Optional audio recording and AI voice generation features

## External Dependencies

### Core Dependencies
- **OpenAI API:** GPT-3.5-turbo for content generation
- **Neon Database:** PostgreSQL hosting (configured via @neondatabase/serverless)
- **Radix UI:** Accessible component primitives
- **React Hook Form:** Form state management with Zod validation

### Development Tools
- **Drizzle Kit:** Database migrations and schema management
- **ESBuild:** Production bundling
- **Puppeteer:** PDF generation capabilities
- **TypeScript:** Type safety across the entire stack

## Deployment Strategy

**Development Environment:**
- Replit-optimized development setup
- Hot module replacement via Vite
- PostgreSQL module pre-configured
- Environment variable management

**Production Deployment:**
- Autoscale deployment target
- Build process: Vite frontend build + ESBuild server bundle
- Single-port deployment (5000 → 80)
- Static file serving for production assets

**Build Process:**
1. Frontend assets built with Vite to `dist/public`
2. Server bundled with ESBuild to `dist/index.js`
3. Production server serves static files and API routes

## Recent Changes

- June 24, 2025: Initial setup
- June 24, 2025: Fixed AI weaving to incorporate all ingredients properly
- June 24, 2025: Implemented session persistence across page navigation
- June 24, 2025: Added Audio Hug as fourth stage in creative flow with progress navigation
- June 24, 2025: Enhanced stage navigation to include Define → Gather → Craft → Audio Hug flow
- June 24, 2025: Implemented complete Audio Hug features:
  * 10 background music tracks (3 free, 7 premium)
  * 6 predefined album-style cover images plus custom upload
  * Audio mixing with volume controls for voice and music
  * Final compilation system combining message + audio + cover image
  * Free tier limitations for music selection
- June 24, 2025: Code quality improvements and debugging:
  * Fixed all TypeScript compilation errors across server files
  * Resolved JavaScript initialization errors in AudioHug component
  * Implemented real audio generation with server-generated WAV files
  * Added comprehensive ESLint configuration for code standards
  * Created deployment-ready archives for code review

## User Preferences

Preferred communication style: Simple, everyday language.