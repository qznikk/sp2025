import { useEffect, useState } from "react";
import supabase from "../lib/supabase-client";

export default function Folders() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null); // 👈 nowy stan

  useEffect(() => {
    const fetchFolders = async () => {
      const { data, error } = await supabase
        .from("photo_info")
        .select(`
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

        const { data: publicData } = supabase.storage.from("photos").getPublicUrl(photo_id.file_path);

        folderMap.get(folder).push({
          id: photo_id.id,
          file_path: photo_id.file_path,
          url: publicData?.publicUrl || null,
          tags: tags?.split(",").map((t) => t.trim()).filter(Boolean) || [],
        });
      });

      const formatted = Array.from(folderMap.entries()).map(([name, photos]) => ({
        name,
        photos,
      }));

      setFolders(formatted);
      setLoading(false);
    };

    fetchFolders();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Foldery</h1>

      <div style={{ marginTop: "30px" }}>
        <h2>Prywatne Foldery</h2>
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
                <h3>{folder.name}</h3>
                {folder.photos.length > 0 ? (
                  <div>
                    <strong>Zdjęcia:</strong>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                      {folder.photos.map((photo) => (
                        <div
                          key={photo.id}
                          style={{ width: "100%", display: "flex", gap: "10px", cursor: "pointer" }}
                          onClick={() => setSelectedPhoto(photo)} // 👈 otwórz modal
                        >
                          <img
                            src={photo.url}
                            alt={photo.file_path}
                            style={{
                              width: "70px",
                              height: "70px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              border: "1px solid #ddd",
                            }}
                          />
                          <div>
                            {photo.tags.length > 0 && (
                              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px" }}>
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
            <p>Brak folderów prywatnych.</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)} // zamknij modal po kliknięciu tła
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
        >
          <img
            src={selectedPhoto.url}
            alt="Powiększone"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "10px",
              boxShadow: "0 0 20px rgba(255,255,255,0.2)",
            }}
          />
        </div>
      )}
    </div>
  );
}
