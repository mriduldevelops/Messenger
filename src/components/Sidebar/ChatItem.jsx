import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useChat } from "../../context/ChatContext";
import { useNavigate } from "react-router-dom";

export default function ChatItem({ chatId, otherUid }) {
    const [otherUser, setOtherUser] = useState(null);
    const [chatData, setChatData] = useState(null);
    const { setSelectedUser } = useChat();
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Listen to the OTHER USER'S real profile info
        const unsubUser = onSnapshot(doc(db, "users", otherUid), (snap) => {
            setOtherUser(snap.data());
        });

        // 2. Listen to the CHAT details (last message, timestamp)
        const unsubChat = onSnapshot(doc(db, "chats", chatId), (snap) => {
            setChatData(snap.data());
        });

        return () => {
            unsubUser();
            unsubChat();
        };
    }, [chatId, otherUid]);

    if (!otherUser) return null;

    return (
        <div
            onClick={() => {
                setSelectedUser({ ...otherUser, chatId });
                navigate("/chat");
            }}
            className="flex items-center gap-2 p-2 border-b border-zinc-700 hover:bg-zinc-700 rounded cursor-pointer transition-colors"
        >
            <img
                src={otherUser.profilePhoto || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                className="w-10 h-10 rounded-full object-cover"
                alt="profile"
            />
            <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">{otherUser.fullName}</p>
                <p className="text-gray-400 text-sm truncate">
                    {chatData?.lastMessage ? chatData.lastMessage : "Start chatting"}
                </p>
            </div>
        </div>
    );
}