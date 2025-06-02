// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabase-client";
import styles from "../styles/login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log("[Auth] Session after OAuth callback:", data.session);
      if (error) console.error("[Auth] Session fetch error:", error);
    };

    checkSession();
  }, []);

  // Obsługa logowania przez email i hasło
  const handleLogin = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Login error: " + error.message);
    } else {
      navigate("/dashboard");
    }
  };

  // Logowanie przez OAuth (Google)
  const handleOAuthLogin = async (provider) => {
    console.log(`[OAuth] Starting login with provider: ${provider}`);

    const { data, error, url } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      console.error(
        `[OAuth] Error during login with ${provider}:`,
        error.message
      );
      alert(`OAuth login error with ${provider}: ${error.message}`);
    } else {
      console.log("[OAuth] Login request sent successfully.");
      console.log("[OAuth] Redirect URL:", url);
      console.log("[OAuth] Response data:", data);
      // Supabase will redirect automatically — no need to navigate manually here
    }
  };

  // Obsługa sesji po powrocie z Google
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/dashboard");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className={styles.loginBackground}>
      <div className={styles.loginContainer}>
        <h2 className={styles.title}>Sign In</h2>
        <form className={styles.form} onSubmit={handleLogin}>
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
            Sign In
          </button>
        </form>

        <div className={styles.divider}>or</div>

        <button
          className={styles.oauthButton}
          onClick={() => handleOAuthLogin("google")}
        >
          Sign in with Google
        </button>

        <div className={styles.linkText}>
          Don't have an account? <a href="/signup">Sign up</a>
        </div>
      </div>
    </div>
  );
}
