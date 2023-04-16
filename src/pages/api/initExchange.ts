import type { NextApiRequest, NextApiResponse } from "next";

import { createAgent } from "@/utils/create-custom-agent";
import { AgentExecutor } from "langchain/agents";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { philosophers, topic, prompt } = req.query;

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

  const [philosopher1, philosopher2] = philosophers as string[];
  topic = topic as string;
  prompt = prompt as string;

  const agent1 = await createAgent(philosopher1, philosopher2);
  const agent2 = await createAgent(philosopher2, philosopher1);

  if (!agent1 || !agent2) {
    throw new Error("Could not create agents");
  }
  res.write("SENDING AGENTS");
  // return { agent1, agent2 };
}
