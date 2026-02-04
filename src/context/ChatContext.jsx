import { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [selectedUser, setSelectedUser] = useState(null);

  // NEW STATES FOR DELETE MODE
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);

  return (
    <ChatContext.Provider
      value={{
        selectedUser,
        setSelectedUser,
        deleteMode,
        setDeleteMode,
        selectedMessages,
        setSelectedMessages
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
