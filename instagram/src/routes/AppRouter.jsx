import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer"; // opcjonalnie
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Upload from "../pages/Upload";
import Photos from "../pages/Photos";
import Map from "../pages/Map";
import Folders from "../pages/Folders";
import Albums from "../pages/Albums";
import PublicGallery from "../pages/PublicGallery";
import Settings from "../pages/Settings";

export default function AppRouter() {
  const { user } = useUser();

  return (
    <BrowserRouter>
      <Navbar />

      <div style={{ padding: "20px", minHeight: "80vh" }}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Private */}
          {user && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/photos" element={<Photos />} />
              <Route path="/map" element={<Map />} />
              <Route path="/folders" element={<Folders />} />
              <Route path="/albums" element={<Albums />} />
              <Route path="/publicgallery" element={<PublicGallery />} />
              <Route path="/settings" element={<Settings />} />
              {/* dodaj kolejne ścieżki tu */}
            </>
          )}

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      <Footer />
    </BrowserRouter>
  );
}
