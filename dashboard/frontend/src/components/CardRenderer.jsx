import React, { useEffect, useState } from "react";

export default function CardRenderer({ card, value, apiKey, setValue }) {
  useEffect(() => {
    if (!card || card.type !== "kpi" || !apiKey) return;

    fetch(`/api/config/agg?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card)
    })
      .then(r => r.json())
      .then(res => {
        if (res && typeof res.value !== 'undefined') {
          setValue(v => ({ ...v, [card.id]: res.value }));
        }
      });
  }, [card, apiKey, setValue]);

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
        <div className="text-gray-500 italic">
          Unsupported card type: {card.type}
        </div>
      )}
    </div>
  );
}
