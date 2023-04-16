import { Document } from "langchain/document";

export interface FormattedArticleData {
  title: string;
  url: string;
  text: string;
}

export interface RawArticleData {
  title: string;
  description: string;
  publisher: string;
  url: string;
  text: string;
}

export interface GoogleNewsResults {
  position: string | null;
  title: string | null;
  link: string | null;
  date: string | null;
  source: string | null;
  snippet: string | null;
  category: string | null;
  thumbnail: string | null;
}

export interface Message {
  type: "apiMessage" | "userMessage";
  message: string;
  isStreaming?: boolean;
  sourceDocs?: Document[];
}

export interface ArticleSectionProps {
  // at one point, this will be set from through SSR
  messageState: {
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  };
  articlePrinting: boolean;
  articleComplete: boolean;
}

export interface ArticleDocument extends Document {
  pageContent: string;
  metadata:
    | {
        title: string;
        description: string;
        id: string;
        publisher: string;
        url: string;
        image: string;
      }
    | Record<string, any>;
}

export interface Philosopher {
  id: number;
  name: string;
  serverName: string;
  image: string;
}
