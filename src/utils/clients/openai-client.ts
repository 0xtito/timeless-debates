import { ChatOpenAI } from "langchain/chat_models/openai";

export const openai = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  temperature: 0.2,
  // streaming: true, // testing - may have to delete
});
