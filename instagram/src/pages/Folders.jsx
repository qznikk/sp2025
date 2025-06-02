import { useEffect, useState } from "react";
import supabase from "../lib/supabase-client";
import styles from "../styles/folders.module.css";

export default function Folders() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchFolders = async () => {
      const { data, error } = await supabase.from("photo_info").select(`
          folder,
          tags,
          photo_id (
            id,
            file_path
          )
        `);

      if (error) {
        console.error("Błąd podczas pobierania folderów:", error);
        setFolders([]);
        setLoading(false);
        return;
      }

      const folderMap = new Map();

      data.forEach(({ folder, tags, photo_id }) => {
        if (!folder || !photo_id?.file_path) return;

        if (!folderMap.has(folder)) folderMap.set(folder, []);

        const { data: publicData } = supabase.storage
          .from("photos")
          .getPublicUrl(photo_id.file_path);

        folderMap.get(folder).push({
          id: photo_id.id,
          file_path: photo_id.file_path,
          url: publicData?.publicUrl || null,
          tags:
            tags
              ?.split(",")
              .map((t) => t.trim())
              .filter(Boolean) || [],
        });
      });

      const formatted = Array.from(folderMap.entries()).map(
        ([name, photos]) => ({
          name,
          photos,
        })
      );

      setFolders(formatted);
      setLoading(false);
    };

    fetchFolders();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Foldery</h1>

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
