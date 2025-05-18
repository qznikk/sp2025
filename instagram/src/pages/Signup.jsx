// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabase-client";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert("Błąd rejestracji: " + error.message);
    } else {
      alert("Zarejestrowano! Sprawdź e-mail lub zaloguj się.");
      navigate("/login");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto" }}>
      <h2>Załóż konto</h2>
      <form onSubmit={handleSignup}>
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
        <button type="submit">Zarejestruj się</button>
      </form>
    </div>
  );
}
