import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChat } from "../../context/ChatContext";

export default function ChatBox() {
    const { selectedUser } = useChat();

    if (!selectedUser) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a user to start chatting
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-gray-900">
            <div className="p-4 border-b border-gray-700 text-white">
                {selectedUser.email}
            </div>

            <MessageList />
            <MessageInput />
        </div>
    );
}
