import type { NextApiRequest, NextApiResponse } from "next";
import { createAgent } from "@/utils/create-custom-agent";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import {
  AIChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from "langchain/schema";

type Data = {
  name: string;
};

interface RequestBody {
  philosophers: string[];
  topic?: string;
  prompt?: string;
  chatHistory: string[]; // Replace 'any' with the appropriate type for chatHistory elements
  lastMessage: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { philosophers, topic, prompt, chatHistory }: RequestBody = req.body;
  console.log("inside agent 1 api");

  let init = false;
  if (!philosophers) {
    res.status(400).json({ error: "Invalid philosophers" });
    return;
  }

  if (!chatHistory) {
    res.status(400).json({ error: "Invalid chat history" });
    return;
  }
  console.log("inside server");
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });
  let connectionOpen = true;

  req.on("close", () => {
    connectionOpen = false;
  });
  console.log("chat history length: ", chatHistory);
  if (chatHistory.length === 3) {
    init = true;
  }

  const [philosopher1, philosopher2] = philosophers as string[];
  topic = topic as string;
  prompt = prompt as string;

  const agent1MsgHistory =
    chatHistory.length > 0
      ? chatHistory.map((msg, index) => {
          if (index == 0) new SystemChatMessage(msg);
          if (index % 2 === 0) {
            return new AIChatMessage(msg);
          } else {
            return new HumanChatMessage(msg);
          }
        })
      : [];
  console.log(philosopher1, philosopher2);
  const agent = await createAgent(philosopher1, philosopher2);

  if (!agent) {
    throw new Error("Could not create agent 1");
  }

  agent.memory = new BufferMemory({
    returnMessages: true,
    chatHistory: new ChatMessageHistory(agent1MsgHistory),
  });

  const sendData = (data: string) => {
    if (connectionOpen) {
      console.log(`sending data ${data}`);
      res.write(`data: ${data}\n\n`);
    }
  };

  try {
    let q: string = "";
    if (init) {
      q = `The moderator gave you a general topic: ${topic}. And the specfic question is: ${prompt}. Begin Debate: `;
    } else {
      q = chatHistory[chatHistory.length - 1];
    }
    sendData("[START]");
    const response = await agent.call({ input: q });
    console.log(
      `res in json ${JSON.stringify({
        fullMessage: response.output as string,
      })}`
    );
    sendData(JSON.stringify({ fullMessage: response.output as string }));
  } catch (error) {
    console.log(error);
    res.errored;
  } finally {
    sendData("[DONE]");
    res.end();
  }
}
