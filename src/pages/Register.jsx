import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { Loader2 } from "lucide-react";
import logo from "../assets/icon-512.png"

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameTaken, setUsernameTaken] = useState(false);

  const [loading, setLoading] = useState(false);            // button loading
  const [loadingScreen, setLoadingScreen] = useState(false); // full-screen loader

  const navigate = useNavigate();

  const checkUsername = async (value) => {
    setUsername(value);

    if (!value) {
      setUsernameTaken(false);
      return;
    }
    const usernameRef = doc(db, "usernames", value.toLowerCase());
    const usernameSnap = await getDoc(usernameRef);

    setUsernameTaken(usernameSnap.exists());
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (usernameTaken) return;

    try {
      setLoading(true);

      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        email: res.user.email,
        fullName,
        username: username.toLowerCase(),
        createdAt: serverTimestamp(),
      });

      await setDoc(
        doc(db, "usernames", username.toLowerCase()),
        { uid: res.user.uid }
      );

      // show loader
      setLoadingScreen(true);

      setTimeout(() => {
        navigate("/");
      }, 5000);

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-zinc-900">

      {/* ---------- FULL SCREEN LOADER ---------- */}
      {loadingScreen ? (
        <div className="flex items-center justify-center w-screen h-screen text-white">
          <Loader2 className="animate-spin" size={40} color="#fab400"/>
        </div>
      ) : (
        /* ---------- REGISTER FORM ---------- */
        <form
          onSubmit={handleRegister}
          className="bg-zinc-800 p-6 rounded-xl w-80 space-y-4"
        >
          <div className="flex space-x-1 items-center w-full justify-center text-white mb-10">
            <img src={logo} alt="quick-ping-logo" className="h-10" />
            <h2 className="text-2xl font-extrabold">QuickPing</h2>
          </div>
          <h2 className="text-white text-lg font-bold text-center">
            Create your Account
          </h2>

          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-2 rounded bg-[#3d3c3f] text-white"
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <div>
            <input
              type="text"
              placeholder="Username"
              className="w-full p-2 rounded bg-[#3d3c3f] text-white"
              onChange={(e) => checkUsername(e.target.value)}
              required
            />
            {usernameTaken && (
              <p className="text-red-500 text-sm mt-1">
                Username is already taken
              </p>
            )}
          </div>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 rounded bg-[#3d3c3f] text-white"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 rounded bg-[#3d3c3f] text-white"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            disabled={usernameTaken || loading}
            className={`w-full p-2 rounded text-zinc-900 font-semibold ${usernameTaken ? "bg-gray-500 cursor-not-allowed" : 
              "bg-[#fab400]"
              }`}
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="text-white text-sm text-center mt-5">
            Already have an account?
            <Link to="/login" className="text-[#fa6450] ml-1">
              Login here
            </Link>
          </p>
        </form>
      )}
    </div>
  );
};
