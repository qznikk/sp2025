import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../lib/supabase-client";
import * as exifr from "exifr";

export default function PhotoDetail() {
  const { id } = useParams();
  const [photo, setPhoto] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhoto = async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Błąd ładowania zdjęcia:", error.message);
        setLoading(false);
        return;
      }

      setPhoto(data);

      const publicUrl = supabase.storage.from("photos").getPublicUrl(data.file_path).data?.publicUrl;

      try {
        const response = await fetch(publicUrl);
        const blob = await response.blob();
        const exifData = await exifr.parse(blob);
        setMetadata(exifData);
      } catch (err) {
        console.error("Błąd parsowania metadanych EXIF:", err);
      }

      setLoading(false);
    };

    fetchPhoto();
  }, [id]);

  if (loading) return <p>Ładowanie...</p>;
  if (!photo) return <p>Nie znaleziono zdjęcia</p>;

  const publicUrl = supabase.storage.from("photos").getPublicUrl(photo.file_path).data?.publicUrl;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{photo.title}</h1>
      <img src={publicUrl} alt={photo.title} style={{ maxWidth: "100%", borderRadius: "8px" }} />
      <h3>Metadane EXIF:</h3>
      <pre style={{ background: "#f0f0f0", padding: "10px", borderRadius: "8px" }}>
        {metadata ? JSON.stringify(metadata, null, 2) : "Brak metadanych lub nieobsługiwany format."}
      </pre>
    </div>
  );
}
