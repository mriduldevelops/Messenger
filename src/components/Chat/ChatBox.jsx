import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChat } from "../../context/ChatContext";
import { ChevronLeft, Loader2, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChatBox() {
  const {
    selectedUser,
    setSelectedUser,
    deleteMode,
    setDeleteMode,
    selectedMessages,
    setSelectedMessages
  } = useChat();
  const navigate = useNavigate();

  if (!selectedUser) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  // Cancel delete mode (reset everything)
  const handleCancelDelete = () => {
    setSelectedMessages([]);
    setDeleteMode(false);
  };

  // Delete selected messages
  const handleDeleteSelected = () => {
    const event = new CustomEvent("delete-selected");
    window.dispatchEvent(event);
  };

  // Clear chat fully
  const handleClearChat = () => {
    const event = new CustomEvent("clear-chat");
    window.dispatchEvent(event);
  };

  return (
    <div className="h-screen flex-1 flex flex-col bg-zinc-900 relative">

      {/* HEADER */}
      <div className="p-4 border-b border-gray-700 text-white flex items-center justify-between fixed top-0 w-screen z-20 bg-zinc-900">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedUser(null);
              handleCancelDelete()
              navigate("/");
            }}
            className="text-[#245346]"
          >
            <ChevronLeft size={26} />
          </button>

          {!deleteMode && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src={
                    selectedUser.profilePhoto ||
                    "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                  }
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xl">{selectedUser.fullName}</span>
            </div>
          )}

          {deleteMode && (
            <span className="text-lg text-red-400">
              {selectedMessages.length} selected
            </span>
          )}
        </div>

        {/* RIGHT SIDE BUTTONS */}
        {!deleteMode && (
          <button className="text-white" onClick={() => setDeleteMode(true)}>
            <Trash2 size={20} />
          </button>
        )}

        {deleteMode && (
          <div className="flex items-center gap-3">
            <button className="text-gray-300" onClick={handleClearChat}>
              Clear All
            </button>

            <button className="text-red-400" onClick={handleDeleteSelected}>
              <Trash2 size={20} />
            </button>

            <button className="text-white" onClick={handleCancelDelete}>
              <X size={20} />
            </button>
          </div>
        )}
      </div>
      <div className="my-6"></div>

      {/* MESSAGES & INPUT */}
      <MessageList />
      <MessageInput />
      <div className="my-8"></div>
    </div>
  );
}
