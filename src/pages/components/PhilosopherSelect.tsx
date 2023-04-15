import React, { useState } from "react";
import { Philosopher as PhilosopherData } from "@/types";
import PhilosopherGrid from "./PhilosopherGrid";
import SelectedPhilosophers from "./SelectedPhilosophers";

const PhilosopherSelect: React.FC = () => {
  const [selectedPhilosophers, setSelectedPhilosophers] = useState<
    PhilosopherData[]
  >([]);
  const [hoveredPhilosopher, setHoveredPhilosopher] =
    useState<PhilosopherData | null>(null);

  const handlePhilosopherClick = (philosopher: PhilosopherData) => {
    if (selectedPhilosophers.some((p) => p.id === philosopher.id)) {
      setSelectedPhilosophers(
        selectedPhilosophers.filter((p) => p.id !== philosopher.id)
      );
    } else if (selectedPhilosophers.length < 2) {
      setSelectedPhilosophers([...selectedPhilosophers, philosopher]);
    }
  };

  const handlePhilosopherHover = (philosopher: PhilosopherData) => {
    if (selectedPhilosophers.length < 2) {
      setHoveredPhilosopher(philosopher);
    }
  };

  return (
    <div className="mx-auto max-w-fit container">
      <SelectedPhilosophers
        selected={
          selectedPhilosophers.length == 2
            ? [...selectedPhilosophers].filter(Boolean)
            : [...selectedPhilosophers, hoveredPhilosopher!].filter(Boolean)
        }
      />
      <PhilosopherGrid
        selectedPhilosophers={selectedPhilosophers}
        onPhilosopherClick={handlePhilosopherClick}
        onPhilosopherHover={handlePhilosopherHover}
      />
      <div className="flex justify-center p-4 space-x-4">
        <button
          type="button"
          className="rounded-md bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
        >
          Start Debate
        </button>
      </div>
    </div>
  );
};

export default PhilosopherSelect;
