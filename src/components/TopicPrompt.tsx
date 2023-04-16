import React, { useState } from "react";

interface TopicPromptInterface {
  setStartExchange: React.Dispatch<React.SetStateAction<boolean>>;
  onPromptSubmit: (topic: string, prompt: string) => void;
}

const TopicPrompt: React.FC<TopicPromptInterface> = ({
  setStartExchange,
  onPromptSubmit,
}) => {
  const [topic, setTopic] = useState("");
  const [prompt, setPrompt] = useState("");

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white">Topic</h1>
        <input
          className="w-80 px-4 py-2 mt-4 text-base border-2 border-gray-900 rounded-md text-black focus:ring-1 focus:ring-inset focus:ring-gray-700"
          value={topic}
          placeholder="Bitcoin"
          onChange={(e) => {
            console.log(topic);
            setTopic(e.target.value);
          }}
        />
      </div>
      <div className="flex flex-col items-center justify-center mt-8">
        <h1 className="text-2xl font-bold text-white">Prompt</h1>
        <textarea
          className="w-80 px-4 py-2 mt-4 text-base border-2 border-gray-900 rounded-md text-black"
          placeholder="Do you think Bitcoin is good for society?"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>
      <button
        className="px-4 py-2 mt-8 rounded-md bg-white/10 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
        onClick={() => {
          setStartExchange(true);
          onPromptSubmit(topic, prompt);
        }}
      >
        Ask
      </button>
    </div>
  );
};

export default TopicPrompt;
