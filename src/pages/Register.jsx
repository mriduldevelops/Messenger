import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";


export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [loading, setLoading] = useState(false);

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

      navigate("/");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <form
        onSubmit={handleRegister}
        className="bg-gray-800 p-6 rounded w-80 space-y-4"
      >
        <h2 className="text-white text-2xl font-bold text-center">
          Register
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-2 rounded bg-gray-700 text-white"
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <div>
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 rounded bg-gray-700 text-white"
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
          className="w-full p-2 rounded bg-gray-700 text-white"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 rounded bg-gray-700 text-white"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          disabled={usernameTaken || loading}
          className={`w-full p-2 rounded text-white ${usernameTaken
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600"
            }`}
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-white text-sm">
          Already have an account?
          <Link to="/login" className="text-green-600 ml-1">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
