import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
 
// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.TOGETHERAI_SECRET,
  baseURL: 'https://api.together.xyz/v1'
});
 

export const dynamic = 'force-dynamic';
 
export async function POST(req: Request) {
  const { llmPrompt } = await req.json();

 
  const llmResponse = await openai.chat.completions.create({
    model: "META-LLAMA/LLAMA-3-70B-CHAT-HF",
    messages: [{ role: "user", content: llmPrompt }],
    stream: true,
  });
 
  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(llmResponse);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}