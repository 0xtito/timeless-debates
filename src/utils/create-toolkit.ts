import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatVectorDBQAChain, LLMChain, loadQAChain } from "langchain/chains";
import { ChainTool } from "langchain/tools";
import { ChatPromptTemplate } from "langchain/prompts";
import { PromptTemplate } from "langchain/prompts";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { CallbackManager } from "langchain/callbacks";
import { ArticleExtractionTool } from "@/utils/tools/ArticalExtractionTool";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

import { authorPrefixPrompts } from "./constants";
import { openai } from "./clients/openai-client";
import { OpenAI } from "langchain";
import { LibraryTool } from "./tools/LibraryTool";

const CONDENSE_PROMPT =
  PromptTemplate.fromTemplate(`Given the following conversation and a follow up question or statement, make sure your response answer's the question or directly address the statement made in a polite and intellectual manner.

Chat History:
{chat_history}
Question or Statement: {input}
`);

/**
 * The Agent is going to contain at least two tools:
 *  1. To search through the philosphers respective vectorstore
 *  2. To search through the context from the artcles returned from apify
 *
 */

export function createToolkit(
  philosopher: string,
  onTokenStream?: (token: string) => void
) {
  const authorAndPrompt = Object.entries(authorPrefixPrompts).find(
    ([author, prompt]) => author === philosopher
  );

  if (!authorAndPrompt) return null;

  const [authorName, prompt] = authorAndPrompt;

  const authorFullName = authorName
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

  const contextTool = new ArticleExtractionTool({
    model: openai,
    embeddings: new OpenAIEmbeddings(),
    verbose: true,
  });
  const philosopherTool = new LibraryTool({
    model: openai,
    philosopher: authorName,
    embeddings: new OpenAIEmbeddings(),
    verbose: true,
  });

  const tools = [philosopherTool, contextTool];

  return tools;
}
