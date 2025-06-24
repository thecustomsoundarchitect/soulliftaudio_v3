import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCreativeFlowSessionSchema, updateCreativeFlowSessionSchema } from "@shared/schema";
import { generatePersonalizedPrompts, aiWeaveMessage, aiStitchMessage } from "./services/openai";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create a new creative flow session
  app.post("/api/sessions", async (req, res) => {
    try {
      const data = insertCreativeFlowSessionSchema.parse({
        ...req.body,
        sessionId: randomUUID(),
      });
      
      const session = await storage.createSession(data);
      res.json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(400).json({ 
        error: "Failed to create session",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // List all sessions (for debugging)
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = Array.from((storage as any).sessions.entries() as Iterable<[string, any]>).map(([id, session]) => ({ id, session }));
      res.json({ sessions, count: sessions.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to list sessions" });
    }
  });

  // Get session by ID
  app.get("/api/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        console.log(`Session ${sessionId} not found. Creating new session...`);
        // Try to create a minimal session if it doesn't exist
        const newSession = await storage.createSession({
          sessionId,
          recipientName: 'Unknown',
          anchor: 'GRATEFUL'
        });
        return res.json(newSession);
      }
      
      res.json(session);
    } catch (error) {
      console.error('Error getting session:', error);
      res.status(500).json({ 
        error: "Failed to get session",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update session
  app.patch("/api/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const updates = updateCreativeFlowSessionSchema.parse(req.body);
      
      const session = await storage.updateSession(sessionId, updates);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Error updating session:', error);
      res.status(400).json({ 
        error: "Failed to update session",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate personalized prompts
  app.post("/api/generate-prompts", async (req, res) => {
    try {
      const { recipientName, anchor, occasion, tone } = req.body;
      
      if (!anchor) {
        return res.status(400).json({ 
          error: "Missing required field: anchor is required" 
        });
      }
      
      const prompts = await generatePersonalizedPrompts(recipientName, anchor, occasion, tone);
      res.json({ prompts });
    } catch (error) {
      console.error('Error generating prompts:', error);
      res.status(500).json({ 
        error: "Failed to generate personalized prompts",
        details: error instanceof Error ? error.message : "AI service unavailable"
      });
    }
  });

  // AI Weaver - Generate complete message
  app.post("/api/ai-weave", async (req, res) => {
    try {
      const { recipientName, anchor, ingredients, occasion, tone } = req.body;
      
      if (!anchor || !ingredients || !Array.isArray(ingredients)) {
        return res.status(400).json({ 
          error: "Missing required fields: anchor and ingredients array are required" 
        });
      }
      
      const message = await aiWeaveMessage({
        recipientName,
        anchor,
        ingredients,
        occasion,
        tone
      });
      
      res.json({ message });
    } catch (error) {
      console.error('Error weaving message:', error);
      res.status(500).json({ 
        error: "Failed to generate message",
        details: error instanceof Error ? error.message : "Service temporarily unavailable"
      });
    }
  });

  // Polish & Refine - Improve existing message
  app.post("/api/ai-stitch", async (req, res) => {
    try {
      const { currentMessage, recipientName, anchor, improvements } = req.body;
      
      if (!currentMessage || !anchor) {
        return res.status(400).json({ 
          error: "Missing required fields: currentMessage and anchor are required" 
        });
      }
      
      const improvedMessage = await aiStitchMessage({
        currentMessage,
        recipientName,
        anchor,
        improvements
      });
      
      res.json({ message: improvedMessage });
    } catch (error) {
      console.error('Error polishing message:', error);
      res.status(500).json({ 
        error: "Failed to improve message",
        details: error instanceof Error ? error.message : "Service temporarily unavailable"
      });
    }
  });

  // Music API endpoints
  app.get("/api/music/:trackId", (req, res) => {
    const { trackId } = req.params;
    
    // Generate a simple sine wave audio for each track
    const frequencies: { [key: string]: number } = {
      'gentle-piano': 440, // A4
      'soft-strings': 523, // C5
      'peaceful-nature': 349, // F4
      'warm-acoustic': 392, // G4
      'uplifting-orchestral': 659, // E5
      'ambient-meditation': 293, // D4
      'jazz-cafe': 466, // Bb4
      'classical-embrace': 587, // D5
      'folk-harmony': 330, // E4
      'cinematic-love': 698  // F5
    };
    
    const frequency = frequencies[trackId] || 440;
    const sampleRate = 44100;
    const duration = 30; // 30 seconds
    const samples = sampleRate * duration;
    const amplitude = 0.1;
    
    // Create WAV header
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + samples * 2, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.write('data', 36);
    header.writeUInt32LE(samples * 2, 40);
    
    // Generate audio data with musical progression
    const audioData = Buffer.alloc(samples * 2);
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      // Create a simple chord progression with harmonics
      const fundamental = Math.sin(2 * Math.PI * frequency * t);
      const fifth = Math.sin(2 * Math.PI * (frequency * 1.5) * t) * 0.5;
      const octave = Math.sin(2 * Math.PI * (frequency * 2) * t) * 0.25;
      
      // Add some envelope to make it more musical
      const envelope = Math.exp(-t * 0.1) * 0.5 + 0.5;
      const sample = (fundamental + fifth + octave) * amplitude * envelope * 32767;
      audioData.writeInt16LE(Math.round(sample), i * 2);
    }
    
    const audioBuffer = Buffer.concat([header, audioData]);
    
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    res.send(audioBuffer);
  });

  const httpServer = createServer(app);
  return httpServer;
}
