# Creative Flow

A full-stack TypeScript application that helps users create personalized, heartfelt messages through an AI-guided creative process with audio enhancement capabilities.

## Features

- **4-Stage Creative Process**: Define intention → Gather story ingredients → Craft message → Create audio hug
- **AI-Powered Content**: OpenAI integration for personalized prompt generation and message weaving
- **Audio Enhancement**: Voice recording, text-to-speech, music mixing, and final compilation
- **Real-time Preview**: Live audio mixing and message refinement capabilities
- **Responsive Design**: Modern glass morphism UI with mobile-first approach

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Shadcn/ui
- **Backend**: Express.js, TypeScript, OpenAI API
- **State Management**: TanStack Query, Zod validation
- **Audio**: Web APIs (MediaRecorder, Speech Synthesis, Web Audio)

## Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd creative-flow

# Install dependencies
npm install

# Set up environment variables
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/src/          # React frontend application
│   ├── components/      # Reusable UI components
│   ├── pages/          # Main application pages
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utility functions and API clients
├── server/             # Express.js backend
│   ├── routes.ts       # API route definitions
│   ├── services/       # Business logic (OpenAI integration)
│   └── storage.ts      # Data persistence layer
├── shared/             # Shared types and schemas
└── Configuration files # TypeScript, Vite, TailwindCSS, ESLint
```

## Key Components

### Creative Flow Process
1. **Define Stage** (`creative-flow.tsx`): Set recipient, emotional anchor, occasion, tone
2. **Gather Stage**: AI generates story prompts, user adds personal ingredients
3. **Craft Stage**: AI weaves ingredients into cohesive message with refinement options
4. **Audio Hug Stage** (`audio-hug.tsx`): Record voice, select music, create final audio

### API Endpoints
- `POST /api/sessions` - Create new creative session
- `POST /api/generate-prompts` - Generate AI story prompts
- `POST /api/ai-weave` - Weave ingredients into message
- `POST /api/ai-stitch` - Refine existing message
- `GET /api/music/:trackId` - Stream background music tracks

## Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key_here  # Required for AI features
NODE_ENV=development                      # Environment setting
```

## Development

```bash
# Type checking
npx tsc --noEmit

# Linting
npx eslint .

# Development server with hot reload
npm run dev
```

## Audio System

The application includes a sophisticated audio system:
- **Voice Recording**: Browser-based audio capture
- **Text-to-Speech**: AI voice generation from written messages
- **Background Music**: 10 unique tracks with harmonic progressions
- **Real-time Mixing**: Preview voice + music combinations
- **Final Compilation**: Downloadable audio files

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Architecture Notes

- **Type Safety**: Comprehensive TypeScript implementation with Zod validation
- **Error Handling**: Robust error boundaries and graceful degradation
- **Performance**: Optimized with React Query caching and lazy loading
- **Accessibility**: WCAG-compliant UI components with keyboard navigation
- **Scalability**: Modular architecture ready for database integration

## Production Deployment

The application is configured for deployment on platforms like Replit, Vercel, or traditional servers:
- Single-port serving (Express serves both API and static files)
- Environment-based configuration
- Production build optimization
- Health check endpoints