import { useEffect, useState } from "react";
import supabase from "../lib/supabase-client";
import styles from "../styles/photos.module.css";

export default function Photos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error("Błąd pobierania użytkownika:", userError);
        setLoading(false);
        return;
      }

      const userId = userData.user.id;

      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Błąd pobierania zdjęć:", error.message);
      } else {
        setPhotos(data);
      }

      setLoading(false);
    };

    fetchPhotos();
  }, []);

  const getPublicUrl = (filePath) => {
    const { data } = supabase.storage.from("photos").getPublicUrl(filePath);
    return data?.publicUrl;
  };

  const getMediaType = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (["mp4", "webm", "mov", "ogg"].includes(ext)) return "video";
    if (["mp3", "wav", "ogg", "m4a"].includes(ext)) return "audio";
    return "file";
  };

  const deletePhoto = async () => {
    if (!photoToDelete) return;
    const { id, file_path } = photoToDelete;

    const { error: storageError } = await supabase.storage
      .from("photos")
      .remove([file_path]);
    if (storageError) {
      console.error("Błąd usuwania ze storage:", storageError);
      return;
    }

    const { error: dbError } = await supabase
      .from("photos")
      .delete()
      .eq("id", id);
    if (dbError) {
      console.error("Błąd usuwania z bazy danych:", dbError);
      return;
    }

    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
    setPhotoToDelete(null);
    setShowDeleteModal(false);
  };

  const filteredPhotos = photos.filter((photo) => {
    const type = getMediaType(photo.title);
    return filter === "all" || filter === type;
  });

  const filters = [
    { label: "Wszystkie", value: "all" },
    { label: "Zdjęcia", value: "image" },
    { label: "Wideo", value: "video" },
    { label: "Audio", value: "audio" },
    { label: "Inne", value: "file" },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Twoje pliki</h1>

      <div className={styles.filterBar}>
        {filters.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`${styles.filterButton} ${
              filter === value ? styles.active : ""
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className={styles.message}>Ładowanie...</p>
      ) : filteredPhotos.length === 0 ? (
        <p className={styles.message}>Brak plików w tej kategorii.</p>
      ) : (
        <div className={styles.grid}>
          {filteredPhotos.map((photo) => {
            const url = getPublicUrl(photo.file_path);
            const type = getMediaType(photo.title);

            return (
              <div key={photo.id} className={styles.card}>
                {type === "image" && (
                  <div
                    onClick={() => setSelectedImage(url)}
                    onContextMenu={(e) => e.preventDefault()}
                    className={styles.mediaWrapper}
                  >
                    <img
                      src={url}
                      alt={photo.title}
                      className={styles.media}
                      draggable={false}
                    />
                    <div className={styles.watermark}>© AHAOKOK</div>
                  </div>
                )}

                {type === "video" && (
                  <div className={styles.mediaWrapper}>
                    <video controls className={styles.media} draggable={false}>
                      <source src={url} type="video/mp4" />
                    </video>
                    <div className={styles.watermark}>© AHAOKOK</div>
                  </div>
                )}

                {type === "audio" && (
                  <div>
                    <audio controls className={styles.audio} draggable={false}>
                      <source src={url} type="audio/mpeg" />
                    </audio>
                  </div>
                )}

                {type === "file" && (
                  <div>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.fileLink}
                    >
                      {photo.title}
                    </a>
                  </div>
                )}

                <p className={styles.fileTitle}>{photo.title}</p>
                <button
                  onClick={() => {
                    setPhotoToDelete(photo);
                    setShowDeleteModal(true);
                  }}
                  className={styles.deleteButton}
                >
                  Usuń
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedImage && (
        <div className={styles.overlay} onClick={() => setSelectedImage(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Powiększone zdjęcie"
              className={styles.modalImage}
            />
            <div className={styles.modalWatermark}>© AHAOKOK</div>
            <button
              onClick={() => setSelectedImage(null)}
              className={styles.modalClose}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && photoToDelete && (
        <div
          className={styles.overlay}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className={styles.confirmBox}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Potwierdź usunięcie</h2>
            <p>
              Czy na pewno chcesz usunąć <strong>{photoToDelete.title}</strong>?
            </p>
            <div className={styles.confirmActions}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={styles.cancelButton}
              >
                Anuluj
              </button>
              <button onClick={deletePhoto} className={styles.confirmDelete}>
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
