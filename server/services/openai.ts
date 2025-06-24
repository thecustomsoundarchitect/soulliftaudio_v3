import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

export interface GeneratedPrompt {
  id: string;
  text: string;
  icon: string;
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
  improvements?: string;
}

export async function generatePersonalizedPrompts(
  recipientName: string,
  anchor: string,
  occasion?: string,
  tone?: string
): Promise<GeneratedPrompt[]> {
  const recipient = recipientName || "someone special";
  
  try {
    console.log(`Generating prompts for ${recipient} with anchor "${anchor}"`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: `You are generating prompts for someone who wants their recipient to feel "${anchor}" when they read the message. Generate exactly 9 prompts (5-6 words each) that inspire stories proving the recipient deserves to feel this way.

KEY INSIGHT: The writer wants ${recipient} to feel "${anchor}" when they receive this message. Create prompts that inspire stories about times when ${recipient} demonstrated qualities, actions, or character that prove they deserve to feel "${anchor}".

REFRAME THE APPROACH:
Instead of "What do you feel about them?" ask "What stories show they deserve to feel ${anchor}?"

PROMPT CATEGORIES:
1. Times they showed the quality: "When ${recipient} demonstrated their strength" / "That time they proved their worth"
2. Impact on others: "How ${recipient} makes people feel" / "The way they brightens everyone's day"
3. Unrecognized contributions: "What ${recipient} doesn't realize about themselves" / "Their gift they takes for granted"
4. Character evidence: "The natural way ${recipient} helps others" / "How they instinctively knows when someone"
5. Future potential: "What you see growing in ${recipient}" / "How they will continue inspiring people"
6. Moments of courage: "That time ${recipient} stood up for" / "When they chose kindness over easy"
7. Daily proof: "The small ways ${recipient} makes" / "Their habit of putting others first"
8. Recognition they deserve: "Why ${recipient} deserves to know they" / "What people say about ${recipient} when"
9. Their authentic self: "The real ${recipient} that shines through" / "What makes ${recipient} irreplaceable to people"

RULES:
- 5-6 words exactly
- Focus on evidence that supports them feeling ${anchor}
- No smell/scent references
- Create curiosity about specific moments
- Include ${recipient}'s name naturally when it fits

Return JSON only:
{"prompts": [{"id": "1", "text": "prompt text here", "icon": ""}]}`
        },
        { 
          role: "user", 
          content: `Generate 9 personalized prompts (5-6 words each) for someone expressing "${anchor}" to ${recipient}${occasion ? ` for ${occasion}` : ''}${tone ? ` with a ${tone} tone` : ''}. 

Context: This is for a heartfelt message about feeling "${anchor}". Create prompts that will inspire authentic, specific stories rather than generic responses. Focus on unlocking memories and moments that demonstrate this feeling. Leave icon field empty.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 500,
    });

    console.log('OpenAI response received');
    const result = JSON.parse(response.choices[0].message.content || '{"prompts": []}');
    console.log('Generated prompts:', result.prompts?.map((p: any) => p.text));
    
    // Enforce length limit by checking word count and filter unwanted terms
    const validPrompts = (result.prompts || []).map((prompt: any, index: number) => {
      let text = prompt.text || "";
      
      // Remove any emojis from the text - simple approach
      text = text.replace(/[^\w\s]/g, '').trim();
      
      // Filter out prompts with unwanted terms
      const unwantedTerms = ['smell', 'scent', 'odor', 'fragrance', 'aroma'];
      const hasUnwantedTerm = unwantedTerms.some(term => 
        text.toLowerCase().includes(term.toLowerCase())
      );
      
      // Split by words and ensure 5-6 words
      const words = text.split(' ');
      
      // If not correct length or has unwanted terms, use fallback prompts focused on recipient feeling valued
      if (words.length < 5 || words.length > 6 || hasUnwantedTerm) {
        const fallbacks = [
          "When they showed incredible strength and courage",
          "That time they proved their worth clearly", 
          "How they naturally makes others feel better",
          "Their gift they doesn't fully recognize yet",
          "When they chose kindness over easy path",
          "The way they brightens everyone's whole day",
          "What people say about them when absent",
          "That moment they stood up for someone",
          "Why they deserves to know their impact"
        ];
        text = fallbacks[index] || "A moment that shows their worth";
        console.log(`Used fallback prompt: ${text}`);
      }
      
      // No icons - use empty string
      const icon = "";

      return {
        id: prompt.id || `${index + 1}`,
        text: text,
        icon: icon
      };
    });
    
    console.log('Final validated prompts:', validPrompts.map((p: any) => p.text));
    return validPrompts.slice(0, 9);
  } catch (error) {
    console.error('Error generating personalized prompts, using fallback prompts:', error);
    
    // Fallback prompts focused on recipient feeling valued when OpenAI is unavailable
    const fallbackPrompts: GeneratedPrompt[] = [
      { id: "1", text: "When they showed incredible strength and courage", icon: "" },
      { id: "2", text: "That time they proved their worth clearly", icon: "" },
      { id: "3", text: "How they naturally makes others feel better", icon: "" },
      { id: "4", text: "Their gift they doesn't fully recognize yet", icon: "" },
      { id: "5", text: "When they chose kindness over easy path", icon: "" },
      { id: "6", text: "The way they brightens everyone's whole day", icon: "" },
      { id: "7", text: "What people say about them when absent", icon: "" },
      { id: "8", text: "That time you both couldn't stop", icon: "" },
      { id: "9", text: "What you hope for their future", icon: "" }
    ];
    
    return fallbackPrompts;
  }
}

export async function aiWeaveMessage(request: AIWeaveRequest): Promise<string> {
  try {
    const recipient = request.recipientName || "someone special";
    
    // Ensure we have ingredients to work with
    if (!request.ingredients || request.ingredients.length === 0) {
      throw new Error("No ingredients provided to weave into message");
    }
    
    // Format ingredients with clear structure and emphasis on using ALL content
    const ingredientsText = request.ingredients
      .map((ing, index) => `INGREDIENT ${index + 1}:\nPrompt: "${ing.prompt}"\nStory/Content: ${ing.content}\n---`)
      .join('\n\n');

    const systemPrompt = `You are an expert message writer who creates deeply personal, heartfelt messages by weaving together specific stories and memories. 

CRITICAL REQUIREMENTS:
1. You MUST incorporate content from ALL ${request.ingredients.length} ingredients provided
2. Use the EXACT stories, details, and specific content from each ingredient
3. The core emotional anchor to convey is: "${request.anchor}"
4. Write directly to ${recipient} in second person
5. ${request.tone ? `Tone: ${request.tone}` : 'Use a warm, sincere, personal tone'}
6. ${request.occasion ? `Context: This message is for ${request.occasion}` : 'This is a personal message'}
7. Reference specific details, moments, actions, and examples from the ingredients
8. Create smooth transitions between different stories/ingredients
9. Make it feel authentic - like you personally witnessed these moments
10. End with a meaningful conclusion that ties everything together

FORBIDDEN:
- Do NOT write generic statements about ${recipient}
- Do NOT skip any ingredients - use them ALL
- Do NOT create content not mentioned in the ingredients
- Do NOT write vague platitudes

Your goal is to create a flowing, cohesive message that makes ${recipient} feel "${request.anchor}" by incorporating every single ingredient's content.`;

    const userPrompt = `Create a personal message for ${recipient} using ALL these ingredients. Each ingredient contains specific content that MUST be incorporated into the final message:

${ingredientsText}

REQUIREMENTS:
- Use content from ALL ${request.ingredients.length} ingredients above
- Make ${recipient} feel "${request.anchor}"
- Include specific details, stories, and examples from each ingredient
- Create a flowing narrative that connects all the stories naturally
- Write directly to ${recipient}

Create the complete message now:`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error weaving message:', error);
    
    // Fallback message composition when OpenAI is unavailable
    const recipient = request.recipientName || "someone special";
    const ingredientsList = request.ingredients.map(ing => ing.content).join('\n\n');
    
    const fallbackMessage = `Dear ${recipient},

I wanted to take a moment to share something with you.

${ingredientsList}

These thoughts have been on my mind, and I felt it was important to express them. I hope this message conveys how much you mean to me and helps you feel ${request.anchor}.

With love and appreciation.`;

    return fallbackMessage;
  }
}

export async function aiStitchMessage(request: AIStitchRequest): Promise<string> {
  try {
    const recipient = request.recipientName || "someone special";
    const systemPrompt = `You are an expert editor who specializes in refining and improving personal messages. Your task is to enhance the existing message while preserving its authentic voice and personal elements.

Guidelines:
1. Maintain the core feeling: "${request.anchor}"
2. Keep the personal voice and authentic tone
3. Improve flow, clarity, and emotional impact
4. Fix any awkward phrasing or transitions
5. Ensure the message effectively conveys "${request.anchor}" to ${recipient}
6. Preserve all specific personal details and memories
7. Make minimal changes - enhance, don't rewrite
8. ${request.improvements ? `Focus on: ${request.improvements}` : 'Focus on overall flow and impact'}

Return only the improved message, no explanations.`;

    const userPrompt = `Please refine and improve this message to ${recipient}, ensuring it effectively conveys "${request.anchor}":

${request.currentMessage}

Enhance the message while preserving its authentic voice and personal elements.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error stitching message:', error);
    
    // Fallback: return the original message with minor formatting improvements
    const lines = request.currentMessage.split('\n');
    const improvedLines = lines.map(line => line.trim()).filter(line => line.length > 0);
    return improvedLines.join('\n\n');
  }
}
