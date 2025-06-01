import { useState, useEffect } from "react";
import supabase from "../lib/supabase-client";
import styles from "../styles/Dashboard.module.css"; 

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    if (session) {
      const fetchUserData = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Błąd pobierania danych użytkownika:", error);
        } else {
          setUser(user);
        }
      };
      fetchUserData();
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, [session]);

  if (!session) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>
          Musisz być zalogowany, aby zobaczyć panel!
        </h2>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Witaj</h2>
      <div className={styles.infoBox}>
        <p className={styles.infoText}>
          Zalogowany jako: <strong>{user?.email}</strong>
        </p>
        <p className={styles.subText}>
          Twoje ID użytkownika: <span className={styles.value}>{user?.id}</span>
        </p>
        <p className={styles.subText}>
          Rola: <span className={styles.value}>{user?.role || "Nie określono"}</span>
        </p>
      </div>
    </div>
  );
}
