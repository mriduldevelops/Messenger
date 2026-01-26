import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

export default function MessageInput() {
  const [text, setText] = useState("");
  const { user } = useAuth();
  const { selectedUser } = useChat();

  if (!selectedUser) return null;

  const chatId =
    user.uid > selectedUser.uid
      ? `${user.uid}_${selectedUser.uid}`
      : `${selectedUser.uid}_${user.uid}`;

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const chatRef = doc(db, "chats", chatId);

    await setDoc(
      chatRef,
      {
        participants: [user.uid, selectedUser.uid],
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await addDoc(collection(chatRef, "messages"), {
      senderId: user.uid,
      text,
      read: false,
      createdAt: serverTimestamp(),
    });

    await updateDoc(chatRef, {
      lastMessage: text,
      updatedAt: serverTimestamp(),
    });

    setText("");
  };

  return (
    <form
      onSubmit={sendMessage}
      className="p-4 flex gap-2 border-t border-gray-700"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 p-2 rounded bg-gray-800 text-white"
        placeholder="Type a message..."
      />
      <button className="bg-blue-600 px-4 rounded text-white">
        Send
      </button>
    </form>
  );
}
