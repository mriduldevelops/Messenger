import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { useChat } from "../../context/ChatContext";

export default function Sidebar() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const { setSelectedUser } = useChat();


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
        <div className="w-72 bg-gray-800 text-white p-4">
            <h2 className="text-lg font-bold mb-4">Users</h2>

            {users.map((u) => (
                <div
                    key={u.uid}
                    onClick={() => setSelectedUser(u)}
                    className="p-2 mb-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                >
                    <div className="flex items-center justify-between">
                        <span>{u.email}</span>
                        <span
                            className={`w-2 h-2 rounded-full ${u.online ? "bg-green-500" : "bg-gray-500"
                                }`}
                        />
                    </div>

                </div>

            ))}
        </div>
    );
}
