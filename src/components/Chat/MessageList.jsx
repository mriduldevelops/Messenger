import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useEffect, useRef, useState } from "react";

export default function MessageList() {
  const { user } = useAuth();
  const { selectedUser } = useChat();
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

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

  useEffect(() => {
  if (!selectedUser) return;

  const markAsRead = async () => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      where("senderId", "!=", user.uid),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
  };

  markAsRead();
}, [chatId, selectedUser]);

  // 🔥 Auto-scroll when new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return timestamp
      .toDate()
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const formatDateLabel = (date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-2">
      {messages.map((msg, i) => {
        const msgDate = msg.createdAt?.toDate();
        const prevMsg = messages[i - 1];
        const prevDate = prevMsg?.createdAt?.toDate();

        const showDate =
          !prevDate || !isSameDay(msgDate, prevDate);

        return (
          <div key={i}>
            {/* 📅 Date Separator */}
            {showDate && msgDate && (
              <div className="flex justify-center my-4">
                <span className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                  {formatDateLabel(msgDate)}
                </span>
              </div>
            )}

            {/* 💬 Message Bubble */}
            <div
              key={i}
              className={`max-w-xl w-fit p-3 rounded-xl text-white relative ${msg.senderId === user.uid
                ? "bg-blue-600 ml-auto"
                : "bg-gray-700"
                }`}
            >
              <p className="pr-14">{msg.text}</p>
              <span className="absolute bottom-1 right-2 text-xs text-gray-200">
                {formatTime(msg.createdAt)}
              </span>
            </div>
          </div>
        );
      })}


      {/* 👇 Scroll target */}
      <div ref={bottomRef} />
    </div>
  );
}


{/* <div
          key={i}
          className={`max-w-xl w-fit p-3 rounded-xl text-white relative ${msg.senderId === user.uid
              ? "bg-blue-600 ml-auto"
              : "bg-gray-700"
            }`}
        >
          <p className="pr-14">{msg.text}</p>
          <span className="absolute bottom-1 right-2 text-xs text-gray-200">
            {formatTime(msg.createdAt)}
          </span>
        </div> */}
