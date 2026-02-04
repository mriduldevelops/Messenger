import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  doc,
  writeBatch,
  getDocs
} from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useEffect, useRef, useState } from "react";
import { CheckCheck } from "lucide-react";

export default function MessageList() {
  const { user } = useAuth();
  const {
    selectedUser,
    deleteMode,
    selectedMessages,
    setSelectedMessages
  } = useChat();

  const [messages, setMessages] = useState([]);
  const [viewer, setViewer] = useState(null);
  const bottomRef = useRef(null);
  const isInitialLoad = useRef(true);

  const chatId =
    user.uid > selectedUser.uid
      ? `${user.uid}_${selectedUser.uid}`
      : `${selectedUser.uid}_${user.uid}`;

  // Reset initial load on chat switch
  useEffect(() => {
    isInitialLoad.current = true;
  }, [chatId]);

  /** --------------------------------------------------
   *  REALTIME LISTENER
   * --------------------------------------------------*/
  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [chatId]);

  /** --------------------------------------------------
   * MARK MESSAGES AS READ
   * --------------------------------------------------*/
  useEffect(() => {
    const markMessages = async () => {
      const unreadQuery = query(
        collection(db, "chats", chatId, "messages"),
        where("senderId", "==", selectedUser.uid),
        where("read", "==", false)
      );

      const snap = await getDocs(unreadQuery);
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
        await batch.commit();
      }
    };

    if (messages.length > 0) markMessages();
  }, [messages]);

  /** --------------------------------------------------
   * AUTO SCROLL
   * --------------------------------------------------*/
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({
        behavior: isInitialLoad.current ? "auto" : "smooth"
      });
      isInitialLoad.current = false;
    }
  }, [messages]);

  /** --------------------------------------------------
   * DATE HELPERS
   * --------------------------------------------------*/
  const formatTime = (ts) =>
    ts ? ts.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  const isSameDay = (d1, d2) =>
    d1 &&
    d2 &&
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
      year: "numeric"
    });
  };

  /** --------------------------------------------------
   * DELETE MODE SELECTION
   * --------------------------------------------------*/
  const toggleSelect = (msgId) => {
    if (!deleteMode) return;
    if (selectedMessages.includes(msgId)) {
      setSelectedMessages(selectedMessages.filter((id) => id !== msgId));
    } else {
      setSelectedMessages([...selectedMessages, msgId]);
    }
  };

  /** --------------------------------------------------
   * DELETE ACTIONS (LISTEN FROM ChatBox)
   * --------------------------------------------------*/
  useEffect(() => {
    const deleteSelected = async () => {
      if (selectedMessages.length === 0) return;
      const batch = writeBatch(db);
      selectedMessages.forEach((id) => {
        const ref = doc(db, "chats", chatId, "messages", id);
        batch.delete(ref);
      });
      await batch.commit();
      setSelectedMessages([]);
    };

    const clearChat = async () => {
      const snap = await getDocs(collection(db, "chats", chatId, "messages"));
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    };

    window.addEventListener("delete-selected", deleteSelected);
    window.addEventListener("clear-chat", clearChat);

    return () => {
      window.removeEventListener("delete-selected", deleteSelected);
      window.removeEventListener("clear-chat", clearChat);
    };
  }, [selectedMessages, chatId]);

  /** --------------------------------------------------
   * RENDER
   * --------------------------------------------------*/
  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-zinc-900">

      {/* FULLSCREEN IMAGE/VIDEO VIEWER */}
      {viewer && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button
            onClick={() => setViewer(null)}
            className="absolute top-4 right-4 text-white text-3xl"
          >
            ✕
          </button>

          {viewer.type === "image" && (
            <img
              src={viewer.url}
              className="max-h-[90vh] max-w-[90vw]"
            />
          )}

          {viewer.type === "video" && (
            <video
              src={viewer.url}
              controls
              autoPlay
              className="max-h-[90vh] max-w-[90vw]"
            />
          )}
        </div>
      )}

      {/* MESSAGES LOOP */}
      {messages.map((msg, i) => {
        const msgDate = msg.createdAt?.toDate();
        const prev = messages[i - 1]?.createdAt?.toDate();
        const showDate = msgDate && (!prev || !isSameDay(msgDate, prev));

        return (
          <div key={msg.id}>
            {showDate && (
              <div className="flex justify-center my-3">
                <span className="bg-zinc-700 px-3 py-1 rounded-full text-gray-300 text-xs">
                  {formatDateLabel(msgDate)}
                </span>
              </div>
            )}

            <div
              className={`relative max-w-3xs w-fit rounded-xl text-white p-0
                ${msg.senderId === user.uid ? "bg-[#245346] ml-auto" : "bg-[#3d3c3f]"}
                ${selectedMessages.includes(msg.id) ? "opacity-80 bg-[#EF3340] cursor-pointer" : ""}
              `}
              onClick={() => toggleSelect(msg.id)}
            >
              {/* SELECT BULLET */}
              {/* {deleteMode && (
                <div className="absolute -left-6 top-2">
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      selectedMessages.includes(msg.id)
                        ? "bg-red-500 border-red-500"
                        : "border-gray-400"
                    }`}
                  />
                </div>
              )} */}

              {/* MESSAGE TYPES */}
              {msg.type === "text" && (
                <p className="px-3 py-1">{msg.text}</p>
              )}

              {msg.type === "image" && (
                <img
                  src={msg.mediaUrl}
                  className="p-1 rounded-xl max-w-[240px] cursor-pointer"
                  onClick={() => !deleteMode && setViewer({ type: "image", url: msg.mediaUrl })}
                />
              )}

              {msg.type === "video" && (
                <video
                  src={msg.mediaUrl}
                  controls
                  className="p-1 rounded-xl max-w-[240px]"
                />
              )}

              {/* TIME + TICKS */}
              <div className="w-full flex justify-end px-3 pb-1 space-x-1">
                <span className="text-xs text-gray-300">
                  {formatTime(msg.createdAt)}
                </span>

                {msg.senderId === user.uid && (
                  <CheckCheck
                    size={16}
                    className={msg.read ? "text-sky-400" : "text-gray-500"}
                  />
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
