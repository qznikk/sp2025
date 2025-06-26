import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import supabase from "../lib/supabase-client";
import styles from "../styles/upload.module.css";
import * as exifr from "exifr";
import UploadMap from "../components/UploadMap";

const ALLOWED_FOLDERS = ["Wakacje", "Rodzina", "Przyjaciele", "Praca", "Szkoła", "Sport", "Sztuka", "Jedzenie", "Podróże", "Inne"];
const ALLOWED_TAGS = ["morze", "góry", "miasto", "plaża", "zachód słońca", "rodzina", "zwierzęta", "sport", "kultura", "noc"];

export default function Upload() {
  const [file, setFile] = useState(null);
  const [folder, setFolder] = useState(ALLOWED_FOLDERS[0]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [status, setStatus] = useState(null);
  const [manualLat, setManualLat] = useState(null);
  const [manualLng, setManualLng] = useState(null);
  const [isPrivate, setIsPrivate] = useState(true);
  const [description, setDescription] = useState("");

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleUpload = async () => {
    setStatus(null);
    if (!file) return setStatus({ type: "error", message: "Wybierz plik, aby kontynuować." });

    if (file.name.toLowerCase().endsWith(".heic")) {
      return setStatus({
        type: "error",
        message: "Pliki HEIC nie są obsługiwane. Proszę przekonwertuj je do formatu JPG lub PNG.",
      });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return setStatus({ type: "error", message: "Musisz być zalogowany, aby przesłać plik." });
    }

    const uuid = uuidv4();
    const filePath = `${user.id}/${uuid}_${file.name}`;
    const timestamp = new Date().toISOString();

    let latitude = null;
    let longitude = null;
    try {
      const gpsData = await exifr.gps(file);
      if (gpsData?.latitude && gpsData?.longitude) {
        latitude = gpsData.latitude;
        longitude = gpsData.longitude;
      }
    } catch (exifError) {
      console.warn("Brak danych GPS w pliku lub błąd odczytu EXIF:", exifError);
    }

    if (!latitude && !longitude && manualLat && manualLng) {
      latitude = manualLat;
      longitude = manualLng;
    }

    setStatus({ type: "info", message: "Przesyłanie pliku..." });
    const { error: uploadError } = await supabase.storage.from("photos").upload(filePath, file);
    if (uploadError) {
      return setStatus({ type: "error", message: "Błąd przesyłania pliku: " + uploadError.message });
    }

    setStatus({ type: "info", message: "Zapisywanie informacji o zdjęciu..." });
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
      return setStatus({ type: "error", message: "Błąd zapisu danych zdjęcia." });
    }

    const { error: visibilityError } = await supabase
      .from("photo_visibility")
      .insert([{
        id: photoData.id,
        is_private: isPrivate,
      }]);

    if (visibilityError) {
      return setStatus({ type: "error", message: "Błąd ustawiania widoczności zdjęcia: " + visibilityError.message });
    }

    const { error: infoError } = await supabase.from("photo_info").insert([{
      photo_id: photoData.id,
      tags: selectedTags.join(","),
      folder: folder,
      created_at: timestamp,
      latitude: latitude,
      longitude: longitude,
    }]);

    if (infoError) {
      return setStatus({ type: "error", message: "Błąd zapisu metadanych zdjęcia." });
    }

    if (description) {
      const { error: descError } = await supabase.from("photo_descriptions").insert([{
        photo_id: photoData.id,
        description: description,
      }]);

      if (descError) {
        return setStatus({ type: "error", message: "Błąd zapisu opisu zdjęcia: " + descError.message });
      }
    }

    setStatus({ type: "success", message: "Sukces! Plik został pomyślnie przesłany." });
    setFile(null);
    setFolder(ALLOWED_FOLDERS[0]);
    setSelectedTags([]);
    setManualLat(null);
    setManualLng(null);
    setDescription("");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Prześlij Nowe Zdjęcie</h1>
      ---
      <section className={styles.section}>
        <h2>1. Wybierz Plik</h2>
        <div
          className={styles.dropzone}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.length > 0) {
              setFile(e.dataTransfer.files[0]);
            }
          }}
        >
          {file ? (
            <p className={styles.fileName}>Wybrany plik: <strong>{file.name}</strong></p>
          ) : (
            <p className={styles.filePlaceholder}>Przeciągnij plik tutaj lub kliknij, aby wybrać</p>
          )}
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className={styles.fileInput}
            aria-label="Wybierz plik do przesłania"
          />
        </div>
      </section>
      ---
      <section className={styles.section}>
        <h2>2. Ustawienia Zdjęcia</h2>

        <div className={styles.formGroup}>
          <label htmlFor="folderSelect" className={styles.label}>Wybierz folder:</label>
          <select
            id="folderSelect"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className={styles.selectInput}
          >
            {ALLOWED_FOLDERS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Widoczność:</label>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={!isPrivate}
                onChange={() => setIsPrivate(false)}
              />
              Publiczne
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={() => setIsPrivate(true)}
              />
              Prywatne
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>Opis zdjęcia (opcjonalnie, widoczne tylko dla zdjęć publicznych):</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
            placeholder="Dodaj krótki opis zdjęcia..."
            rows={4}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Tagi:</label>
          <div className={styles.tagsContainer}>
            {ALLOWED_TAGS.map((tag) => (
              <label key={tag} className={`${styles.tagLabel} ${selectedTags.includes(tag) ? styles.tagSelected : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={() => toggleTag(tag)}
                  className={styles.tagCheckbox}
                />
                {tag}
              </label>
            ))}
          </div>
        </div>
      </section>
      ---
      <section className={styles.section}>
        <h2>3. Lokalizacja (Opcjonalnie)</h2>
        <p className={styles.infoText}>Jeśli zdjęcie nie zawiera danych lokalizacyjnych (EXIF GPS), możesz wybrać lokalizację ręcznie na mapie. W przeciwnym razie dane GPS zostaną automatycznie pobrane ze zdjęcia.</p>
        <div className={styles.mapContainer}>
          <UploadMap
            selectedLat={manualLat}
            selectedLng={manualLng}
            onSelect={({ lat, lng }) => {
              setManualLat(lat);
              setManualLng(lng);
            }}
          />
          {manualLat && manualLng && (
            <p className={styles.selectedLocation}>Wybrana lokalizacja: Lat: {manualLat.toFixed(4)}, Lng: {manualLng.toFixed(4)}</p>
          )}
        </div>
      </section>
      ---
      <button onClick={handleUpload} className={styles.button} disabled={!file}>
        Prześlij Zdjęcie
      </button>

      {status && (
        <div className={`${styles.status} ${styles[status.type]}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}