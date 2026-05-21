import React from "react";

function FeatureCard({ title, desc }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md border">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}

export default FeatureCard;
