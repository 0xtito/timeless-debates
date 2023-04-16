import type { CallbackManager } from "langchain/callbacks";
import { BaseLanguageModel } from "langchain/base_language";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { Tool } from "langchain/tools";
import type { GoogleParameters } from "serpapi";
import { getJson } from "serpapi";
import { StringPromptValue } from "langchain/prompts";
import { SupabaseVectorStore } from "langchain/vectorstores";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { GoogleNewsResults, FormattedArticleData } from "@/types";
import { supabase } from "@/utils/clients/supabase-client";
import { apify } from "@/utils/clients/apify-client";
import { APIFY_INPUT } from "@/utils/constants";

const serpAPIKey = process.env.SERPAPI_API_KEY!;

/**
 * The agent will call this function to get 12 article urls related to the search term
 * @param searchTerm the term to search for
 * @returns an array of urls
 */
async function getUrls(searchTerm: string) {
  const params = {
    q: searchTerm,
    tbm: "nws",
    api_key: serpAPIKey,
    location: "United States",
    num: "12",
  } satisfies GoogleParameters;

  const result = await getJson("google", params);

  const allResults = result["news_results"] as GoogleNewsResults[];

  const urls: string[] = allResults.map((result) => {
    return result["link"] !== null ? result["link"] : "";
  });
  return urls;
}

/**
 *
 * @param urls an array of urls based off the search term given from the agent
 * @returns an array of objects with the title, url, and text of the article
 */
async function extractArticleTexts(urls: string[]) {
  // needs to be an array of objects with a url property
  const articleUrls = urls.map((url) => {
    return { url };
  });

  APIFY_INPUT.articleUrls = articleUrls;

  const run = await apify
    .actor("lukaskrivka/article-extractor-smart")
    .call(APIFY_INPUT);

  const { items } = await apify.dataset(run.defaultDatasetId).listItems();

  const formattedData: FormattedArticleData[] = items.map((item) => {
    const rawText = (item.text as string) || "";
    const title = (item.title as string) || "";
    const url = (item.url as string) || "";

    const sanitizedText = rawText.trim().replaceAll("\n", " ");

    const data = {
      title,
      url,
      text: sanitizedText,
    };
    return data;
  });

  return formattedData;
}

/**
 * This function will ingest the article data returned from apify into the vectorstore
 * @param articleData an array of objects with the title, url, and text of the article
 * @param embeddings the embeddings to use (currently only OpenAIEmbeddings)
 * @returns
 */
async function ingestContextData(
  articleData: FormattedArticleData[],
  embeddings: OpenAIEmbeddings
) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  try {
    const textData = articleData.map((article) => {
      return article.text;
    });

    const articleMetaData = articleData.map((article) => {
      return {
        title: article.title || "",
        url: article.url || "",
      };
    });

    const docs = await textSplitter.createDocuments(textData, articleMetaData);

    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: "articles",
      queryName: "match_documents",
    });

    console.log("adding docs to articles vector store");
    await vectorStore.addDocuments(docs);
    console.log("added docs to articles vector store");
    return vectorStore;
  } catch (error) {
    throw new Error("Failed to ingest data");
  }
}

interface WebExtractionToolArgs {
  model: BaseLanguageModel;
  embeddings: OpenAIEmbeddings;
  verbose?: boolean;
  callbackManager?: CallbackManager;
}

export class ArticleExtractionTool extends Tool {
  private model: BaseLanguageModel;
  private embeddings: OpenAIEmbeddings;

  constructor({
    model,
    embeddings,
    verbose,
    callbackManager,
  }: WebExtractionToolArgs) {
    super(verbose, callbackManager);
    this.model = model;
    this.embeddings = embeddings;
  }

  name = "Article Extraction Tool";

  description =
    "Useful when you need to know more about the context of the question. Use this when you need more information about the context. This tool will extract the text from the articles that are relevant to the question. The term to search must either start with, `What is ` or `Who is ` or `When is ` or `Where is ` or `Why is ` or `How is `, depending on what you need to find.";

  async _call(text: string) {
    // check if data is already in the vectorstore
    const _vs = await SupabaseVectorStore.fromExistingIndex(this.embeddings, {
      client: supabase,
      tableName: "articles",
      queryName: "match_documents",
    });

    const _rawResults = await _vs.similaritySearchWithScore(text, 3);
    console.log(_rawResults);

    if (_rawResults.length !== 0) {
      console.log("some data already in vectorstore");
      if (_rawResults[0][1] > 0.8) {
        console.log("data is relevant");
        const rawResults = await _vs.similaritySearch(text);

        const results = rawResults.map((doc) => doc.pageContent).join("\n");

        const input = `Here is the context:\n ${results}\n\n 
        Give me a summary of the context above.
        `;

        const ans = await this.model.generatePrompt([
          new StringPromptValue(input),
        ]);

        return ans.generations[0][0].text;
        return `Final answer: ${ans.generations[0][0].text}`;
      } else {
        console.log("data is not relevant");
      }
    }
    console.log("need to ingest data");

    // call to serpapi to get urls
    const urls = await getUrls(text);

    // extract text from urls with apify
    const data = await extractArticleTexts(urls);

    const vs = await ingestContextData(data, this.embeddings);

    // const rawResults = await vs.similaritySearchWithScore(text, 4);
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
