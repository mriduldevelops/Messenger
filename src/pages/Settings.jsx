import { useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { auth } from "../firebase/auth";

export default function Settings() {
    const { user } = useAuth();
    const [fullName, setFullName] = useState(user.fullName || "");
    const [profilePhoto, setProfilePhoto] = useState(user.profilePhoto || "");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const handleSave = async () => {
        try {
            setLoading(true);

            const userRef = doc(db, "users", user.uid);

            await updateDoc(userRef, {
                fullName,
                profilePhoto,
                lastUpdated: new Date(),
            });

            navigate('/')
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // When user selects a new image
    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);

        const url = await uploadToCloudinary(file);
        setProfilePhoto(url);
        setLoading(false);
    };

    const handleLogout = async () => {
        await updateDoc(doc(db, "users", user.uid), {
            online: false,
            lastSeen: serverTimestamp(),
        });
        await signOut(auth);
        navigate('/login');
    }

    // console.log(fullName, profilePhoto)
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-6">
                <h2 className="text-white text-2xl font-bold text-center">Settings</h2>

                {/* PROFILE PHOTO */}
                <div className="flex flex-col items-center">
                    <img
                        src={
                            profilePhoto ||
                            "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                        }
                        className="w-32 h-32 rounded-full object-cover border border-gray-600"
                    />

                    <label className="mt-4 text-green-400 cursor-pointer hover:underline">
                        Change Photo
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoChange}
                        />
                    </label>
                </div>

                {/* FULL NAME */}
                <div>
                    <label className="text-gray-300">Full Name</label>
                    <input
                        type="text"
                        className="w-full mt-1 p-2 rounded bg-gray-700 text-white"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                </div>

                {/* SAVE BUTTON */}
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 p-2 rounded text-white"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>
            <button
                onClick={handleLogout}
                className="mt-4 bg-red-600 px-4 py-2 rounded fixed bottom-5 w-[90%] flex justify-center items-center gap-2"
            >
                <span className="text-lg">Logout</span> <LogOut size={20} />
            </button>
        </div>
    );
}
