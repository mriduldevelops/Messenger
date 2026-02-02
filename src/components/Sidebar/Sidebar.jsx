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
import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
    const { user } = useAuth();
    const { setSelectedUser } = useChat();

    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [chatList, setChatList] = useState([]);

    const navigate = useNavigate();

    // 🔥 Listen to user's chat list in realtime
    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, "userChats", user.uid, "chats"),
            async (snap) => {
                const tempChats = [];

                for (const docSnap of snap.docs) {
                    const chatData = docSnap.data();
                    const chatId = docSnap.id;

                    // 🔥 Listen to chat document to get lastMessage
                    const chatRef = doc(db, "chats", chatId);

                    onSnapshot(chatRef, (chatSnap) => {
                        const chatInfo = chatSnap.data();

                        tempChats.push({
                            chatId,
                            uid: chatData.uid,
                            fullName: chatData.fullName,
                            profilePhoto: chatData.profilePhoto || "",
                            lastMessage: chatInfo?.lastMessage || "",
                            updatedAt: chatInfo?.updatedAt,
                        });

                        // sort by latest message
                        tempChats.sort(
                            (a, b) =>
                                (b.updatedAt?.seconds || 0) -
                                (a.updatedAt?.seconds || 0)
                        );

                        setChatList([...tempChats]);
                    });
                }
            }
        );
        return () => unsub();
    }, [user.uid]);

    // 🔍 Search username
    const handleSearch = async () => {
        if (!searchText.trim()) return setSearchResults([]);

        const q = query(
            collection(db, "users"),
            where("username", ">=", searchText),
            where("username", "<=", searchText + "\uf8ff")
        );

        const snap = await getDocs(q);
        const result = snap.docs
            .map((d) => d.data())
            .filter((u) => u.uid !== user.uid);

        setSearchResults(result);
    };

    // ➕ Start new chat
    const startChat = async (otherUser) => {
        const chatId =
            user.uid > otherUser.uid
                ? `${user.uid}_${otherUser.uid}`
                : `${otherUser.uid}_${user.uid}`;

        // Create chat doc if missing
        await setDoc(
            doc(db, "chats", chatId),
            {
                users: [user.uid, otherUser.uid],
                lastMessage: "",
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );

        // Add to current user
        await setDoc(
            doc(db, "userChats", user.uid, "chats", chatId),
            {
                uid: otherUser.uid,
                fullName: otherUser.fullName,
                profilePhoto: otherUser.profilePhoto || "",
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );

        // Add to other user
        await setDoc(
            doc(db, "userChats", otherUser.uid, "chats", chatId),
            {
                uid: user.uid,
                fullName: user.fullName,
                profilePhoto: user.profilePhoto || "",
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );

        setSelectedUser(otherUser);
        navigate("/chat");
    };

    return (
        <div className="w-full h-screen bg-gray-900 text-white p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Pookie Chat</h2>
                <Link to={"/settings"}>
                    <Settings size={20} />
                </Link>
            </div>

            {/* Search */}
            <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search username..."
                className="w-full p-2 rounded bg-gray-700 outline-none"
            />

            {/* Search results */}
            {searchResults.length > 0 && (
                <div className="bg-gray-800 p-2 rounded mt-2">
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
                </div>
            )}

            {/* Chat list */}
            <h3 className="mt-4 mb-2 text-gray-400 text-sm">Chats</h3>

            {chatList.length === 0 && (
                <p className="text-gray-500 text-sm">No chats yet.</p>
            )}

            <div className="flex flex-col gap-2">
                {chatList.map((c) => (
                    <div
                        key={c.chatId}
                        onClick={() => {
                            setSelectedUser(c);
                            navigate("/chat");
                        }}
                        className="flex items-center gap-2 p-2 bg-gray-800 hover:bg-gray-700 rounded cursor-pointer"
                    >
                        <img
                            src={
                                c.profilePhoto ||
                                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                            }
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-semibold">{c.fullName}</p>
                            <p className="text-gray-400 text-sm">
                                {c.lastMessage
                                    ? c.lastMessage.slice(0, 20)
                                    : "Start chatting"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
