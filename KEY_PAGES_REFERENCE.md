# Key Pages Reference - Creative Flow

## Main Application Pages

### creative-flow.tsx
**Location**: `client/src/pages/creative-flow.tsx`

**Purpose**: Main flow interface that orchestrates the entire Creative Flow user journey

**Key Features**:
- Stage management and navigation (Define → Gather → Craft → Audio Hug)
- Session state management and persistence
- UI coordination between different creative stages
- Progress tracking and stage transitions
- Integration point for all creative flow components

**Main Components Rendered**:
- `AnchorStage` - Define recipient, anchor, occasion, tone
- `PaletteStage` - AI prompt generation and ingredient collection
- `LoomStage` - Message crafting with AI weaving and refinement
- `AudioHug` - Audio recording and compilation (navigates to separate page)

**State Management**:
- Uses `useCreativeFlow` hook for session management
- Handles stage transitions and data persistence
- Manages loading states and error handling

**UI Flow Logic**:
```typescript
// Stage progression logic
if (stage === 'intention') -> AnchorStage
if (stage === 'reflection') -> PaletteStage  
if (stage === 'expression') -> LoomStage
if (stage === 'audio') -> Navigate to AudioHug page
```

---

### audio-hug.tsx
**Location**: `client/src/pages/audio-hug.tsx`

**Purpose**: Handles comprehensive audio generation and compilation features

**Key Features**:
- Voice recording using MediaRecorder API
- AI text-to-speech generation with Web Speech API
- Background music selection (10 tracks with unique frequencies)
- Real-time audio mixing and preview
- Cover image selection and customization
- Final audio compilation and download

**Audio System Components**:
- **Voice Capture**: Browser-based recording with start/stop controls
- **Music Library**: Server-generated WAV files with harmonic progressions
- **Audio Mixing**: Web Audio API for combining voice + music
- **Preview System**: Real-time playback of mixed audio combinations

**Technical Implementation**:
- Uses `useRef` for audio element management
- Implements proper cleanup for audio resources
- Handles multiple audio states (recording, playing, mixing)
- Generates downloadable final audio files

**Music Track Generation**:
```typescript
// Each track has unique frequency and harmonic structure
frequencies = {
  'gentle-piano': 440,    // A4
  'soft-strings': 523,    // C5
  'peaceful-nature': 349, // F4
  // ... 7 more tracks
}
```

**Integration Points**:
- Receives session data from creative-flow page
- Accesses final message from previous stages
- Provides audio enhancement to complete user journey

## Page Interaction Flow

```
creative-flow.tsx (stages 1-3) → audio-hug.tsx (stage 4)
     ↓                              ↓
Session Management              Audio Compilation
AI Content Generation          Voice + Music Mixing
Message Crafting               Final Output Creation
```

## Key State Objects

**Session Data Structure**:
```typescript
{
  sessionId: string
  recipientName: string
  anchor: string
  aiGeneratedPrompts: GeneratedPrompt[]
  ingredients: Ingredient[]
  finalMessage: string
  // ... additional metadata
}
```

**Audio State Management**:
```typescript
{
  recordedAudio: Blob | null
  aiAudio: string | null
  selectedMusic: string | null
  selectedCover: string | null
  isRecording: boolean
  playingPreview: string | null
  // ... audio controls
}
```

## Development Notes

Both pages are fully functional with:
- Comprehensive error handling and loading states
- TypeScript type safety throughout
- Responsive design with TailwindCSS
- Real-time state synchronization
- Proper cleanup of resources (audio, timers, API calls)

The prompt UI specifically lives in the `PaletteStage` component within creative-flow.tsx, which handles AI-generated story prompts and user ingredient collection.