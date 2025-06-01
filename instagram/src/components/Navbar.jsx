import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import supabase from "../lib/supabase-client";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    navigate("/");
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <Link to="/" className={styles.link}>
          Home
        </Link>
      </div>

      {user && (
        <div className={styles.center}>
          <Link to="/dashboard" className={styles.link}>
            Dashboard
          </Link>
          <Link to="/publicgallery" className={styles.link}>
            Public Gallery
          </Link>
          <Link to="/photos" className={styles.link}>
            My Photos
          </Link>
          <Link to="/upload" className={styles.link}>
            Upload
          </Link>
          <Link to="/map" className={styles.link}>
            Map
          </Link>
          <Link to="/albums" className={styles.link}>
            Albums
          </Link>
          <Link to="/folders" className={styles.link}>
            Folders
          </Link>
        </div>
      )}

      <div className={styles.right}>
        <div className={styles.desktopOnly}>
          {user ? (
            <>
              <Link to="/settings" className={styles.link}>
                Settings
              </Link>
              <button onClick={handleLogout} className={styles.buttonWhite}>
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className={styles.buttonBlack}
              >
                Sing in
              </button>
              <button
                onClick={() => navigate("/signup")}
                className={styles.buttonWhite}
              >
                Sing up
              </button>
            </>
          )}
        </div>

        <button className={styles.burger} onClick={toggleMenu}>
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className={styles.fullscreenMenu}>
          <button className={styles.closeButton} onClick={toggleMenu}>
            ✕
          </button>
          <div className={styles.menuContent}>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={toggleMenu}
                  className={styles.menuItem}
                >
                  Dashboard
                </Link>
                <Link
                  to="/photos"
                  onClick={toggleMenu}
                  className={styles.menuItem}
                >
                  My Photos
                </Link>
                <Link
                  to="/upload"
                  onClick={toggleMenu}
                  className={styles.menuItem}
                >
                  Upload
                </Link>
                <Link
                  to="/settings"
                  onClick={toggleMenu}
                  className={styles.menuItem}
                >
                  Settings
                </Link>
                <button onClick={handleLogout} className={styles.menuButton}>
                  Wyloguj
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate("/login");
                    toggleMenu();
                  }}
                  className={styles.buttonBlack}
                >
                  Zaloguj
                </button>
                <button
                  onClick={() => {
                    navigate("/signup");
                    toggleMenu();
                  }}
                  className={styles.buttonWhite}
                >
                  Zarejestruj
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
