// import { createAgent } from "@/utils/create-agent";
import { createAgent } from "@/utils/create-custom-agent";

(async function main() {
  const philosopher = "plato";
  const otherPhilosopher = "epictetus";
  console.log("Creating agent...");
  const agent1 = await createAgent(philosopher, otherPhilosopher);
  if (!agent1) {
    throw new Error("Could not create agent");
  }
  console.log("Agent created");

  // const _input = "What do you think about Bitcoin?";
  const _input = "What is the government's role in society?";

  await agent1.call({ input: _input });

  //   console.log(`Question for ${philosopher}: ${_input} `);

  //   console.log(`Answer: ${ans}`);
  console.log("done");
})();
