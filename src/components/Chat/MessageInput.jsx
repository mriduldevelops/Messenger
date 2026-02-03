// import { useState } from "react";
// import {
//   addDoc,
//   collection,
//   serverTimestamp,
//   doc,
//   setDoc,
//   updateDoc,
// } from "firebase/firestore";
// import { db } from "../../firebase/firestore";
// import { useAuth } from "../../context/AuthContext";
// import { useChat } from "../../context/ChatContext";

// export default function MessageInput() {
//   const [text, setText] = useState("");
//   const { user } = useAuth();
//   const { selectedUser } = useChat();

//   if (!selectedUser) return null;

//   const chatId =
//     user.uid > selectedUser.uid
//       ? `${user.uid}_${selectedUser.uid}`
//       : `${selectedUser.uid}_${user.uid}`;

//   const sendMessage = async (e) => {
//     e.preventDefault();
//     if (!text.trim()) return;

//     const chatRef = doc(db, "chats", chatId);

//     await setDoc(
//       chatRef,
//       {
//         participants: [user.uid, selectedUser.uid],
//         updatedAt: serverTimestamp(),
//       },
//       { merge: true }
//     );

//     await addDoc(collection(chatRef, "messages"), {
//       senderId: user.uid,
//       text,
//       read: false,
//       createdAt: serverTimestamp(),
//     });

//     await updateDoc(chatRef, {
//       lastMessage: text,
//       updatedAt: serverTimestamp(),
//     });

//     setText("");
//   };

//   return (
//     <form
//       onSubmit={sendMessage}
//       className="p-4 flex gap-2 border-t border-gray-700"
//     >
//       <input
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         className="flex-1 p-2 rounded bg-gray-800 text-white"
//         placeholder="Type a message..."
//       />
//       <button className="bg-blue-600 px-4 rounded text-white">
//         Send
//       </button>
//     </form>
//   );
// }

import { useEffect, useState } from "react";
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
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import { Camera, LoaderCircle, SendHorizontal } from "lucide-react";

export default function MessageInput() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);


  const { user } = useAuth();
  const { selectedUser } = useChat();

  if (!selectedUser) return null;

  const chatId =
    user.uid > selectedUser.uid
      ? `${user.uid}_${selectedUser.uid}`
      : `${selectedUser.uid}_${user.uid}`;

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;

    setLoading(true);
    const chatRef = doc(db, "chats", chatId);

    await setDoc(
      chatRef,
      {
        participants: [user.uid, selectedUser.uid],
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    let messageData = {
      senderId: user.uid,
      createdAt: serverTimestamp(),
      read: false,
    };

    // 📷 Image / 🎥 Video
    if (file) {
      const mediaUrl = await uploadToCloudinary(file);

      messageData = {
        ...messageData,
        type: file.type.startsWith("image") ? "image" : "video",
        mediaUrl,
      };

      await updateDoc(chatRef, {
        lastMessage: file.type.startsWith("image")
          ? "📷 Photo"
          : "🎥 Video",
        updatedAt: serverTimestamp(),
      });
    }
    // ✍ Text
    else {
      messageData = {
        ...messageData,
        type: "text",
        text,
      };

      await updateDoc(chatRef, {
        lastMessage: text,
        updatedAt: serverTimestamp(),
      });
    }

    await addDoc(collection(chatRef, "messages"), messageData);

    setText("");
    setFile(null);
    setPreviewUrl(null);
    setLoading(false);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);



  return (
    <>
      {/* 📷 Media Preview */}
      {previewUrl && (
        <div className="p-3 border-t border-gray-700 bg-gray-900">
          <div className="relative inline-block">
            {file.type.startsWith("image") ? (
              <img
                src={previewUrl}
                className="max-h-48 rounded-lg"
                alt="preview"
              />
            ) : (
              <video
                src={previewUrl}
                className="max-h-48 rounded-lg"
                controls
              />
            )}

            {/* ❌ Remove Preview */}
            <button
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
                setLoading(false);
              }}
              className="absolute -top-2 -right-2 bg-black text-white rounded-full px-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={sendMessage}
        className="p-4 flex gap-2 border-t border-gray-700 items-center"
      >
        <label className="cursor-pointer text-gray-300 text-xl">
          <Camera />
          <input
            type="file"
            accept="image/*,video/*"
            hidden
            onChange={handleFileSelect}
          />
        </label>


        {/* ✍ Text */}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-2 rounded bg-[#3d3c3f] text-white"
          placeholder="Type a message..."
        />

        {/* 🚀 Send */}
        <button
          disabled={loading}
          className="bg-[#245346] px-4 py-2 rounded text-white cursor-pointer"
        >
          {loading ? <div className="animate-spin"><LoaderCircle /></div> : <SendHorizontal />}
        </button>
      </form>
    </>
  );
}

 