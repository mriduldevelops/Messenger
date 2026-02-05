import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import logo from "../assets/icon-512.png"

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
    <div className="h-screen flex items-center justify-center bg-zinc-900">

      {loading ? (
        // ------------- LOADER UI -------------
        <div className="flex items-center justify-center w-screen h-screen text-white">
          <Loader2 className="animate-spin" size={40} color="#fab400"/>
        </div>
      ) : (
        // ------------- LOGIN FORM -------------
        <form
          onSubmit={handleLogin}
          className="bg-zinc-800 p-6 rounded-xl w-80 space-y-4"
        >
          <div className="flex space-x-1 items-center w-full justify-center text-white mb-10">
            <img src={logo} alt="quick-ping-logo" className="h-10" />
            <h2 className="text-2xl font-extrabold">QuickPing</h2>
          </div>
          <h2 className="text-white text-lg font-bold text-center">Login to your Account</h2>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 rounded bg-[#3d3c3f] text-white"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 rounded bg-[#3d3c3f] text-white"
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* <button className="w-full bg-[#245346] p-2 rounded text-white"> */}
          <button className="w-full bg-[#fab400] p-2 rounded text-zinc-900 font-semibold">
            Login
          </button>

          <p className="text-white text-sm mt-5 text-center">
            Don't have an account?
            {/* <Link to={"/register"} className="text-[#34806a]"> Register here </Link> */}
            <Link to={"/register"} className="text-[#fa6450]"> Register here </Link>
          </p>
        </form>
      )}
    </div>
  );
}
