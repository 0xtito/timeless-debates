import React from "react";
import Image from "next/image";
import { Philosopher as PhilosopherData } from "@/types";

interface PhilosopherProps {
  philosopher: PhilosopherData;
  onClick: () => void;
  onMouseEnter: () => void;
}

const Philosopher: React.FC<PhilosopherProps> = ({
  philosopher,
  onClick,
  onMouseEnter,
}) => {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className="flex flex-col relative items-center justify-center w-24 h-24 p-1 m-2 bg-gray-100 rounded-lg cursor-pointer transition-all duration-200 ease-in-out hover:bg-gray-200 hover:shadow-lg z-10"
    >
      <Image
        src={`/philosophers/images/${philosopher.image}`}
        alt={philosopher.name}
        fill={true}
        className="inset-0 object-cover rounded-lg"
      />
      <span className="mt-1 text-center text-sm z-10">{philosopher.name}</span>
    </div>
  );
};

export default Philosopher;
