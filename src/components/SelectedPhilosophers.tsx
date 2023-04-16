import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import { Philosopher as PhilosopherData } from "@/types";

interface SelectedPhilosophersProps {
  selected: PhilosopherData[];
}

const SelectedPhilosophers: React.FC<SelectedPhilosophersProps> = ({
  selected,
}) => {
  console.log(selected);
  return (
    <div className="flex justify-center p-4 space-x-4">
      {selected.map((philosopher, index) => {
        // if (index >= 2) return null;
        return (
          <motion.div
            key={index}
            className="flex flex-col-reverse items-center text-end w-48 h-48 p-2 bg-gray-100 rounded-lg relative z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: index < 2 ? 1 : 0.3 }}
          >
            {/* I want this Image to change depending which philosopher is selected  */}
            <Image
              src={`/philosophers/images/${philosopher.image}`}
              alt={philosopher.name}
              fill={true}
              className="inset-0 object-cover rounded-lg"
            />
            <div className="absolute inset-x-0 bottom-0 h-6 bg-white bg-opacity-10 backdrop-blur-md rounded-b-lg">
              <span className="flex justify-center text-base z-10 text-center">
                {philosopher.name}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SelectedPhilosophers;
