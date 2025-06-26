import { useState, useEffect } from "react";
import supabase from "../lib/supabase-client";
import styles from "../styles/Dashboard.module.css";
// Import ikon, np. z react-icons. Upewnij się, że masz je zainstalowane: npm install react-icons
import { FaUserCircle, FaEnvelope, FaIdCard, FaCog, FaSignOutAlt, FaChartLine } from 'react-icons/fa';

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

    return () => {
      subscription?.unsubscribe();
    };
  }, []); // Usunięto 'session' z zależności, aby uniknąć pętli i odświeżać tylko raz

  useEffect(() => {
    if (session) {
      const fetchUserData = async () => {
        const { data: { user: fetchedUser }, error } = await supabase.auth.getUser(); // Zmieniono nazwę zmiennej, żeby uniknąć konfliktu
        if (error) {
          console.error("Błąd pobierania danych użytkownika:", error);
        } else {
          setUser(fetchedUser);
        }
      };
      fetchUserData();
    } else {
      setUser(null); // Resetuj użytkownika, jeśli sesja wygasła
    }
  }, [session]); // Zależność od 'session' tutaj jest OK

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Błąd wylogowania:", error);
    } else {
      setSession(null);
      setUser(null);
    }
  };

  if (!session) {
    return (
      <div className={styles.centeredMessage}>
        <h2 className={styles.messageTitle}>
          Musisz być zalogowany, aby zobaczyć panel!
        </h2>
        <p className={styles.messageText}>
          Przejdź do strony logowania, aby uzyskać dostęp.
        </p>
        {/* Możesz dodać przycisk do logowania */}
        <button className={styles.loginButton} onClick={() => window.location.href = '/login'}>
          Zaloguj się
        </button>
      </div>
    );
  }

  // Symulowane dane do wyświetlenia (możesz zastąpić je prawdziwymi danymi z bazy)
  const dashboardStats = {
    totalPosts: 12,
    totalLikes: 87,
    followers: 153,
    lastActivity: "2025-06-25 14:30",
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <div className={styles.userProfileSummary}>
          <FaUserCircle className={styles.avatar} /> {/* Awatar użytkownika */}
          <div>
            <h1 className={styles.welcomeTitle}>Witaj ponownie, {user?.email?.split('@')[0]}!</h1>
            <p className={styles.userGreeting}>Miło Cię widzieć w Twoim panelu zarządzania.</p>
          </div>
        </div>
        <div className={styles.headerActions}>
        </div>
      </header>

      <div className={styles.dashboardGrid}>
        {/* Sekcja Informacje o koncie */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><FaUserCircle className={styles.cardIcon} /> Informacje o koncie</h3>
          <p className={styles.cardText}>
            <FaEnvelope className={styles.infoIcon} /> Email: <strong>{user?.email}</strong>
          </p>
          <p className={styles.cardText}>
            <FaIdCard className={styles.infoIcon} /> ID użytkownika: <span className={styles.value}>{user?.id}</span>
          </p>
          <p className={styles.cardText}>
            <FaUserCircle className={styles.infoIcon} /> Rola: <span className={styles.value}>{user?.role || "Nie określono"}</span>
          </p>
          {user?.confirmed_at && (
            <p className={styles.cardText}>
              <i className="fas fa-check-circle"></i> Konto potwierdzone: <span className={styles.value}>{new Date(user.confirmed_at).toLocaleDateString()}</span>
            </p>
          )}
        </div>      
      </div>
    </div>
  );
}