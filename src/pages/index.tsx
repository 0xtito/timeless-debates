import React from "react";
import PhilosopherSelect from "./components/PhilosopherSelect";

const HomePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-center text-2xl py-4">Timeless Debates</h1>
      <PhilosopherSelect />
    </div>
  );
};

export default HomePage;
