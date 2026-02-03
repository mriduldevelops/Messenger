import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  doc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useEffect, useRef, useState } from "react";
import { CheckCheck } from "lucide-react";

export default function MessageList() {
  const { user } = useAuth();
  const { selectedUser } = useChat();
  const [messages, setMessages] = useState([]);
  const [viewer, setViewer] = useState(null);

  const bottomRef = useRef(null);
  const isInitialLoad = useRef(true);

  const chatId =
    user.uid > selectedUser.uid
      ? `${user.uid}_${selectedUser.uid}`
      : `${selectedUser.uid}_${user.uid}`;

  // Reset the initial load flag whenever switching chats
  useEffect(() => {
    isInitialLoad.current = true;
  }, [chatId]);

  // --- 1. Real-time Message Listener ---
  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      // Map docs and include the ID so we can reference them for updates later
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [chatId]);

  // --- 2. Logic to Mark Messages as Read ---
  useEffect(() => {
    const markMessagesAsRead = async () => {
      // We only care about messages where:
      // - The sender is NOT the current user
      // - The message is currently unread
      const unreadQuery = query(
        collection(db, "chats", chatId, "messages"),
        where("senderId", "==", selectedUser.uid),
        where("read", "==", false)
      );

      const querySnapshot = await getDocs(unreadQuery);

      if (!querySnapshot.empty) {
        const batch = writeBatch(db);
        querySnapshot.docs.forEach((msgDoc) => {
          batch.update(msgDoc.ref, { read: true });
        });
        await batch.commit();
      }
    };

    if (messages.length > 0) {
      markMessagesAsRead();
    }
  }, [messages, chatId, selectedUser.uid]);

  // --- 3. Auto-scroll Logic ---
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({
        behavior: isInitialLoad.current ? "auto" : "smooth",
      });
      isInitialLoad.current = false;
    }
  }, [messages]);

  // --- Helpers ---
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return timestamp
      .toDate()
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

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

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setViewer(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-2 overflow-x-hidden">
      {viewer && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <button
            onClick={() => setViewer(null)}
            className="absolute top-4 right-4 text-white text-3xl"
          >
            ✕
          </button>
          {viewer.type === "image" && (
            <img src={viewer.url} alt="fullscreen" className="max-h-[90vh] max-w-[90vw] rounded-lg" />
          )}
          {viewer.type === "video" && (
            <video src={viewer.url} controls autoPlay className="max-h-[90vh] max-w-[90vw] rounded-lg" />
          )}
        </div>
      )}

      {messages.map((msg, i) => {
        const msgDate = msg.createdAt?.toDate();
        const prevMsg = messages[i - 1];
        const prevDate = prevMsg?.createdAt?.toDate();
        const showDate = msgDate && (!prevDate || !isSameDay(msgDate, prevDate));

        return (
          <div key={msg.id || i}>
            {showDate && msgDate && (
              <div className="flex justify-center my-4">
                <span className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                  {formatDateLabel(msgDate)}
                </span>
              </div>
            )}

            <div
              className={`max-w-3xs w-fit rounded-xl text-white relative ${
                msg.senderId === user.uid ? "bg-blue-600 ml-auto" : "bg-gray-700"
              }`}
            >
              {msg.type === "text" && <p className="px-3 py-1">{msg.text}</p>}
              {msg.type === "image" && (
                <img
                  src={msg.mediaUrl}
                  alt="sent"
                  onClick={() => setViewer({ type: "image", url: msg.mediaUrl })}
                  className="p-1 rounded-xl max-w-[240px] max-h-[300px] object-cover cursor-pointer"
                />
              )}
              {msg.type === "video" && (
                <video src={msg.mediaUrl} controls className="p-1 rounded-xl max-w-[240px]" />
              )}
              <div className="w-full flex justify-end px-3 pb-1 space-x-1">
                <span className="text-xs text-gray-200">{formatTime(msg.createdAt)}</span>
                {msg.senderId === user.uid && (
                  <span>
                    <CheckCheck
                      size={16}
                      className={msg.read ? "text-sky-400" : "text-gray-400"}
                    />
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
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
