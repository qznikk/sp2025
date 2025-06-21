import { useEffect, useState } from "react";
import supabase from "../lib/supabase-client";
import styles from "../styles/publicGallery.module.css";

export default function PublicGallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({});
  const [savingId, setSavingId] = useState(null);

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setLoading(false);
        return;
      }

      const { data: photoList, error } = await supabase
        .from("photos")
        .select("*")
        .eq("user_id", userData.user.id);

      if (error) {
        console.error("Błąd pobierania zdjęć:", error);
        setLoading(false);
        return;
      }

<<<<<<< Updated upstream
      const photosWithUrls = await Promise.all(
        photoList
          .filter((photo) => {
            const ext = photo.title?.split(".").pop()?.toLowerCase();
            return ext && imageExtensions.includes(ext);
          })
          .map(async (photo) => {
            const { data } = supabase.storage
              .from("photos")
              .getPublicUrl(photo.file_path);
            return {
              ...photo,
              url: data.publicUrl,
            };
          })
      );
=======
      const publicPhotos = data.filter((photo) => photo.photo_visibility?.is_private === false);

      const photosWithUrls = publicPhotos.map((photo) => {
        const { data: storageData } = supabase.storage.from("photos").getPublicUrl(photo.file_path);
        return {
          ...photo,
          url: storageData.publicUrl,
          extension: photo.file_path.split(".").pop().toLowerCase(),
        };
      });
>>>>>>> Stashed changes

      setPhotos(photosWithUrls);
      setLoading(false);
    };

    fetchPhotos();
  }, []);

<<<<<<< Updated upstream
  const handleChange = (id, field, value) => {
    setEditing((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (photo) => {
    const edited = editing[photo.id];
    if (!edited) return;

    setSavingId(photo.id);

    const updates = {
      title: edited.title ?? photo.title,
      description: edited.description ?? photo.description,
      tags: edited.tags ?? photo.tags,
      gps_lat: edited.gps_lat ?? photo.gps_lat,
      gps_lng: edited.gps_lng ?? photo.gps_lng,
    };

    const { error } = await supabase
      .from("photos")
      .update(updates)
      .eq("id", photo.id);

    if (error) {
      alert("Błąd zapisu metadanych");
    } else {
      alert("Zapisano zmiany");
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, ...updates } : p))
      );
      setEditing((prev) => ({ ...prev, [photo.id]: {} }));
    }

    setSavingId(null);
=======
  const isImage = (ext) => ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
  const isVideo = (ext) => ["mp4", "mov", "avi", "webm"].includes(ext);
  const isPDF = (ext) => ext === "pdf";

  const fileIcon = (ext) => {
    if (isPDF(ext)) return "📄";
    if (isVideo(ext)) return "🎥";
    if (["mp3", "wav"].includes(ext)) return "🎵";
    if (["zip", "rar", "7z"].includes(ext)) return "🗂️";
    return "📁";
>>>>>>> Stashed changes
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Podgląd i Edycja Metadanych</h1>

      {loading ? (
        <p className={styles.loading}>Ładowanie zdjęć...</p>
      ) : (
<<<<<<< Updated upstream
        <div className={styles.galleryGrid}>
          {photos.map((photo) => {
            const edit = editing[photo.id] || {};
            return (
              <div key={photo.id} className={styles.card}>
                <img
                  src={photo.url}
                  alt={photo.title}
                  className={styles.image}
                />
                <div className={styles.form}>
                  <label>
                    Tytuł:
                    <input
                      type="text"
                      value={edit.title ?? photo.title ?? ""}
                      onChange={(e) =>
                        handleChange(photo.id, "title", e.target.value)
                      }
                      className={styles.input}
                    />
                  </label>
                  <label>
                    Opis:
                    <textarea
                      value={edit.description ?? photo.description ?? ""}
                      onChange={(e) =>
                        handleChange(photo.id, "description", e.target.value)
                      }
                      className={styles.textarea}
                    />
                  </label>
                  <label>
                    Tagi (oddziel przecinkami):
                    <input
                      type="text"
                      value={edit.tags ?? photo.tags ?? ""}
                      onChange={(e) =>
                        handleChange(photo.id, "tags", e.target.value)
                      }
                      className={styles.input}
                    />
                  </label>
                  <label>
                    GPS Latitude:
                    <input
                      type="number"
                      step="any"
                      value={edit.gps_lat ?? photo.gps_lat ?? ""}
                      onChange={(e) =>
                        handleChange(photo.id, "gps_lat", e.target.value)
                      }
                      className={styles.input}
                    />
                  </label>
                  <label>
                    GPS Longitude:
                    <input
                      type="number"
                      step="any"
                      value={edit.gps_lng ?? photo.gps_lng ?? ""}
                      onChange={(e) =>
                        handleChange(photo.id, "gps_lng", e.target.value)
                      }
                      className={styles.input}
                    />
                  </label>

                  <button
                    onClick={() => handleSave(photo)}
                    disabled={savingId === photo.id}
                    className={styles.button}
                  >
                    {savingId === photo.id ? "Zapisywanie..." : "Zapisz zmiany"}
                  </button>
                </div>
=======
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {photos.map((photo) => (
            <div key={photo.id} style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "12px" }}>
              {isImage(photo.extension) ? (
                <img
                  src={photo.url}
                  alt={photo.title}
                  style={{ width: "100%", borderRadius: "6px" }}
                />
              ) : isVideo(photo.extension) ? (
                <video
                  src={photo.url}
                  controls
                  playsInline
                  controlsList="nodownload"
                  style={{ width: "100%", borderRadius: "6px", background: "#000" }}
                >
                  Twoja przeglądarka nie obsługuje odtwarzania wideo.
                </video>
              ) : (
                <div
                  style={{
                    height: "180px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "64px",
                  }}
                >
                  {fileIcon(photo.extension)}
                </div>
              )}

              <div style={{ marginTop: "10px" }}>
                <h3>{photo.title || photo.file_path.split("/").pop()}</h3>
                {photo.photo_info?.latitude && photo.photo_info?.longitude && (
                  <p>
                    <strong>📍 Lokalizacja:</strong> {photo.photo_info.latitude.toFixed(4)}, {photo.photo_info.longitude.toFixed(4)}
                  </p>
                )}
>>>>>>> Stashed changes
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
