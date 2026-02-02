import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);   // <-- loader state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // start loader

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // delay 5 seconds
      setTimeout(() => {
        navigate("/");
      }, 5000);

    } catch (error) {
      setLoading(false);   // stop loader if login failed
      alert(error.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">

      {loading ? (
        // ------------- LOADER UI -------------
        <div className="flex items-center justify-center w-screen h-screen text-white">
          <Loader2 className="animate-spin" size={40}/>          
        </div>
      ) : (
        // ------------- LOGIN FORM -------------
        <form
          onSubmit={handleLogin}
          className="bg-gray-800 p-6 rounded w-80 space-y-4"
        >
          <h2 className="text-white text-2xl font-bold text-center">Login</h2>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 rounded bg-gray-700 text-white"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 rounded bg-gray-700 text-white"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-green-600 p-2 rounded text-white">
            Login
          </button>

          <p className="text-white">
            Don't have an account?
            <Link to={"/register"} className="text-green-600"> Register here </Link>
          </p>
        </form>
      )}
    </div>
  );
}
