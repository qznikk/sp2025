import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import supabase from "../lib/supabase-client";
import styles from "../styles/upload.module.css";
import * as exifr from "exifr";
import UploadMap from "../components/UploadMap";

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
  const [manualLat, setManualLat] = useState(null);
  const [manualLng, setManualLng] = useState(null);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleUpload = async () => {
    setStatus(null);
    if (!file) return setStatus({ type: "error", message: "Wybierz plik!" });

    if (file.name.toLowerCase().endsWith(".heic")) {
      return setStatus({
        type: "error",
        message: "Pliki HEIC nie są obsługiwane. Przekonwertuj je do JPG lub PNG.",
      });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return setStatus({ type: "error", message: "Musisz być zalogowany." });
    }

    const uuid = uuidv4();
    const filePath = `${user.id}/${uuid}_${file.name}`;
    const timestamp = new Date().toISOString();

    // odczyt danych lokalizacyjnych
    let latitude = null;
    let longitude = null;

    try {
      const gpsData = await exifr.gps(file);
      if (gpsData?.latitude && gpsData?.longitude) {
        latitude = gpsData.latitude;
        longitude = gpsData.longitude;
      }
    } catch (exifError) {
      console.warn("Brak danych GPS lub błąd EXIF:", exifError);
    }

    // fallback do lokalizacji z mapy
    if (!latitude && !longitude && manualLat && manualLng) {
      latitude = manualLat;
      longitude = manualLng;
    }

    // upload pliku
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

    // zapis metadanych z lokalizacją
    const { error: infoError } = await supabase.from("photo_info").insert([{
      photo_id: photoData.id,
      tags: selectedTags.join(","),
      folder: folder,
      created_at: timestamp,
      latitude: latitude,
      longitude: longitude,
    }]);

    if (infoError) {
      return setStatus({ type: "error", message: "Błąd zapisu metadanych." });
    }

    setStatus({ type: "success", message: `Sukces! Plik przesłany.` });
    setFile(null);
    setFolder(ALLOWED_FOLDERS[0]);
    setSelectedTags([]);
    setManualLat(null);
    setManualLng(null);
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

      <div style={{ marginTop: "1rem" }}>
        <p>Jeśli zdjęcie nie zawiera lokalizacji, możesz ją wybrać ręcznie:</p>
          <UploadMap
            selectedLat={manualLat}
            selectedLng={manualLng}
            onSelect={({ lat, lng }) => {
              setManualLat(lat);
              setManualLng(lng);
            }}
          />
      </div>


      <button onClick={handleUpload} className={styles.button}>Wyślij</button>

      {status && <div className={`${styles.status} ${styles[status.type]}`}>{status.message}</div>}
    </div>
  );
}
