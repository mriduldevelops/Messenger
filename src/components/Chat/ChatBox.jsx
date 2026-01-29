import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChat } from "../../context/ChatContext";
import Sidebar from "../Sidebar/Sidebar";
import { ArrowLeft, ChevronLeft } from "lucide-react";

export default function ChatBox() {
    const { selectedUser, setSelectedUser } = useChat();

    if (!selectedUser) {
        return (
            <Sidebar />
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-gray-900">
            <div className="p-4 border-b border-gray-700 text-white flex  items-center gap-2">
                <button onClick={() => setSelectedUser(null)} className="text-blue-600"><ChevronLeft size={20} /></button>
                <span className="text-lg">
                    {selectedUser.username}
                </span>
            </div>

            <MessageList />
            <MessageInput />
        </div>
    );
}
