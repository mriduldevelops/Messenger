import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChat } from "../../context/ChatContext";
import Sidebar from "../Sidebar/Sidebar";
import { ArrowLeft, ChevronLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChatBox() {
    const { selectedUser, setSelectedUser } = useChat();
    const navigate = useNavigate();

    if (!selectedUser) {
        return (
            <div className="h-screen w-screen flex justify-center items-center">
                <Loader2 className="animate-spin" size={40} />
            </div>
        );
    }

    return (
        <div className="h-screen flex-1 flex flex-col bg-gray-900">
            <div className="p-4 border-b border-gray-700 text-white flex  items-center gap-2">
                <button onClick={() => {
                    setSelectedUser(null);
                    navigate('/');
                }} className="text-blue-600"><ChevronLeft size={20} /></button>
                <span className="text-lg">
                    {selectedUser.username}
                </span>
            </div>

            <MessageList />
            <MessageInput />
        </div>
    );
}
