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
        <div className="h-screen flex-1 flex flex-col bg-zinc-900">
            <div className="p-4 border-b border-gray-700 text-white flex  items-center gap-2">
                <button onClick={() => {
                    setSelectedUser(null);
                    navigate('/');
                }} className="text-[#245346]"><ChevronLeft size={26} /></button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img src={selectedUser.profilePhoto || "https://cdn-icons-png.flaticon.com/512/847/847969.png"} alt="user-fprofile" className="h-full w-full object-cover" />
                    </div>
                    <span className="text-xl">
                        {selectedUser.username}
                    </span>
                </div>
            </div>

            <MessageList />
            <MessageInput />
        </div>
    );
}
