import React from "react";

function Step({ num, title, desc }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">{num}</div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-gray-600">{desc}</p>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Step num={1} title="Start a session" desc="Create a new chat or pick a template." />
      <Step num={2} title="Iterate quickly" desc="Refine prompts, save versions." />
      <Step num={3} title="Export results" desc="Copy, save or share outputs safely." />
    </div>
  );
}

export default HowItWorks;
