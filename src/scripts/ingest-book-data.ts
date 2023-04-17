import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { EPubLoader } from "langchain/document_loaders/fs/epub";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Document } from "langchain/document";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";

import { supabase } from "@/utils/clients/supabase-client";

const authorsFilePaths = [
  "books/adam_smith/epub",
  "books/epictetus/epub",
  "books/friedrich_wilhelm_nietzsche/epub",
  "books/immanuel_kant/epub",
  "books/jean_jacques_rousseau/epub",
  "books/karl_marx/epub",
  "books/marcus_aurelius/epub",
  "books/plato/epub",
  "books/rene_descartes/epub",
  "books/niccolo_machiavelli/epub",
];

async function createVectorStores(allAuthorsDocs: Document[][]) {
  for (const docs of allAuthorsDocs) {
    const vectorStore = new SupabaseVectorStore(new OpenAIEmbeddings(), {
      client: supabase,
      tableName: docs[0].metadata.author
        .split(" ")
        .join("_")
        .toLowerCase() as string,
    });
    console.log("Creating vector store for: ", docs[0].metadata.author);

    await vectorStore.addDocuments(docs);
    console.log("Vector store created for: ", docs[0].metadata.author);
  }
}

async function transformBookData(path: string) {
  const directoryLoader = new DirectoryLoader(path, {
    ".epub": (path) => new EPubLoader(path),
  });
  const rawdocs = await directoryLoader.load();

  const docs = rawdocs
    .filter((doc) => typeof doc.pageContent === "string")
    .map((doc) => {
      const source = doc.metadata.source as string;

      const author = source
        .split("/")[8]
        .split("_")
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ");

      const book = doc.metadata.source
        .split("/")[10]
        .replace(".epub", "")
        .replace(/_/g, " ");

      doc.metadata = {
        author,
        book,
      };
      return doc;
    });
  return docs;
}

async function embedBookData() {
  let rawDocs: Document[] = [];
  for (const path of authorsFilePaths) {
    const docs = await transformBookData(path);
    rawDocs.push(...docs);
  }
  console.log("before text splitter");
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2250,
    chunkOverlap: 300,
  });

  console.log("after text splitter");
  console.log("before split documents");
  const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
  console.log("chunked docs: ", chunkedDocs.length);
  console.log("after split documents");

  const adamSmithDocs: Document[] = [];
  const epictetusDocs: Document[] = [];
  const friedrichWilhelmNietzscheDocs: Document[] = [];
  const immanuelKantDocs: Document[] = [];
  const jeanJacquesRousseauDocs: Document[] = [];
  const karlMarxDocs: Document[] = [];
  const marcusAureliusDocs: Document[] = [];
  const platoDocs: Document[] = [];
  const reneDescartesDocs: Document[] = [];
  const niccoloMachiavelliDocs: Document[] = [];

  chunkedDocs.forEach((doc) => {
    switch (doc.metadata.author) {
      case "Adam Smith":
        adamSmithDocs.push(doc);
        break;
      case "Epictetus":
        epictetusDocs.push(doc);
        break;
      case "Friedrich Wilhelm Nietzsche":
        friedrichWilhelmNietzscheDocs.push(doc);
        break;
      case "Immanuel Kant":
        immanuelKantDocs.push(doc);
        break;
      case "Jean Jacques Rousseau":
        jeanJacquesRousseauDocs.push(doc);
        break;
      case "Karl Marx":
        karlMarxDocs.push(doc);
        break;
      case "Marcus Aurelius":
        marcusAureliusDocs.push(doc);
        break;
      case "Plato":
        platoDocs.push(doc);
        break;
      case "Rene Descartes":
        reneDescartesDocs.push(doc);
        break;
      case "Niccolo Machiavelli":
        niccoloMachiavelliDocs.push(doc);
        break;
      default:
        break;
    }
  });

  const allAutherDocs = [
    adamSmithDocs,
    epictetusDocs,
    friedrichWilhelmNietzscheDocs,
    immanuelKantDocs,
    jeanJacquesRousseauDocs,
    karlMarxDocs,
    marcusAureliusDocs,
    platoDocs,
    reneDescartesDocs,
    niccoloMachiavelliDocs,
  ];

  await createVectorStores(allAutherDocs);

  console.log("all vector stores created");
}

(async () => {
  await embedBookData();
  console.log("complete");
})();
