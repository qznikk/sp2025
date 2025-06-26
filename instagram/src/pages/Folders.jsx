import { useEffect, useState } from "react";
import supabase from "../lib/supabase-client";

export default function Folders() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchFolders = async () => {
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
          folder,
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

      const topLevelFolders = new Map(); // "Prywatne" / "Publiczne"

      for (const { folder, tags, photo_id } of data) {
        if (!photo_id?.file_path) continue;

        const isPrivate = photo_id.photo_visibility?.is_private;
        const isMyPhoto = photo_id.user_id === user.id;
        if (!isMyPhoto) continue;

        const topFolderName = isPrivate ? "Prywatne" : "Publiczne";
        const subfolder = folder?.trim() || "Bez folderu";

        if (!topLevelFolders.has(topFolderName)) {
          topLevelFolders.set(topFolderName, new Map());
        }

        const subMap = topLevelFolders.get(topFolderName);
        if (!subMap.has(subfolder)) subMap.set(subfolder, []);

        const { data: publicData } = supabase.storage.from("photos").getPublicUrl(photo_id.file_path);
        const extension = photo_id.file_path.split('.').pop().toLowerCase();

        subMap.get(subfolder).push({
          id: photo_id.id,
          file_path: photo_id.file_path,
          url: publicData?.publicUrl || null,
          tags: tags?.split(",").map((t) => t.trim()).filter(Boolean) || [],
          extension,
          isPrivate,
        });
      }

      const formatted = Array.from(topLevelFolders.entries()).map(([topName, subMap]) => ({
        name: topName,
        subfolders: Array.from(subMap.entries()).map(([subName, files]) => ({
          name: subName,
          files,
        })),
      }));

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
    <div
  style={{ padding: "20px" }}
  onContextMenu={(e) => e.preventDefault()}
>
      <h1>Foldery</h1>

      {loading ? (
        <p>Ładowanie...</p>
      ) : folders.length > 0 ? (
        folders.map((folder) => (
          <div key={folder.name} style={{ marginBottom: "30px" }}>
            <h2>{folder.name}</h2>

            {folder.subfolders.map((sub) => (
              <div
                key={sub.name}
                style={{
                  border: "1px solid #ccc",
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                <h3 style={{ marginBottom: "10px" }}>{sub.name}</h3>

                {sub.files.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {sub.files.map((file) => (
                      <div
                        key={file.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          cursor: isImage(file.extension) ? "pointer" : "default",
                        }}
                        onClick={() =>
                          isImage(file.extension) && setSelectedPhoto(file)
                        }
                      >
                        {isImage(file.extension) ? (
                          <div style={{ position: "relative", width: "120px", height: "120px" }}>
                            <img
                              src={file.url}
                              alt={file.file_path}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "4px",
                                border: "1px solid #ddd",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                bottom: "4px",
                                right: "4px",
                                backgroundColor: "rgba(0, 0, 0, 0.6)",
                                color: "white",
                                fontSize: "10px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                pointerEvents: "none",
                              }}
                            >
                              {file.isPrivate ? "Private" : "Public"}
                            </div>
                          </div>
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
                            <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px" }}>
                              {file.tags.map((tag) => (
                                <li key={tag}>{tag}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Brak plików w folderze.</p>
                )}
              </div>
            ))}
          </div>
        ))
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
            overflow: "auto",
          }}
        >
          <div style={{ position: "relative" }}>
            <img
              src={selectedPhoto.url}
              alt="Powiększone"
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: "10px",
                boxShadow: "0 0 20px rgba(255,255,255,0.2)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                backgroundColor: "rgba(0,0,0,0.5)",
                color: "white",
                padding: "6px 10px",
                borderRadius: "5px",
                fontSize: "14px",
                pointerEvents: "none",
              }}
            >
              © ???App
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
