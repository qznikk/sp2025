import { useEffect, useState } from "react";
import supabase from "../lib/supabase-client";

export default function PublicGallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicPhotos = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("photos")
        .select(`
          id,
          title,
          file_path,
          created_at,
          photo_info (
            tags,
            folder,
            latitude,
            longitude
          ),
          photo_visibility (
            is_private
          ),
          photo_descriptions (
            description
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Błąd pobierania zdjęć:", error);
        setLoading(false);
        return;
      }

      const publicPhotos = data.filter((photo) => photo.photo_visibility?.is_private === false);

      const photosWithUrls = publicPhotos.map((photo) => {
        const { data: storageData } = supabase.storage.from("photos").getPublicUrl(photo.file_path);
        return {
          ...photo,
          url: storageData.publicUrl,
          extension: photo.file_path.split(".").pop().toLowerCase(),
        };
      });

      setPhotos(photosWithUrls);
      setLoading(false);
    };

    fetchPublicPhotos();
  }, []);

  useEffect(() => {
    const disableContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", disableContextMenu);
    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
    };
  }, []);

  const isImage = (ext) => ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
  const isVideo = (ext) => ["mp4", "mov", "avi", "webm"].includes(ext);
  const isPDF = (ext) => ext === "pdf";

  const fileIcon = (ext) => {
    if (isPDF(ext)) return "📄";
    if (isVideo(ext)) return "🎥";
    if (["mp3", "wav"].includes(ext)) return "🎵";
    if (["zip", "rar", "7z"].includes(ext)) return "🗂️";
    return "📁";
  };

  const mediaOverlay = (
    <div
      style={{
        position: "absolute",
        bottom: "6px",
        right: "6px",
        backgroundColor: "rgba(0,0,0,0.6)",
        color: "white",
        fontSize: "12px",
        padding: "2px 6px",
        borderRadius: "4px",
        pointerEvents: "none",
      }}
    >
      Public
    </div>
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1>Galeria Publiczna</h1>

      {loading ? (
        <p>Ładowanie zdjęć...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "12px",
                position: "relative",
              }}
            >
              {isImage(photo.extension) ? (
                <div style={{ position: "relative" }}>
                  <img
                    src={photo.url}
                    alt={photo.title}
                    style={{ width: "100%", borderRadius: "6px" }}
                    draggable="false"
                  />
                  {mediaOverlay}
                </div>
              ) : isVideo(photo.extension) ? (
                <div style={{ position: "relative" }}>
                  <video
                    src={photo.url}
                    controls
                    playsInline
                    controlsList="nodownload"
                    style={{
                      width: "100%",
                      borderRadius: "6px",
                      background: "#000",
                    }}
                  >
                    Twoja przeglądarka nie obsługuje odtwarzania wideo.
                  </video>
                  {mediaOverlay}
                </div>
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
                    <strong>📍 Lokalizacja:</strong>{" "}
                    {photo.photo_info.latitude.toFixed(4)}, {photo.photo_info.longitude.toFixed(4)}
                  </p>
                )}

                <p>
                  <strong>📝 Opis:</strong>{" "}
                  {photo.photo_descriptions?.[0]?.description || <em>brak</em>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
