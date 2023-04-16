import React from "react";
import MainPhilosopherPage from "../components/MainPhilosopherPage";

const HomePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-center text-2xl py-4">Timeless Debates</h1>
      <MainPhilosopherPage />
    </div>
  );
};

export default HomePage;
