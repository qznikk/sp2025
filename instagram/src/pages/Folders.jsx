import { useEffect, useState } from "react";
import supabase from "../lib/supabase-client";
import styles from "../styles/folders.module.css";

export default function Folders() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchFolders = async () => {
<<<<<<< Updated upstream
      const { data, error } = await supabase.from("photo_info").select(`
          folder,
=======
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Błąd logowania lub brak użytkownika");
        setFolders([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("photo_info")
        .select(`
>>>>>>> Stashed changes
          tags,
          photo_id (
            id,
            file_path,
            user_id,
            photo_visibility (
              is_private
            )
          )
        `);

      if (error) {
        console.error("Błąd podczas pobierania:", error);
        setFolders([]);
        setLoading(false);
        return;
      }

      const folderMap = new Map();

      for (const { tags, photo_id } of data) {
        if (!photo_id?.file_path) continue;

        const isPrivate = photo_id.photo_visibility?.is_private;
        const isMyPhoto = photo_id.user_id === user.id;

        // Pomiń cudze prywatne zdjęcia
        if (isPrivate && !isMyPhoto) continue;

        const folder = isPrivate ? "Prywatne" : "Publiczne";

        if (!folderMap.has(folder)) folderMap.set(folder, []);

        const { data: publicData } = supabase.storage
          .from("photos")
          .getPublicUrl(photo_id.file_path);

        const extension = photo_id.file_path.split('.').pop().toLowerCase();

        folderMap.get(folder).push({
          id: photo_id.id,
          file_path: photo_id.file_path,
          url: publicData?.publicUrl || null,
<<<<<<< Updated upstream
          tags:
            tags
              ?.split(",")
              .map((t) => t.trim())
              .filter(Boolean) || [],
=======
          tags: tags?.split(",").map((t) => t.trim()).filter(Boolean) || [],
          extension,
>>>>>>> Stashed changes
        });
      }

<<<<<<< Updated upstream
      const formatted = Array.from(folderMap.entries()).map(
        ([name, photos]) => ({
          name,
          photos,
        })
      );
=======
      const formatted = Array.from(folderMap.entries()).map(([name, files]) => ({
        name,
        files,
      }));
>>>>>>> Stashed changes

      setFolders(formatted);
      setLoading(false);
    };

    fetchFolders();
  }, []);

  const isImage = (ext) => ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);

  const fileIcon = (ext) => {
    if (["pdf"].includes(ext)) return "📄";
    if (["mp4", "mov", "avi"].includes(ext)) return "🎥";
    if (["mp3", "wav"].includes(ext)) return "🎵";
    if (["zip", "rar"].includes(ext)) return "🗂️";
    return "📁";
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Foldery</h1>

<<<<<<< Updated upstream
      <section className={styles.folderSection}>
        <h2 className={styles.subtitle}>Prywatne Foldery</h2>
        {loading ? (
          <p className={styles.message}>Ładowanie...</p>
        ) : folders.length > 0 ? (
          <div className={styles.folderList}>
            {folders.map((folder) => (
              <div key={folder.name} className={styles.folderBox}>
                <h3 className={styles.folderName}>{folder.name}</h3>
                {folder.photos.length > 0 ? (
                  <div>
                    <strong>Zdjęcia:</strong>
                    <div className={styles.photoGrid}>
                      {folder.photos.map((photo) => (
                        <div
                          key={photo.id}
                          className={styles.photoRow}
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <img
                            src={photo.url}
                            alt={photo.file_path}
                            className={styles.thumbnail}
                          />
                          <div>
                            {photo.tags.length > 0 && (
                              <ul className={styles.tagList}>
                                {photo.tags.map((tag) => (
                                  <li key={tag}>{tag}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p>Brak zdjęć w folderze.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyBox}>
            <p>Brak folderów prywatnych.</p>
          </div>
        )}
      </section>

      {selectedPhoto && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedPhoto(null)}
=======
      {loading ? (
        <p>Ładowanie...</p>
      ) : folders.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {folders.map((folder) => (
            <div
              key={folder.name}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                borderRadius: "8px",
                width: "300px",
              }}
            >
              <h2>{folder.name}</h2>
              {folder.files.length > 0 ? (
                <div>
                  <strong>Pliki:</strong>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      marginTop: "10px",
                    }}
                  >
                    {folder.files.map((file) => (
                      <div
                        key={file.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          cursor: isImage(file.extension) ? "pointer" : "default",
                        }}
                        onClick={() =>
                          isImage(file.extension) && setSelectedPhoto(file)
                        }
                      >
                        {isImage(file.extension) ? (
                          <img
                            src={file.url}
                            alt={file.file_path}
                            style={{
                              width: "70px",
                              height: "70px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              border: "1px solid #ddd",
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: "30px" }}>{fileIcon(file.extension)}</span>
                        )}

                        <div>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "none", color: "#333" }}
                          >
                            {file.file_path.split("/").pop()}
                          </a>
                          {file.tags.length > 0 && (
                            <ul
                              style={{
                                margin: 0,
                                paddingLeft: "16px",
                                fontSize: "13px",
                              }}
                            >
                              {file.tags.map((tag) => (
                                <li key={tag}>{tag}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p>Brak plików w folderze.</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            border: "2px dashed #ccc",
            padding: "20px",
            borderRadius: "10px",
            marginTop: "10px",
            textAlign: "center",
            color: "#888",
          }}
        >
          <p>Brak folderów.</p>
        </div>
      )}

      {/* MODAL tylko dla zdjęć */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            cursor: "zoom-out",
          }}
>>>>>>> Stashed changes
        >
          <img
            src={selectedPhoto.url}
            alt="Powiększone"
            className={styles.modalImage}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
