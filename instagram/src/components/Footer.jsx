import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <p className={styles.footerText}>
          © {new Date().getFullYear()} ???. Wszystkie prawa zastrzeżone.
        </p>
        <nav className={styles.footerNav}>
          <a href="/privacy" className={styles.footerLink}>
            Prywatność
          </a>
          <a href="/terms" className={styles.footerLink}>
            Regulamin
          </a>
          <a href="/kontakt" className={styles.footerLink}>
            Kontakt
          </a>
        </nav>
      </div>
    </footer>
  );
}
