import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firestore";


export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
  e.preventDefault();
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", res.user.uid), {
      uid: res.user.uid,
      email: res.user.email,
      createdAt: serverTimestamp(),
    });

    navigate("/");
  } catch (error) {
    alert(error.message);
  }
};


  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <form
        onSubmit={handleRegister}
        className="bg-gray-800 p-6 rounded w-80 space-y-4"
      >
        <h2 className="text-white text-2xl font-bold text-center">Register</h2>

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

        <button className="w-full bg-blue-600 p-2 rounded text-white">
          Register
        </button>
        <p className="text-white">Already have an account?<Link to={'/login'} className="text-green-600"> Login here </Link></p>
      </form>
    </div>
  );
}
