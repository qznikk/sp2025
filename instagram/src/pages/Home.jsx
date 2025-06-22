// src/pages/Home.jsx
import styles from "../styles/home.module.css";

export default function Home() {
  return (
    <div className={styles.homeBackground}>
      <div className={styles.heroContent}>
        <h1 className={styles.mainHeading}>Welcome to MyPhoto app</h1>
        <p className={styles.subHeading}>The worse instagram</p>
      </div>
    </div>
  );
}
