import { useEffect, useState } from "react";
import CardRenderer from "../components/CardRenderer";

export default function Dashboard() {
  const [config, setConfig] = useState(null);
  const [values, setValues] = useState({});
  const apiKey = localStorage.getItem("API_KEY");
  window.API_KEY = apiKey;

  useEffect(() => {
    fetch(`/api/config?key=${apiKey}`)
      .then(r => r.json())
      .then(setConfig);

    const ws = new WebSocket(`ws://${location.host}/ws?key=${apiKey}`);
    ws.onmessage = msg => {
      const data = JSON.parse(msg.data);
      if (data.type === "configUpdated") {
        fetch(`/api/config?key=${apiKey}`)
          .then(r => r.json())
          .then(setConfig);
      }
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (!config?.cards) return;
    config.cards.forEach(card => {
      if (card.type === "kpi") {
        fetch(`/api/agg?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(card)
        })
          .then(r => r.json())
          .then(res => {
            setValues(v => ({ ...v, [card.id]: res.value }));
          });
      }
    });
  }, [config]);

  if (!config) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {config.layout?.flat().map(id => {
        const card = config.cards.find(c => c.id === id);
        if (!card) return null;
        return <CardRenderer key={id} card={card} value={values[id]} />;
      })}
    </div>
  );
}
