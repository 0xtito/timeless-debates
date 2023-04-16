import type { CallbackManager } from "langchain/callbacks";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { Tool } from "langchain/tools";
import { SupabaseVectorStore } from "langchain/vectorstores";

import { supabase } from "../clients/supabase-client";
import { StringPromptValue } from "langchain/prompts";

interface LibraryToolArgs {
  model: BaseLanguageModel;
  philosopher: string;
  embeddings: OpenAIEmbeddings;
  verbose?: boolean;
  callbackManager?: CallbackManager;
}

export class LibraryTool extends Tool {
  private model: BaseLanguageModel;
  private embeddings: OpenAIEmbeddings;
  private philosopher: string;

  constructor({
    model,
    philosopher,
    embeddings,
    verbose,
    callbackManager,
  }: LibraryToolArgs) {
    super(verbose, callbackManager);
    this.model = model;
    this.philosopher = philosopher;
    this.embeddings = embeddings;
  }

  name = "Library Tool";

  description = `Search through your Library to remember your theories, stances, and beliefs. Your library is in the form of vectorstores. The vectorstore contains your writings.`;

  async _call(text: string) {
    const vs = await SupabaseVectorStore.fromExistingIndex(this.embeddings, {
      client: supabase,
      tableName: this.philosopher,
      queryName: "match_documents",
    });

    const rawResults = await vs.similaritySearch(text);

    const results = rawResults.map((doc) => doc.pageContent).join("\n");

    const input = `Here is the context:\n ${results}\n\n 
    Give me a summary of the context above.
    `;

    const ans = await this.model.generatePrompt([new StringPromptValue(input)]);

    return ans.generations[0][0].text;
    return `Final answer: ${ans.generations[0][0].text}`;
  }
}
