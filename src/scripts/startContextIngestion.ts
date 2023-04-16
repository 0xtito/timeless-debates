// import { getUrls } from "@/utils/get-urls";
// import { extractArticleTexts } from "@/utils/getArticleData";
// import { ingestContextData } from "@/utils/ingest-context-data";
// import { OpenAIEmbeddings } from "langchain/embeddings";

// (async function main() {
//   const searchTerm: string = "root cause of the french riots";

//   const urls = await getUrls(searchTerm);

//   const articleData = await extractArticleTexts(urls);

//   console.log("starting to ingest content");
//   await ingestContextData(articleData, new OpenAIEmbeddings());
//   console.log("finished ingesting content");
// })();
