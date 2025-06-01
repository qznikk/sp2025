/*import { useState, useEffect } from "react";
import supabase from "./lib/supabase-client";

function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert("Błąd rejestracji: " + error.message);
    else alert("Zarejestrowano! Sprawdź maila lub zaloguj się.");
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert("Błąd logowania: " + error.message);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const handleUpload = async () => {
    if (!file) return alert("Wybierz plik!");

    const userResp = await supabase.auth.getUser();
    const user = userResp.data.user;

    if (!user) {
      alert("Brak zalogowanego użytkownika");
      return;
    }

    const filePath = `${user.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return alert("Upload error: " + uploadError.message);
    }

    const insertData = {
      user_id: user.id,
      file_path: filePath,
      title: file.name,
    };

    const { error: dbError } = await supabase
      .from("photos")
      .insert([insertData]);

    if (dbError) {
      console.error("DB insert error:", dbError);
      return alert("DB insert error: " + dbError.message);
    }

    alert("Zdjęcie przesłane i zapisane!");
  };

  if (!session) {
    return (
      <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
        <h2>Logowanie / Rejestracja</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <div>
          <button onClick={handleSignIn} style={{ marginRight: "10px" }}>
            Zaloguj się
          </button>
          <button onClick={handleSignUp}>Zarejestruj się</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Witaj w galerii!</h2>
      <p>
        Zalogowany jako: <strong>{session.user.email}</strong>
      </p>
      <button onClick={handleSignOut} style={{ marginBottom: "20px" }}>
        Wyloguj
      </button>
      <div>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload}>Wyślij zdjęcie</button>
      </div>
    </div>
  );
}

export default App;
*/
