import { apiRequest } from "./queryClient";

export interface GeneratedPrompt {
  id: string;
  text: string;
  icon: string;
}

export interface Ingredient {
  prompt: string;
  content: string;
}

export interface AIWeaveRequest {
  recipientName: string;
  anchor: string;
  ingredients: Array<{
    prompt: string;
    content: string;
  }>;
  occasion?: string;
  tone?: string;
}

export interface AIStitchRequest {
  currentMessage: string;
  recipientName: string;
  anchor: string;
}

export async function generatePersonalizedPrompts(
  recipientName: string,
  anchor: string,
  occasion?: string,
  tone?: string
): Promise<GeneratedPrompt[]> {
  const response = await apiRequest('POST', '/api/generate-prompts', {
    recipientName,
    anchor,
    occasion,
    tone
  });
  
  const data = await response.json();
  return data.prompts;
}

export async function aiWeaveMessage(request: AIWeaveRequest): Promise<string> {
  const response = await apiRequest('POST', '/api/ai-weave', request);
  const data = await response.json();
  return data.message;
}

export async function aiStitchMessage(request: AIStitchRequest): Promise<string> {
  const response = await apiRequest('POST', '/api/ai-stitch', request);
  const data = await response.json();
  return data.message;
}
