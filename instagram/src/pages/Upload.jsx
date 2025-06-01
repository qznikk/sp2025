import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import supabase from "../lib/supabase-client";
import styles from "../styles/upload.module.css";

const ALLOWED_FOLDERS = [
  "Wakacje", "Rodzina", "Przyjaciele", "Praca", "Szkoła",
  "Sport", "Sztuka", "Jedzenie", "Podróże", "Inne"
];

const ALLOWED_TAGS = [
  "morze", "góry", "miasto", "plaża", "zachód słońca",
  "rodzina", "zwierzęta", "sport", "kultura", "noc"
];

export default function Upload() {
  const [file, setFile] = useState(null);
  const [folder, setFolder] = useState(ALLOWED_FOLDERS[0]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [status, setStatus] = useState(null);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleUpload = async () => {
    setStatus(null);
    if (!file) return setStatus({ type: "error", message: "Wybierz plik!" });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return setStatus({ type: "error", message: "Musisz być zalogowany." });
    }

    const uuid = uuidv4();
    const filePath = `${user.id}/${uuid}_${file.name}`;
    const timestamp = new Date().toISOString();

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(filePath, file);

    if (uploadError) {
      return setStatus({ type: "error", message: "Błąd uploadu: " + uploadError.message });
    }

    const { data: photoData, error: photoError } = await supabase
      .from("photos")
      .insert([{
        user_id: user.id,
        file_path: filePath,
        title: file.name,
        created_at: timestamp,
      }])
      .select()
      .single();

    if (photoError) {
      return setStatus({ type: "error", message: "Błąd zapisu zdjęcia." });
    }

    const { error: infoError } = await supabase.from("photo_info").insert([{
      photo_id: photoData.id,
      tags: selectedTags.join(","),
      folder: folder,
      created_at: timestamp,
    }]);

    if (infoError) {
      return setStatus({ type: "error", message: "Błąd zapisu metadanych." });
    }

    setStatus({ type: "success", message: `Sukces! Plik przesłany.` });
    setFile(null);
    setFolder(ALLOWED_FOLDERS[0]);
    setSelectedTags([]);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dodaj plik</h1>

      <div className={styles.dropzone}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.length > 0) {
            setFile(e.dataTransfer.files[0]);
          }
        }}
      >
        {file ? (
          <p className={styles.fileName}>{file.name}</p>
        ) : (
          <p className={styles.filePlaceholder}>Przeciągnij plik tutaj</p>
        )}
      </div>

      <label className={styles.inputLabel}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className={styles.fileInput}
        />
      </label>

      <select value={folder} onChange={(e) => setFolder(e.target.value)} className={styles.textInput}>
        {ALLOWED_FOLDERS.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      <div className={styles.tagsContainer}>
        {ALLOWED_TAGS.map((tag) => (
          <label key={tag} className={styles.tagLabel}>
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onChange={() => toggleTag(tag)}
            />
            {tag}
          </label>
        ))}
      </div>

      <button onClick={handleUpload} className={styles.button}>Wyślij</button>

      {status && <div className={`${styles.status} ${styles[status.type]}`}>{status.message}</div>}
    </div>
  );
}
