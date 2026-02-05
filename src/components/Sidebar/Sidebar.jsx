import {
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    onSnapshot,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useEffect, useState, useRef } from "react";
import { Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ChatItem from "./ChatItem";
import logo from "../../assets/icon-512.png";

export default function Sidebar() {
    const { user } = useAuth();
    const { setSelectedUser } = useChat();

    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [chatIds, setChatIds] = useState([]);

    const navigate = useNavigate();

    // Store debounce timer
    const debounceRef = useRef(null);

    // -------------------------------
    // 🔍 Auto Search (Debounced)
    // -------------------------------
    const handleSearchAuto = (text) => {
        setSearchText(text);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            if (!text.trim()) {
                setSearchResults([]);
                return;
            }
            autoSearch(text);
        }, 300);
    };

    const autoSearch = async (text) => {
        const q = query(
            collection(db, "users"),
            where("username", ">=", text.toLowerCase()),
            where("username", "<=", text.toLowerCase() + "\uf8ff")
        );

        const snap = await getDocs(q);

        setSearchResults(
            snap.docs.map((d) => d.data()).filter((u) => u.uid !== user.uid)
        );
    };

    // -------------------------------
    // 🟢 Fetch Recent Chats
    // -------------------------------
    useEffect(() => {
        if (!user?.uid) return;

        const q = query(collection(db, "userChats", user.uid, "chats"));

        const unsub = onSnapshot(q, (snap) => {
            const ids = snap.docs.map((d) => ({
                chatId: d.id,
                otherUid: d.data().uid,
            }));
            setChatIds(ids);
        });

        return () => unsub();
    }, [user.uid]);

    // -------------------------------
    // 💬 Start Chat
    // -------------------------------
    const startChat = async (otherUser) => {
        const chatId =
            user.uid > otherUser.uid
                ? `${user.uid}_${otherUser.uid}`
                : `${otherUser.uid}_${user.uid}`;

        // Create chat doc
        await setDoc(
            doc(db, "chats", chatId),
            {
                users: [user.uid, otherUser.uid],
                lastMessage: "",
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );

        // Add chat to user chat lists
        await setDoc(
            doc(db, "userChats", user.uid, "chats", chatId),
            {
                uid: otherUser.uid,
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );

        await setDoc(
            doc(db, "userChats", otherUser.uid, "chats", chatId),
            {
                uid: user.uid,
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );

        setSelectedUser(otherUser);
        setSearchResults([]);
        setSearchText("");
        navigate("/chat");
    };

    return (
        <div className="w-full h-screen bg-zinc-900 text-white p-4 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-1 items-center">
                    <img src={logo} alt="logo" className="h-6" />
                    <h2 className="text-lg font-extrabold">QuickPing</h2>
                </div>
                <Link to="/settings">
                    <Settings size={20} />
                </Link>
            </div>

            {/* Search Bar */}
            <input
                value={searchText}
                onChange={(e) => handleSearchAuto(e.target.value)}
                placeholder="Search username..."
                className="w-full p-2 rounded bg-[#3d3c3f] outline-none mb-2"
            />

            {/* Search Results */}
            <div className="overflow-y-auto">
                {searchResults.length > 0 && (
                    <h3 className="text-sm text-gray-400 mb-1">Search Results</h3>
                )}

                {searchResults.map((u) => (
                    <div
                        key={u.uid}
                        onClick={() => startChat(u)}
                        className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer"
                    >
                        <img
                            src={
                                u.profilePhoto ||
                                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                            }
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-semibold">{u.fullName}</p>
                            <p className="text-gray-400 text-sm">@{u.username}</p>
                        </div>
                    </div>
                ))}

                {/* Recent Chats */}
                <h3 className="mt-4 mb-2 text-gray-400 text-sm">Recent Chats</h3>

                <div className="flex flex-col">
                    {chatIds.length === 0 ? (
                        <p className="text-zinc-500 text-sm">No chats yet.</p>
                    ) : (
                        chatIds.map((item) => (
                            <ChatItem
                                key={item.chatId}
                                chatId={item.chatId}
                                otherUid={item.otherUid}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
