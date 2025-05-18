// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabase-client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Błąd logowania: " + error.message);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto" }}>
      <h2>Zaloguj się</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />
        <button type="submit">Zaloguj</button>
      </form>
    </div>
  );
}
