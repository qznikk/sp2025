import { useState, useEffect } from "react";
import supabase from "./supabase-client";

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
    else alert("Zarejestrowano! Teraz możesz się zalogować.");
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert("Błąd logowania: " + error.message);
  };

  const handleUpload = async () => {
    if (!file) return alert("Wybierz plik!");

    const userResp = await supabase.auth.getUser();
    const user = userResp.data.user;

    console.log("SUPABASE USER:", user);

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

    // sprawdzamy dane przed INSERT
    const insertData = {
      user_id: user.id,
      file_path: filePath,
      title: file.name,
    };

    console.log("INSERT DATA:", insertData);

    const { error: dbError } = await supabase
      .from("photos")
      .insert([insertData]);

    if (dbError) {
      console.error("DB insert error:", dbError);
      return alert("DB insert error: " + dbError.message);
    }

    alert("Zdjęcie przesłane i zapisane!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Witaj!</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Wyślij zdjęcie</button>
    </div>
  );
}

export default App;
