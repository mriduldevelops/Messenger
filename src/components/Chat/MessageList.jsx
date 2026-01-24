import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useEffect, useState } from "react";

export default function MessageList() {
  const { user } = useAuth();
  const { selectedUser } = useChat();
  const [messages, setMessages] = useState([]);

  const chatId =
    user.uid > selectedUser.uid
      ? `${user.uid}_${selectedUser.uid}`
      : `${selectedUser.uid}_${user.uid}`;

  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsub();
  }, [chatId]);

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-2">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`max-w-xs p-2 rounded text-white ${
            msg.senderId === user.uid
              ? "bg-blue-600 ml-auto"
              : "bg-gray-700"
          }`}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}
