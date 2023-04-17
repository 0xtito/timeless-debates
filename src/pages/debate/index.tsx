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
      image: "adam-smith-Enhanced.jpg",
    },
    message: "Hello, I am Adam Smith.",
  },
  {
    philosopher: {
      id: 2,
      name: "Epictetus",
      serverName: "epictetus",
      image: "epictetus-Enhanced.jpg",
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
  const [messages, setMessages] = useState<PhilosopherMessage[]>([
    {
      philosopher: philosophers[0],
      message: `Hello, I am ${philosophers[0].name}.`,
    },
    {
      philosopher: philosophers[1],
      message: `Hello, I am ${philosophers[1].name}.`,
    },
  ]);
  const [continueExchange, setContinueExchange] = useState<boolean>(true);
  const [initExchange, setInitExchange] = useState<boolean>(false);
  const [recentMessage, setRecentMessage] = useState<string>("");
  const [responseDone, setResponseDone] = useState<boolean>(false);
  const [next, setNext] = useState<string>("agentOne");
  const [debateTopic, setDebateTopic] = useState<string>("");

  const prompt = useRef<string>("");
  const topic = useRef<string>("");

  const handleInitExchange = async () => {
    const control = new AbortController();
    try {
      await fetchEventSource(`/api/${next}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          philosophers: philosophers.map((p) => p.serverName),
          topic: topic.current,
          prompt: prompt.current,
          chatHistory: [debateTopic, ...messages.map((m) => m.message)],
        }),
        signal: control.signal,
        openWhenHidden: true,
        onmessage: (event) => {
          if (topic.current !== "") topic.current = "";
          if (prompt.current !== "") prompt.current = "";
          if (event.data === "[DONE]") {
            console.log("DONE");
            next === "agentOne" ? setNext("agentTwo") : setNext("agentOne");
            setResponseDone(true);
          } else if (event.data === "[START]") {
            console.log("START");
            setMessages((prev) => [
              ...prev,
              {
                philosopher: philosophers[0],
                message: "",
              },
            ]);
          } else {
            const data: { data?: string; fullMessage?: string } = JSON.parse(
              event.data
            );
            console.log("Message received");
            console.log(data.fullMessage);
            if (typeof data.fullMessage === "string") {
              setMessages((prev) => {
                prev[prev.length - 1].message = data.fullMessage ?? "";
                console.log(data.fullMessage);
                console.log(prev[prev.length - 1]);
                return [...prev];
              });
            }
          }
        },
        onerror: () => {
          // setLoading(false);
          console.log("Error from onerror - aborting");
          control.abort();
        },
      });
    } catch (error) {
      console.error(`Error handling init exchange: ${error}`);
    }
  };

  const handleContinueConvo = async () => {
    const control = new AbortController();
    try {
      await fetchEventSource(`/api/${next}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          philosophers: philosophers.map((p) => p.serverName),
          chatHistory: [debateTopic, ...messages.map((m) => m.message)],
        }),
        signal: control.signal,
        openWhenHidden: true,
        onmessage: (event) => {
          if (event.data === "[DONE]") {
            console.log("DONE");
            next === "agentOne" ? setNext("agentTwo") : setNext("agentOne");
            setResponseDone(true);
          } else if (event.data === "[START]") {
            console.log("START");
            setMessages((prev) => [
              ...prev,
              {
                philosopher:
                  next === "agentOne" ? philosophers[0] : philosophers[1],
                message: "",
              },
            ]);
          } else {
            const data: { data?: string; fullMessage?: string } = JSON.parse(
              event.data
            );
            console.log("Message received");
            console.log(data.fullMessage);
            if (typeof data.fullMessage === "string") {
              setMessages((prev) => {
                prev[prev.length - 1].message = data.fullMessage ?? "";
                console.log(data.fullMessage);
                console.log(prev[prev.length - 1]);
                return [...prev];
              });
            }
          }
        },
        onerror: () => {
          // setLoading(false);
          console.log("Error from onerror - aborting");
          control.abort();
        },
      });
    } catch (error) {
      console.error(`Error handling continue convo: ${error}`);
    }
  };

  const onPromptSubmit = (_topic: string, _prompt: string) => {
    console.log("Prompt submitted");
    console.log(`Topic: ${_topic}`);
    topic.current = _topic;
    console.log(`Prompt: ${_prompt}`);
    setDebateTopic(`The main question of our debate is: ${_prompt}`);
    prompt.current = _prompt;
    setInitExchange(true);
  };

  useEffect(() => {
    if (redirect) {
      router.push(redirect.destination);
    }
  }, [router]);

  useEffect(() => {
    if (initExchange) {
      handleInitExchange();
    }
  }, [initExchange]);

  useEffect(() => {
    if (responseDone) {
      handleContinueConvo();
      setResponseDone(false);
    }
  }, [next]);

  // useEffect(() => {
  //   if (streamDone) {
  //     console.log("Stream done");
  //     console.log("Starting agent two");
  //     const control = new AbortController();
  //     try {
  //       fetchEventSource("/api/agentTwo", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           philosophers: philosophers.map((p) => p.serverName),
  //           topic: topic.current,
  //           prompt: prompt.current,
  //           chatHistory: [],
  //           lastMessage: "",
  //         }),
  //         signal: control.signal,
  //         openWhenHidden: true,
  //         onmessage: (event) => {
  //           if (topic.current !== "") topic.current = "";
  //           if (prompt.current !== "") prompt.current = "";
  //           if (event.data === "[DONE]") {
  //             console.log("DONE");
  //             setMessages((prev) => {
  //               prev[prev.length - 1].message = recentMessage ?? "";
  //               return [...prev];
  //             });
  //             setStreamDone(true);
  //           } else if (event.data === "[START]") {
  //             console.log("START");
  //             setMessages((prev) => [
  //               ...prev,
  //               {
  //                 philosopher: philosophers[1],
  //                 message: "",
  //               },
  //             ]);
  //           } else {
  //             const data: { data?: string; fullMessage?: string } = JSON.parse(
  //               event.data
  //             );
  //             console.log("Message received");
  //             console.log(data.fullMessage);
  //             if (typeof data.fullMessage === "string") {
  //               // setRecentMessage(data.fullMessage);
  //               // setMessages((prev) => {
  //               //   const _prev = [...prev];

  //               //   _prev[_prev.length - 1].message = data.fullMessage as string;
  //               //   return _prev;
  //               // });
  //               // set the message of the last message in the array to the full message
  //               setMessages((prev) => {
  //                 prev[prev.length - 1].message = data.fullMessage ?? "";
  //                 console.log(data.fullMessage);
  //                 console.log(prev[prev.length - 1]);
  //                 return [
  //                   ...prev.slice(0, prev.length - 1),
  //                   {
  //                     philosopher: philosophers[1],
  //                     message: data.fullMessage ?? "",
  //                   },
  //                 ];
  //               });
  //               setStreamDone(true);
  //             }
  //             // else {
  //             //   //   setRecentMessage(data.data ?? "");

  //             //   setMessages((prev) => {
  //             //     prev[prev.length - 1].message = data.fullMessage ?? "";
  //             //     return [...prev];
  //             //   });
  //             // }
  //           }
  //         },
  //         onerror: () => {
  //           // setLoading(false);
  //           console.log("Error from onerror - aborting");
  //           control.abort();
  //         },
  //       });
  //     } catch (error) {
  //       console.error(`Error handling init exchange: ${error}`);
  //     }
  //   }
  // }, [streamDone]);

  // just for testing
  // useEffect(() => {
  //   console.clear();
  //   console.log(`\n--- Debate Page ---\n`);
  //   console.log(philosophers);
  // }, []);

  return (
    <Fragment>
      <ChatInterface
        messages={messages}
        continueExchange={continueExchange}
        setContinueExchange={setContinueExchange}
        onPromptSubmit={onPromptSubmit}
        recentMessage={recentMessage}
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
  if (typeof p1 !== "string" && typeof p2 !== "string") {
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

  const philosopher1 = philosophersContent.find((p) => {
    return p.serverName === p1;
  });

  const philosopher2 = philosophersContent.find((p) => {
    return p.serverName === p2;
  });

  return {
    props: {
      philosophers: [philosopher1!, philosopher2!],
    },
  };
};

export default DebatePage;
