import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuizRequest {
  topic: string;
  numQuestions: number;
  difficulty: string;
  negativeMarking: boolean;
  penalty: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, numQuestions, difficulty, negativeMarking, penalty }: QuizRequest = await req.json();

    console.log('Generating quiz:', { topic, numQuestions, difficulty });

    const systemPrompt = `You are an expert quiz generator. Create high-quality multiple-choice questions with clear, unambiguous answers. Each question should have exactly 4 options labeled A, B, C, D, with only one correct answer. Provide detailed explanations for why the correct answer is right and why other options are wrong.`;

    const userPrompt = `Generate ${numQuestions} multiple-choice questions about "${topic}" at ${difficulty} difficulty level.

Requirements:
- Each question must have exactly 4 options (A, B, C, D)
- Only one option should be correct
- Provide detailed explanation for each question
- Questions should be clear and unambiguous
- For ${difficulty} difficulty: ${
  difficulty === 'easy' ? 'Focus on basic concepts and definitions' :
  difficulty === 'medium' ? 'Include application and understanding questions' :
  difficulty === 'hard' ? 'Include complex scenarios and analysis questions' :
  'Mix of easy, medium, and hard questions'
}

Return ONLY a valid JSON object in this exact format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Detailed explanation of why the answer is correct and why others are wrong"
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    
    console.log('Raw AI response:', generatedText);
    
    const quizData = JSON.parse(generatedText);

    // Validate the response structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz data structure');
    }

    // Add quiz settings to the response
    const result = {
      ...quizData,
      settings: {
        topic,
        difficulty,
        negativeMarking,
        penalty,
        totalQuestions: numQuestions
      }
    };

    console.log('Quiz generated successfully:', result.questions.length, 'questions');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate quiz'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
