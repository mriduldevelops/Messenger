// import { signOut } from "firebase/auth";
// import { auth } from "../firebase/auth";
// import { useAuth } from "../context/AuthContext";

// export default function Home() {
//   const { user } = useAuth();

//   return (
//     <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
//       <h1 className="text-2xl">Welcome {user?.email}</h1>

//       <button
//         onClick={() => signOut(auth)}
//         className="mt-4 bg-red-600 px-4 py-2 rounded"
//       >
//         Logout
//       </button>
//     </div>
//   );
// }


import Sidebar from "../components/Sidebar/Sidebar";
import ChatBox from "../components/Chat/ChatBox";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/auth";
import { useAuth } from "../context/AuthContext";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";
export default function Home() {
    // const { user } = useAuth();
    // const handleLogout = async () => {
    //     await updateDoc(doc(db, "users", user.uid), {
    //         online: false,
    //         lastSeen: serverTimestamp(),
    //     });
    //     await signOut(auth);

    // }
    return (
        <div className="h-screen flex">
            <Sidebar />
            <ChatBox />
            {/* <button
                onClick={handleLogout}
                className="mt-4 bg-red-600 px-4 py-2 rounded"
            >
                Logout
            </button> */}
        </div>
    );
}

