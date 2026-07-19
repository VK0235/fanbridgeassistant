import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    const expectedText = formData.get("expectedText") as string | null;
    const type = formData.get("type") as string | null; // sentence-reading, word-reading, listen-repeat, spontaneous-speech
    const topic = formData.get("topic") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Groq API key not configured in environment" }, { status: 500 });
    }

    // 1. Send audio to Groq Whisper for transcription
    const whisperFormData = new FormData();
    
    // Dynamically adjust filename extension based on MIME type to prevent Groq API codec mismatch errors
    const mimeType = file.type || "";
    let fileName = "audio.webm";
    if (mimeType.includes("mp4")) {
      fileName = "audio.mp4";
    } else if (mimeType.includes("ogg")) {
      fileName = "audio.ogg";
    } else if (mimeType.includes("wav")) {
      fileName = "audio.wav";
    }
    
    const audioFile = new File([file], fileName, { type: mimeType || "audio/webm" });
    whisperFormData.append("file", audioFile);
    whisperFormData.append("model", "whisper-large-v3-turbo");
    whisperFormData.append("response_format", "json");

    const whisperResponse = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
      body: whisperFormData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error("Groq Whisper API error:", errorText);
      return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 });
    }

    const whisperData = await whisperResponse.json();
    const transcription = whisperData.text || "";

    if (!transcription.trim()) {
      return NextResponse.json({
        score: 0,
        pronunciationScore: 0,
        fluencyScore: 0,
        accuracyScore: 0,
        grammarScore: 0,
        vocabularyScore: 0,
        coherenceScore: 0,
        feedback: "No speech detected. Please speak clearly into your microphone.",
        transcription: "",
      });
    }

    // 2. Grade transcription using Groq Llama 3
    let prompt = "";
    if (type === "sentence-reading" || type === "listen-repeat") {
      prompt = `
You are an expert English Speech Assessment System.
Evaluate the student's spoken English performance for a "${type === 'sentence-reading' ? 'Sentence Reading' : 'Listen and Repeat'}" task.

Reference Sentence (what they should have said):
"${expectedText}"

Student's Transcribed Speech (what they actually said):
"${transcription}"

Instructions:
1. Compare the student's transcribed speech to the Reference Sentence.
2. Evaluate:
   - "accuracyScore": How closely the transcription matches the reference text (1 to 10 scale). Account for insertions, deletions, substitutions.
   - "pronunciationScore": Estimate pronunciation clarity based on any phonetic anomalies in the transcription or transcription confidence (1 to 10 scale).
   - "fluencyScore": Score flow/naturalness (1 to 10 scale). If the transcription has many stammering/repetition marks, reduce the score.
   - "score": Overall English speaking competence score for this question (1 to 10 scale).
3. Provide "feedback" (max 3 sentences) highlighting any missed, incorrect, or substituted words, and general advice.
4. Output your analysis strictly as a JSON object with this format:
{
  "score": number,
  "pronunciationScore": number,
  "fluencyScore": number,
  "accuracyScore": number,
  "feedback": "string"
}
Do not add any markup or introductory text outside the JSON object.
`;
    } else if (type === "word-reading") {
      prompt = `
You are an expert English Speech Assessment System.
Evaluate the student's spoken English performance for a "Word List Reading" task.

Reference Words (the words they should have read):
"${expectedText}"

Student's Transcribed Speech (what they actually said):
"${transcription}"

Instructions:
1. Compare the transcribed words with the Reference Words.
2. Evaluate:
   - "accuracyScore": What percentage of the reference words were successfully pronounced (1 to 10 scale).
   - "pronunciationScore": Phonetic accuracy/clarity estimate (1 to 10 scale).
   - "fluencyScore": Speech pacing (1 to 10 scale).
   - "score": Overall score for word pronunciation (1 to 10 scale).
3. Provide "feedback" (max 3 sentences) listing which words were mispronounced or skipped.
4. Output your analysis strictly as a JSON object with this format:
{
  "score": number,
  "pronunciationScore": number,
  "fluencyScore": number,
  "accuracyScore": number,
  "feedback": "string"
}
Do not add any markup or introductory text outside the JSON object.
`;
    } else if (type === "spontaneous-speech") {
      prompt = `
You are an expert English Speech Assessment System.
Evaluate the student's Spontaneous Speaking performance.

Topic / Prompt:
"${topic}"

Student's Transcribed Speech (what they actually said in response):
"${transcription}"

Instructions:
Evaluate the response on the following criteria (all scales 1 to 10):
- "grammarScore": Grammatical correctness and variety.
- "vocabularyScore": Vocabulary range and appropriateness.
- "coherenceScore": Structured flow, clear logical response to the topic, and progression of ideas.
- "pronunciationScore": Estimated clarity of speaking.
- "fluencyScore": Natural flow of speech.
- "score": Overall score reflecting spontaneous speaking proficiency.

Provide constructive feedback (max 3 sentences) detailing strengths and suggestions for improvement.
Output your analysis strictly as a JSON object with this format:
{
  "score": number,
  "pronunciationScore": number,
  "fluencyScore": number,
  "grammarScore": number,
  "vocabularyScore": number,
  "coherenceScore": number,
  "feedback": "string"
}
Do not add any markup or introductory text outside the JSON object.
`;
    } else {
      prompt = `
You are an expert English Speech Assessment System.
Evaluate this student's response:
Transcription: "${transcription}"

Output a JSON object:
{
  "score": 8,
  "pronunciationScore": 8,
  "fluencyScore": 8,
  "feedback": "Good job."
}
`;
    }

    const llamaResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an English language grading system. You only output valid JSON representing the grading structure. Do not output markdown, preambles, or explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!llamaResponse.ok) {
      const errorText = await llamaResponse.text();
      console.error("Groq Llama 3 API error:", errorText);
      return NextResponse.json({ error: "Failed to score transcription" }, { status: 500 });
    }

    const llamaData = await llamaResponse.json();
    const resultText = llamaData.choices[0]?.message?.content || "{}";
    const gradingResult = JSON.parse(resultText);

    return NextResponse.json({
      transcription,
      ...gradingResult
    });
  } catch (error: any) {
    console.error("Assessment route error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
