// components/ChatInterface.tsx

import React, { Fragment, useState } from "react";
import { Philosopher as PhilosopherData } from "@/types";
import TopicPrompt from "./TopicPrompt";

interface ChatMessage {
  philosopher: PhilosopherData;
  message: string;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  continueExchange: boolean;
  setContinueExchange: React.Dispatch<React.SetStateAction<boolean>>;
  onPromptSubmit: (topic: string, prompt: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  continueExchange,
  setContinueExchange,
  onPromptSubmit,
}) => {
  const [startExchange, setStartExchange] = useState<boolean>(false);

  return (
    <div className="relative w-1/2 h-screen mx-auto bg-gray-900 rounded-lg p-4">
      {!startExchange ? (
        <TopicPrompt
          onPromptSubmit={onPromptSubmit}
          setStartExchange={setStartExchange}
        />
      ) : (
        <Fragment>
          <div className="h-full overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  index % 2 === 0 ? "justify-start" : "justify-end"
                } mb-4`}
              >
                {index % 2 === 0 ? (
                  <Fragment>
                    <img
                      src={msg.philosopher.image}
                      alt={msg.philosopher.name}
                      className="w-10 h-10 rounded-full mr-2 self-end"
                    />
                    <div
                      className={`relative flex flex-col ${
                        index % 2 === 0 ? "items-start" : "items-end"
                      }`}
                    >
                      <span className="text-xs text-gray-300 mb-1">
                        {msg.philosopher.name}
                      </span>
                      <div
                        className={`bg-gray-700 rounded-lg p-2 rounded-bl-none`}
                      >
                        <p className="text-white">{msg.message}</p>
                      </div>
                    </div>
                  </Fragment>
                ) : (
                  <Fragment>
                    <div
                      className={`relative flex flex-col ${
                        index % 2 === 0 ? "items-start" : "items-end"
                      }`}
                    >
                      <span className="text-xs text-gray-300 mb-1">
                        {msg.philosopher.name}
                      </span>
                      <div
                        className={`bg-gray-700 rounded-lg p-2 rounded-br-none`}
                      >
                        <p className="text-white">{msg.message}</p>
                      </div>
                    </div>
                    <img
                      src={msg.philosopher.image}
                      alt={msg.philosopher.name}
                      className="w-10 h-10 rounded-full ml-2 self-end"
                    />
                  </Fragment>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 rounded-md bg-white/10 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
            onClick={() => {
              console.log("Button clicked");
            }}
          >
            Continue?
          </button>
        </Fragment>
      )}
    </div>
  );
};

export default ChatInterface;
