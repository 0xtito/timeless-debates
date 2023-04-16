import { AgentActionOutputParser } from "langchain/agents";
import {
  BasePromptTemplate,
  SerializedBasePromptTemplate,
  renderTemplate,
  BaseChatPromptTemplate,
} from "langchain/prompts";
import {
  InputValues,
  PartialValues,
  AgentStep,
  AgentAction,
  AgentFinish,
  BaseChatMessage,
  HumanChatMessage,
} from "langchain/schema";
import { Tool } from "langchain/tools";

import { authorPrefixPrompts, SUFFIX, formatInstructions } from "../constants";

export class PhilosopherPromptTemplate extends BaseChatPromptTemplate {
  tools: Tool[];
  private prefix: string;

  /**
   *
   * @param args tools - the tools that the agent will use to search through the vector stores
   * @param args inputVariables - the variables that the agent will use to search through the vector stores
   * @param args agentName - the name of the philosopher who the agent will be imitating (e.g. plato, karl_marx)
   * @param args otherAgentName - the name of the philosopher who the agent will be debating with (e.g. plato, karl_marx)
   */
  constructor(args: {
    tools: Tool[];
    inputVariables: string[];
    agentName: string;
    otherAgentName: string;
  }) {
    super({ inputVariables: args.inputVariables });
    this.tools = args.tools;

    const authorAndPrompt = Object.entries(authorPrefixPrompts).find(
      ([author, prompt]) => author === args.agentName
    );

    if (!authorAndPrompt) throw new Error("No author and prompt found");

    const [authorName, prompt] = authorAndPrompt;

    const authorFullName = args.otherAgentName.includes("_")
      ? args.otherAgentName
          .split("_")
          .map((word) => word[0].toUpperCase() + word.slice(1))
          .join(" ")
      : args.otherAgentName;

    this.prefix = prompt.replace("{{opp_name}}", authorFullName);
  }

  _getPromptType(): string {
    throw new Error("Not implemented");
  }

  // From LangChain
  async formatMessages(values: InputValues): Promise<BaseChatMessage[]> {
    /** Construct the final template */
    const toolStrings = this.tools
      .map((tool) => `${tool.name}: ${tool.description}`)
      .join("\n");
    const toolNames = this.tools.map((tool) => tool.name).join("\n");
    const instructions = formatInstructions(toolNames);

    const template = [this.prefix, toolStrings, instructions, SUFFIX].join(
      "\n\n"
    );
    /** Construct the agent_scratchpad */
    const intermediateSteps = values.intermediate_steps as AgentStep[];
    const agentScratchpad = intermediateSteps.reduce(
      (thoughts, { action, observation }) =>
        thoughts +
        [action.log, `\nObservation: ${observation}`, "Thought:"].join("\n"),
      ""
    );
    const newInput = { agent_scratchpad: agentScratchpad, ...values };
    /** Format the template. */
    const formatted = renderTemplate(template, "f-string", newInput);
    return [new HumanChatMessage(formatted)];
  }

  partial(_values: PartialValues): Promise<BasePromptTemplate> {
    throw new Error("Not implemented");
  }

  serialize(): SerializedBasePromptTemplate {
    throw new Error("Not implemented");
  }
}

export class CustomOutputParser extends AgentActionOutputParser {
  async parse(text: string): Promise<AgentAction | AgentFinish> {
    if (text.includes("Final Answer:")) {
      const parts = text.split("Final Answer:");
      const input = parts[parts.length - 1].trim();
      console.log("during Final Answer parse - final answer: ", input);
      const finalAnswers = { output: input };
      return { log: text, returnValues: finalAnswers };
    }
    console.log("during parse - text: ", text);

    const match = /Action: (.*)\nAction Input: (.*)/s.exec(text);
    if (!match) {
      throw new Error(`Could not parse LLM output: ${text}`);
    }

    return {
      tool: match[1].trim(),
      toolInput: match[2].trim().replace(/^"+|"+$/g, ""),
      log: text,
    };
  }

  getFormatInstructions(): string {
    throw new Error("Not implemented");
  }
}
