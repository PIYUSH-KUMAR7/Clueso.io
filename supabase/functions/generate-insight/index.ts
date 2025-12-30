import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Feedback {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  rating: number | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedback } = await req.json() as { feedback: Feedback[] };
    
    if (!feedback || feedback.length === 0) {
      throw new Error('No feedback provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Prepare feedback summary for AI
    const feedbackSummary = feedback.map(f => 
      `- [${f.category}] ${f.title}: ${f.content}${f.rating ? ` (Rating: ${f.rating}/5)` : ''}`
    ).join('\n');

    console.log(`Analyzing ${feedback.length} feedback items...`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert product analyst specializing in user feedback analysis. Analyze the provided feedback and generate actionable insights.

Your response MUST be valid JSON with this exact structure:
{
  "title": "A concise title summarizing the main insight (max 10 words)",
  "summary": "A comprehensive 2-3 sentence summary of the key findings",
  "key_themes": ["theme1", "theme2", "theme3"],
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "action_items": ["action1", "action2", "action3"]
}

Guidelines:
- Identify the most common themes and patterns
- Determine overall sentiment based on the content and ratings
- Generate 3-5 specific, actionable recommendations
- Be concise but informative
- Focus on product improvement opportunities`
          },
          {
            role: 'user',
            content: `Analyze the following ${feedback.length} pieces of user feedback and generate insights:\n\n${feedbackSummary}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add more credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('Failed to generate insight from AI');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI response received:', content);

    // Parse the JSON response
    let insight;
    try {
      // Remove any markdown code blocks if present
      const jsonContent = content.replace(/```json\n?|\n?```/g, '').trim();
      insight = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Create a fallback response
      insight = {
        title: 'Feedback Analysis Summary',
        summary: content.substring(0, 500),
        key_themes: ['User Experience', 'Feature Requests', 'Performance'],
        sentiment: 'neutral',
        action_items: ['Review detailed feedback', 'Prioritize based on frequency', 'Follow up with users']
      };
    }

    // Validate the insight structure
    const validatedInsight = {
      title: insight.title || 'Feedback Analysis',
      summary: insight.summary || 'Analysis complete',
      key_themes: Array.isArray(insight.key_themes) ? insight.key_themes.slice(0, 5) : [],
      sentiment: ['positive', 'negative', 'neutral', 'mixed'].includes(insight.sentiment) 
        ? insight.sentiment 
        : 'neutral',
      action_items: Array.isArray(insight.action_items) ? insight.action_items.slice(0, 5) : []
    };

    console.log('Generated insight:', validatedInsight);

    return new Response(
      JSON.stringify(validatedInsight),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-insight function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
