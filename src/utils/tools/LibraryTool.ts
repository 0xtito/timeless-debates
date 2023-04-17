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

  description = `Search through your Library to remember your theories, stances, and beliefs. Your library is in the form of vectorstores. The vectorstore contains your writings. `;

  async _call(text: string) {
    const vs = await SupabaseVectorStore.fromExistingIndex(this.embeddings, {
      client: supabase,
      tableName: `${this.philosopher}_duplicate`,
      queryName: "match_documents",
    });

    const rawResults = await vs.similaritySearch(text, 5);

    const results = rawResults.map((doc) => doc.pageContent).join("\n");

    // const textSummaries: string[] = [];
    // console.log("start summary loop");
    // for (let i = 0; i < rawResults.length; i++) {
    //   const text = rawResults[i].pageContent;
    //   const input = `You are ${this.philosopher
    //     .split("_")
    //     .map((name) => name[0].toUpperCase() + name.slice(1))
    //     .join(" ")} Write a concise summary of the following context:\n\n
    //   ${text}
    //   \n\nConcise Summary:
    //   `;
    //   const _ans = await this.model.generatePrompt([
    //     new StringPromptValue(input),
    //   ]);
    //   textSummaries.push(_ans.generations[0][0].text);
    // }
    // console.log("finished summary loop");

    // const results = textSummaries.join("\n\n");

    const input = `You are ${this.philosopher
      .split("_")
      .map((name) => name[0].toUpperCase() + name.slice(1))
      .join(
        " "
      )} and this is your work. Write a descriptive summary of the following context:\n\n
        ${results}
        \n\nConcise Summary: 
        `;

    const ans = await this.model.generatePrompt([new StringPromptValue(input)]);
    console.log(ans.generations[0][0].text);
    return ans.generations[0][0].text;
    return `Final answer: ${ans.generations[0][0].text}`;
  }
}
