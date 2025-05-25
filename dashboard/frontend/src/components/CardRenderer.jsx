import React from "react";

export default function CardRenderer({ card, value }) {
  return (
    <div className="p-4 border rounded shadow bg-white">
      <h2 className="font-bold text-lg mb-2">{card.title}</h2>
      {card.type === "kpi" && (
        <div className="text-2xl text-blue-600">{value ?? "--"}</div>
      )}
      {card.type === "html" && (
        <div dangerouslySetInnerHTML={{ __html: card.html }} />
      )}
      {!["kpi", "html"].includes(card.type) && (
        <div className="text-gray-500 italic">Unsupported card type: {card.type}</div>
      )}
    </div>
  );
}
