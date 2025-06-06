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
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Błąd pobierania zdjęć:", error);
        setLoading(false);
        return;
      }

      const publicPhotos = data.filter((photo) => photo.photo_visibility?.is_private === false);

      const photosWithUrls = await Promise.all(
        publicPhotos.map(async (photo) => {
          const { data: storageData } = supabase.storage.from("photos").getPublicUrl(photo.file_path);
          return {
            ...photo,
            url: storageData.publicUrl,
          };
        })
      );

      setPhotos(photosWithUrls);
      setLoading(false);
    };

    fetchPublicPhotos();
  }, []);

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
            <div key={photo.id} style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "12px" }}>
              <img
                src={photo.url}
                alt={photo.title}
                style={{ width: "100%", borderRadius: "6px" }}
              />
              <div style={{ marginTop: "10px" }}>
                <h3>{photo.title}</h3>
                <p><strong>Folder:</strong> {photo.photo_info?.folder || "brak"}</p>
                <p><strong>Tagi:</strong> {photo.photo_info?.tags || "brak"}</p>
                {photo.photo_info?.latitude && photo.photo_info?.longitude && (
                  <p><strong>📍 Lokalizacja:</strong> {photo.photo_info.latitude.toFixed(4)}, {photo.photo_info.longitude.toFixed(4)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
