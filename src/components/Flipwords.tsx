import React from "react";
import { FlipWords } from "./flip-words";

export default function FlipWordsDemo() {
  const words = ["better", "cute", "beautiful", "modern"];

  return (
    (<div className="h-[40rem] flex justify-center items-center px-4">
      <div
        className="text-6xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
        Build this 
        <FlipWords words={words} /> <br />
        websites with this team
      </div>
    </div>)
  );
}
