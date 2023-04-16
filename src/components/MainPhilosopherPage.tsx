import React, { useState } from "react";
import { Transition } from "@headlessui/react";
import Link from "next/link";

import { Philosopher as PhilosopherData } from "@/types";
import PhilosopherGrid from "./PhilosopherGrid";
import SelectedPhilosophers from "./SelectedPhilosophers";

const MainPhilosopherPage: React.FC = () => {
  const [selectedPhilosophers, setSelectedPhilosophers] = useState<
    PhilosopherData[]
  >([]);
  const [hoveredPhilosopher, setHoveredPhilosopher] =
    useState<PhilosopherData | null>(null);

  const areTwoPhilosophersSelected = () => selectedPhilosophers.length === 2;

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
        {/* <button
          type="button"
          className="rounded-md bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
        >
          Start Debate
        </button> */}
        <Transition
          show={areTwoPhilosophersSelected()}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Link
            href={{
              pathname: "/debate",
              query: {
                p1: selectedPhilosophers[0]?.serverName,
                p2: selectedPhilosophers[1]?.serverName,
              },
            }}
            as="/debate"
          >
            <button
              className={`${
                areTwoPhilosophersSelected()
                  ? "bg-amber-200 hover:bg-amber-300"
                  : "bg-amber-200"
              } text-white font-semibold text-xl py-3.5 px-7 border border-gray-400 rounded-md shadow ${
                areTwoPhilosophersSelected() ? "animate-glowing-border" : ""
              }`}
            >
              Debate
            </button>
          </Link>
        </Transition>
      </div>
    </div>
  );
};

export default MainPhilosopherPage;
