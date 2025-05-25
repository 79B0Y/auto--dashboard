import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const [key, setKey] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem("API_KEY", key.trim());
    navigate("/dashboard");
  };

  return (
    <div className="p-8 flex flex-col items-center gap-4">
      <h1 className="text-2xl">Dashboard Login</h1>
      <input
        className="border p-2 w-80"
        placeholder="Enter API Key"
        value={key}
        onChange={e => setKey(e.target.value)}
      />
      <button className="bg-blue-500 text-white px-4 py-2" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}
