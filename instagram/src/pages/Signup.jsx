// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabase-client";
import styles from "../styles/login.module.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert("Signup error: " + error.message);
    } else {
      alert("Registered successfully! Check your email or log in.");
      navigate("/login");
    }
  };

  return (
    <div className={styles.loginBackground}>
      <div className={styles.loginContainer}>
        <h2 className={styles.title}>Create Account</h2>
        <form className={styles.form} onSubmit={handleSignup}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            Sign Up
          </button>
        </form>
        <div className={styles.linkText}>
          Already have an account? <a href="/login">Log in</a>
        </div>
      </div>
    </div>
  );
}
