import React from "react";
import { Cover } from "./Cover.tsx";

export default function CoverDemo() {
  return (
    <div>
      <h1
        className="text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white">
        Welcome to IIIT
        <br />
        <span className="mb-4 inline-block" /> {/* Added padding between lines */}
        <Cover>Tandoori Club</Cover>
      </h1>
    </div>
  );
}
