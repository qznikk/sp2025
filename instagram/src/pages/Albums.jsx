import { useEffect, useState } from "react";
import supabase from "../lib/supabase-client";
import exifr from "exifr";

export default function Albums() {
  const [albums, setAlbums] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); // <-- dodane

  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

  const isImageFile = (filename) => {
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  useEffect(() => {
    const fetchAndGroupPhotos = async () => {
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

      const enrichedPhotos = await Promise.all(
        photoList
          .filter(photo => isImageFile(photo.file_path))
          .map(async (photo) => {
            const { data } = supabase.storage.from("photos").getPublicUrl(photo.file_path);
            const url = data?.publicUrl;

            let date;
            try {
              const exif = await exifr.parse(url);
              date = exif?.DateTimeOriginal || null;
            } catch (err) {
              console.warn("Nie udało się pobrać EXIF dla", photo.title, err);
            }

            const finalDate = date ? new Date(date) : new Date(photo.created_at);
            const albumKey = finalDate.toISOString().split("T")[0];

            return { ...photo, url, albumKey };
          })
      );

      const grouped = {};
      enrichedPhotos.forEach((photo) => {
        if (!grouped[photo.albumKey]) {
          grouped[photo.albumKey] = [];
        }
        grouped[photo.albumKey].push(photo);
      });

      setAlbums(grouped);
      setLoading(false);
    };

    fetchAndGroupPhotos();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Albumy wg daty</h1>
      {loading ? (
        <p>Ładowanie...</p>
      ) : (
        Object.entries(albums).map(([date, photos]) => (
          <div key={date} style={{ marginBottom: "30px" }}>
            <h2>{date}</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {photos.map((photo) => (
                <div key={photo.id} style={{ textAlign: "center" }}>
                  <img
                    src={photo.url}
                    alt={photo.title}
                    onClick={() => setSelectedImage(photo.url)}
                    style={{
                      maxWidth: "150px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      cursor: "pointer"
                    }}
                  />
                  <p style={{ fontSize: "14px" }}>{photo.title}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* MODAL */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <img
            src={selectedImage}
            alt="Powiększone zdjęcie"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "10px",
              boxShadow: "0 0 20px black",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: "absolute",
              top: "20px",
              right: "30px",
              fontSize: "32px",
              color: "white",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
