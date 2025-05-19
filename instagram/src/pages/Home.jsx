// src/pages/Home.jsx
import styles from "../styles/home.module.css";

export default function Home() {
  return (
    <div className={styles.homeBackground}>
      <div className={styles.heroContent}>
        <h1 className={styles.mainHeading}>Welcome to ?? app</h1>
        <p className={styles.subHeading}>jakis tam opis bla bla instagram</p>
      </div>
    </div>
  );
}
