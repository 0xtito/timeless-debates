import React, { Fragment, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps, Redirect } from "next";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { createAgent } from "@/utils/create-custom-agent";

import philosophersContent from "@/../public/philosophers/index.json";
import { Philosopher as PhilosopherData } from "@/types";
import ChatInterface from "@/components/ChatInterface";
import { AgentExecutor } from "langchain/agents";

const testMessages = [
  {
    philosopher: {
      id: 1,
      name: "Adam Smith",
      serverName: "adam-smith",
      image: "/philosophers/images/adam-smith-Enhanced.jpg",
    },
    message: "Hello, I am Adam Smith.",
  },
  {
    philosopher: {
      id: 2,
      name: "Epictetus",
      serverName: "epictetus",
      image: "/philosophers/images/epictetus-Enhanced.jpg",
    },
    message: "Hello, I am Epictetus.",
  },
];

interface DebatePageProps {
  philosophers: PhilosopherData[];
  redirect?: Redirect;
}

interface PhilosopherMessage {
  philosopher: PhilosopherData;
  message: string;
}

type Data = {
  selectedPhilosophers: PhilosopherData[];
};

const DebatePage: React.FC<DebatePageProps> = ({ philosophers, redirect }) => {
  const router = useRouter();
  const [messages, setmessages] = useState<PhilosopherMessage[]>(testMessages);
  const [continueExchange, setContinueExchange] = useState<boolean>(true);
  const [initExchange, setInitExchange] = useState<boolean>(false);
  const [agent1, setAgent1] = useState<AgentExecutor | null>(null);
  const [agent2, setAgent2] = useState<AgentExecutor | null>(null);

  const prompt = useRef<string>("");
  const topic = useRef<string>("");

  const onPromptSubmit = (_topic: string, _prompt: string) => {
    console.log("Prompt submitted");
    console.log(`Topic: ${_topic}`);
    topic.current = _topic;
    console.log(`Prompt: ${_prompt}`);
    prompt.current = _prompt;
    setInitExchange(true);
  };

  useEffect(() => {
    if (redirect) {
      router.push(redirect.destination);
    }
  }, [router]);

  useEffect(() => {
    if (!initExchange) return;

    console.log("--- Initiating exchange ---");
    console.log(`Topic: ${topic.current}`);
    console.log(`Prompt: ${prompt.current}`);

    const control = new AbortController();

    const handleInitExchange = async () => {
      const response = await fetch("/api/initExchange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          philosophers: philosophers.map((p) => p.serverName),
          topic: topic.current,
          prompt: prompt.current,
        }),
      });

      //   try {
      //     await fetchEventSource("/api/initExchange", {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       body: JSON.stringify({
      //         philosophers: philosophers.map((p) => p.serverName),
      //         topic: topic.current,
      //         prompt: prompt.current,
      //       }),
      //       signal: control.signal,
      //       openWhenHidden: true,
      //       onmessage: (event) => {
      //         console.log(event.data);
      //       },
      //       onerror: () => {
      //         // setLoading(false);
      //         console.log("Error from onerror - aborting");
      //         control.abort();
      //       },
      //     });
      //   } catch (error) {
      //     console.error(`Error handling init exchange: ${error}`);
      //   }
    };
  }, [initExchange]);

  // just for testing
  useEffect(() => {
    console.clear();
    console.log(`\n--- Debate Page ---\n`);
    console.log(philosophers);

    // const getAgents = async () => {
    //   const agents = await Promise.all([
    //     createAgent(philosophers[0].serverName, philosophers[1].serverName),
    //     createAgent(philosophers[1].serverName, philosophers[0].serverName),
    //   ]);
    //   if (!agents[0] || !agents[1]) {
    //     console.error("Error creating agents");
    //     return;
    //   }
    //   console.log("Agents created");
    //   console.log(agents);

    //   setAgent1(agents[0]);
    //   setAgent2(agents[1]);
    // };

    // getAgents();
  }, []);

  return (
    <Fragment>
      <ChatInterface
        messages={messages}
        continueExchange={continueExchange}
        setContinueExchange={setContinueExchange}
        onPromptSubmit={onPromptSubmit}
      />
    </Fragment>
  );
};

export const getServerSideProps: GetServerSideProps<{
  philosophers: PhilosopherData[];
  Redirect?: Redirect;
}> = async (context) => {
  console.log(`\n--- Debate Page ---\n`);
  const { p1, p2 } = context.query;
  console.log(p1, p2);
  if (!p1 || !p2) {
    return {
      props: {
        philosophers: [],
        redirect: {
          destination: "/",
          permanent: false,
        },
      },
    };
  }
  const philosophers = [p1, p2] as string[];

  const selectedPhilosophers = philosophersContent.filter((p) => {
    console.log(p.serverName, philosophers);
    return philosophers.includes(p.serverName);
  });

  return {
    props: {
      philosophers: selectedPhilosophers,
    },
  };
};

export default DebatePage;
