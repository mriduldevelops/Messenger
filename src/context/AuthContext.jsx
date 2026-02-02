import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/auth";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const ref = doc(db, "users", currentUser.uid);

          // Make sure user doc exists before updating
          const snap = await getDoc(ref);

          if (snap.exists()) {
            await updateDoc(ref, {
              online: true,
              lastSeen: serverTimestamp(),
            });
          }

          setUser({ ...currentUser, ...snap.data() });
        } catch (err) {
          console.log("Error updating user online status:", err.message);
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const logout = async () => {
    if (user) {
      await updateDoc(doc(db, "users", user.uid), {
        online: false,
        lastSeen: serverTimestamp(),
      });
      await signOut(auth);
    }
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
