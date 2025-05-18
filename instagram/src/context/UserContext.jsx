// src/context/UserContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../lib/supabase-client";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
