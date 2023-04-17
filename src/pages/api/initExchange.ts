import type { NextApiRequest, NextApiResponse } from "next";

import { createAgent } from "@/utils/create-custom-agent";
import { AgentExecutor } from "langchain/agents";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { AIChatMessage, HumanChatMessage } from "langchain/schema";
import { initializeAgentExecutor } from "langchain/agents";
type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { philosophers, topic, prompt, chatHistory } = req.query;
  let init = false;
  if (!philosophers) {
    res.status(400).json({ error: "Invalid philosophers" });
    return;
  }
  if (!topic) {
    res.status(400).json({ error: "Invalid topic" });
    return;
  }
  if (!prompt) {
    res.status(400).json({ error: "Invalid prompt" });
    return;
  }

  if (!chatHistory) {
    res.status(400).json({ error: "Invalid chat history" });
    return;
  }

  if (chatHistory.length === 0) {
    init = true;
    chatHistory = [] as [];
  }

  const [philosopher1, philosopher2] = philosophers as string[];
  topic = topic as string;
  prompt = prompt as string;
  chatHistory = chatHistory as string[];

  const agent1MsgHistory =
    chatHistory.length > 0
      ? chatHistory.map((msg, index) => {
          if (index % 2 === 0) {
            return new AIChatMessage(msg);
          } else {
            return new HumanChatMessage(msg);
          }
        })
      : [];

  const agent2MsgHistory =
    chatHistory.length > 0
      ? chatHistory.map((msg, index) => {
          if (index % 2 !== 0) {
            return new AIChatMessage(msg);
          } else {
            return new HumanChatMessage(msg);
          }
        })
      : [];

  const agent1 = await createAgent(philosopher1, philosopher2);
  const agent2 = await createAgent(philosopher2, philosopher1);

  if (!agent1 || !agent2) {
    throw new Error("Could not create agents");
  }

  agent1.memory = new BufferMemory({
    returnMessages: true,
    chatHistory: new ChatMessageHistory(agent1MsgHistory),
  });

  agent2.memory = new BufferMemory({
    returnMessages: true,
    chatHistory: new ChatMessageHistory(agent2MsgHistory),
  });

  res.write("SENDING AGENTS");
  // return { agent1, agent2 };
}
