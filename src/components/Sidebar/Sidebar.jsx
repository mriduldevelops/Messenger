import { collection, onSnapshot, query, where, orderBy, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/auth";
import { LogOut, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const { setSelectedUser } = useChat();
    const navigate = useNavigate();

    // const handleLogout = async () => {
    //     await updateDoc(doc(db, "users", user.uid), {
    //         online: false,
    //         lastSeen: serverTimestamp(),
    //     });
    //     await signOut(auth);
    // }


    useEffect(() => {
        const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
            const usersList = snapshot.docs
                .map((doc) => doc.data())
                .filter((u) => u.uid !== user.uid);

            setUsers(usersList);
        });

        return () => unsub();
    }, [user.uid]);

    return (
        <div className="w-screen min-h-screen bg-gray-800 text-white p-4 relative flex items-center flex-col">
            <div className="w-full flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Pookie Chat</h2>
                <Link to={'/settings'}>
                    <Settings size={20}/>
                </Link>
            </div>

            {users.map((u) => (
                <div
                    key={u.uid}
                    onClick={() => {
                        setSelectedUser(u);
                        navigate('/chat');
                    }}
                    className="p-2 border-b border-gray-500 rounded cursor-pointer hover:bg-gray-600 w-full"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                                <img src={u.profilePhoto || "https://cdn-icons-png.flaticon.com/512/847/847969.png"} alt="user-fprofile" className="h-full w-full object-cover" />
                            </div>
                            <span className="text-lg">{u.fullName}</span>
                        </div>
                        <span
                            className={`w-2 h-2 rounded-full ${u.online ? "bg-green-500" : "bg-gray-500"
                                }`}
                        />
                    </div>

                </div>

            ))}
            {/* <button
                onClick={handleLogout}
                className="mt-4 bg-red-600 px-4 py-2 rounded fixed bottom-5 w-[90%] flex justify-center items-center gap-2"
            >
                <span className="text-lg">Logout</span> <LogOut size={20} />
            </button> */}
        </div>
    );
}
