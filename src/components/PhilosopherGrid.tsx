import React from "react";
import philosophersContent from "@/../public/philosophers/index.json";
import { Philosopher as PhilosopherData } from "@/types";
import Philosopher from "./Philosopher";

interface PhilosopherGridProps {
  selectedPhilosophers: PhilosopherData[];
  onPhilosopherClick: (p: PhilosopherData) => void;
  onPhilosopherHover: (p: PhilosopherData) => void;
}

const PhilosopherGrid: React.FC<PhilosopherGridProps> = ({
  onPhilosopherClick,
  onPhilosopherHover,
  selectedPhilosophers,
}) => {
  return (
    <div className="grid grid-cols-5 gap-1 mx-0">
      {philosophersContent.map((philosopher: PhilosopherData) => (
        <Philosopher
          key={philosopher.id}
          philosopher={philosopher}
          onClick={() => onPhilosopherClick(philosopher)}
          onMouseEnter={() => {
            if (selectedPhilosophers.length < 2) {
              onPhilosopherHover(philosopher);
            }
          }}
        />
      ))}
    </div>
  );
};

export default PhilosopherGrid;
