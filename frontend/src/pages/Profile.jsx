import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Navbaruser from "../components/Navbaruser";
import { 
  FaUserCircle, 
  FaCamera, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaUserAlt, 
  FaEnvelope, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaIdBadge,
  FaRegUser,
  FaRegEnvelope,
  FaLock,
  FaShieldAlt,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaTrash
} from "react-icons/fa";
import { MdOutlineNotes } from "react-icons/md";
import MapComponent from "../components/MapComponent";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phone_number: "",
    location: "",
    bio: "",
    profile_photo: "",
    location_coords: "",
  });
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passData, setPassData] = useState({ current: "", new: "", confirm: "" });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [account, setAccount] = useState(false);
  const fileInputRef = useRef(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = res.data.user;
        setUser(userData);
        setFormData({
          name: userData.name || "",
          username: userData.username || "",
          phone_number: userData.phone_number || "",
          location: userData.location || "",
          bio: userData.bio || "",
          profile_photo: userData.profile_photo || "",
          location_coords: userData.location_coords || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      const data = new FormData();
      data.append("name", formData.name);
      data.append("username", formData.username);
      data.append("phone_number", formData.phone_number);
      data.append("location", formData.location);
      data.append("bio", formData.bio);
      if (formData.location_coords) {
        data.append("location_coords", formData.location_coords);
      }
      if (photoFile) {
        data.append("profile_photo", photoFile);
      } else if (removePhoto) {
        data.append("profile_photo", "");
      }

      const res = await axios.patch(`http://localhost:5000/users/${userId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
      setIsEditing(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      setRemovePhoto(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return alert("Passwords do not match");

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/users/change-password", {
        currentPassword: passData.current,
        newPassword: passData.new
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Password updated successfully!");
      setShowPasswordModal(false);
      setPassData({ current: "", new: "", confirm: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update password");
    }
  };

  const getInitials = (name) => {
    if (!name) return "DU";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbaruser />

      <main className="container mx-auto px-4 py-8 lg:py-8 max-w-6xl">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User profile</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
          {/* Left Sidebar Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col items-center text-center lg:sticky lg:top-8 z-10">
             <div className="relative mb-6">
                <input 
                  type="file" 
                  accept="image/*" 
                  hidden 
                  ref={fileInputRef} 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setPhotoFile(file);
                      setPhotoPreview(URL.createObjectURL(file));
                      setIsEditing(true);
                    }
                  }} 
                />
                <div 
                   className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-md overflow-hidden cursor-pointer"
                   onClick={() => {
                     if (photoPreview) setFullScreenImage(photoPreview);
                     else if (user?.profile_photo && !removePhoto) setFullScreenImage(user.profile_photo);
                   }}
                >
                   {photoPreview ? (
                     <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                   ) : user?.profile_photo && !removePhoto ? (
                     <img src={user.profile_photo} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     getInitials(user?.name)
                   )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2 bg-white border border-gray-100 rounded-full shadow-lg text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                  title="Change Photo"
                >
                  <FaCamera size={14} />
                </button>
                {(photoPreview || (user?.profile_photo && !removePhoto)) && (
                   <button 
                     onClick={() => {
                       setPhotoFile(null);
                       setPhotoPreview(null);
                       setRemovePhoto(true);
                       setIsEditing(true);
                     }}
                     className="absolute bottom-1 left-1 p-2 bg-white border border-gray-100 rounded-full shadow-lg text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                     title="Remove Photo"
                   >
                     <FaTrash size={14} />
                   </button>
                )}
             </div>

             <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.name}</h2>
             <p className="text-gray-400 font-medium mb-6">@{user?.username || 'no_username'}</p>

             <span className="px-5 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider mb-6">
                {user?.role === 'admin' ? 'Admin' : user?.role === 'volunteer' ? 'Volunteer' : 'Citizen'}
             </span>

             <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
                {user?.bio || "Active citizen helping to improve our community through CleanStreet reporting."}
             </p>

             <div className="text-sm text-gray-300 font-medium border-t border-gray-50 pt-6 w-full">
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '7/3/2025'}
             </div>
          </div>

          {/* Right Content Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-8 lg:p-12 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div className="flex gap-4 items-center">
                 <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                    <FaRegUser size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-gray-900">Account Information</h3>
                    <p className="text-sm text-gray-400 font-medium">Update your personal details</p>
                 </div>
              </div>

              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                >
                  <FaEdit /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                   <button 
                    onClick={handleUpdate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 cursor-pointer"
                  >
                    <FaSave /> Save
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setPhotoFile(null);
                      setPhotoPreview(null);
                      setRemovePhoto(false);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-gray-400 font-bold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleUpdate} className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="flex items-center gap-2 text-sm font-bold text-gray-500">
                        <FaRegUser className="text-blue-500/50" /> Username
                     </label>
                     <input 
                       disabled={!isEditing}
                       type="text"
                       value={formData.username}
                       onChange={(e) => setFormData({...formData, username: e.target.value})}
                       className={`w-full px-5 py-3.5 rounded-xl font-medium transition-all ${isEditing ? 'bg-white border-blue-200 border-2 focus:ring-4 focus:ring-blue-50 shadow-sm' : 'bg-gray-50/50 border-gray-100 border text-gray-400 cursor-not-allowed'}`}
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="flex items-center gap-2 text-sm font-bold text-gray-500">
                        <FaRegEnvelope className="text-blue-500/50" /> Email
                     </label>
                     <input 
                       disabled
                       type="email"
                       value={user?.email || ""}
                       className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl text-gray-400 font-medium cursor-not-allowed"
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="flex items-center gap-2 text-sm font-bold text-gray-500">
                        Full Name
                     </label>
                     <input 
                       disabled={!isEditing}
                       type="text"
                       value={formData.name}
                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                       placeholder="Enter full name"
                       className={`w-full px-5 py-3.5 rounded-xl font-medium transition-all ${isEditing ? 'bg-white border-blue-200 border-2 focus:ring-4 focus:ring-blue-50 shadow-sm' : 'bg-gray-50/50 border-gray-100 border text-gray-400'}`}
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="flex items-center gap-2 text-sm font-bold text-gray-500">
                        <FaPhoneAlt className="text-blue-500/50" /> Phone Number
                     </label>
                     <input 
                       disabled={!isEditing}
                       type="text"
                       value={formData.phone_number}
                       onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                       placeholder="+1-555-123-4567"
                       className={`w-full px-5 py-3.5 rounded-xl font-medium transition-all ${isEditing ? 'bg-white border-blue-200 border-2 focus:ring-4 focus:ring-blue-50 shadow-sm' : 'bg-gray-50/50 border-gray-100 border text-gray-400'}`}
                     />
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-500">
                     <FaMapMarkerAlt className="text-blue-500/50" /> Location
                  </label>
                  <input 
                    disabled={!isEditing}
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Downtown District"
                    className={`w-full px-5 py-3.5 rounded-xl font-medium transition-all ${isEditing ? 'bg-white border-blue-200 border-2 focus:ring-4 focus:ring-blue-50 shadow-sm' : 'bg-gray-50/50 border-gray-100 border text-gray-400'}`}
                  />
               </div>

               <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-500">
                     Bio
                  </label>
                  <textarea 
                    disabled={!isEditing}
                    rows="4"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    className={`w-full px-5 py-3.5 rounded-xl font-medium transition-all resize-none ${isEditing ? 'bg-white border-blue-200 border-2 focus:ring-4 focus:ring-blue-50 shadow-sm' : 'bg-gray-50/50 border-gray-100 border text-gray-400'}`}
                  ></textarea>
               </div>

               {user && (
                 <div className="pt-8 mt-6 border-t border-gray-100 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                               <FaMapMarkerAlt className="text-blue-500" /> HQ Proximity Location
                            </h4>
                            <p className="text-sm text-gray-400 font-medium italic">
                               Click markers or use "Capture GPS" to set your base of operations. 
                            </p>
                            <div className="mt-2 flex gap-2">
                                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase border border-blue-100 shadow-sm">
                                   LAT: {formData.location_coords?.split(',')[0] || "---"}
                                </span>
                                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase border border-blue-100 shadow-sm">
                                   LNG: {formData.location_coords?.split(',')[1] || "---"}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <button 
                              type="button"
                              disabled={!isEditing}
                              onClick={() => {
                                if (navigator.geolocation) {
                                  navigator.geolocation.getCurrentPosition((pos) => {
                                    setFormData({...formData, location_coords: `${pos.coords.latitude},${pos.coords.longitude}`});
                                  }, () => alert("Permission Denied"));
                                }
                              }}
                              className={`flex-grow px-5 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${!isEditing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 cursor-pointer'}`}
                            >
                               <FaMapMarkerAlt /> Auto-Capture GPS
                            </button>
                            <button 
                              type="button"
                              disabled={!isEditing}
                              onClick={() => setShowMap(!showMap)}
                              className={`flex-grow px-5 py-3 rounded-xl font-bold transition-all text-sm border-2 ${!isEditing ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white border-blue-100 text-blue-600 hover:bg-blue-50 cursor-pointer'}`}
                            >
                               {showMap ? "Hide Map" : "Select on Map"}
                            </button>
                        </div>
                    </div>

                    {showMap && isEditing && (
                        <div className="h-80 w-full rounded-2xl overflow-hidden border-2 border-blue-50 relative group">
                            <MapComponent 
                                onLocationChange={(loc) => setFormData({...formData, location_coords: `${loc.lat},${loc.lng}`})}
                            />
                            <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-bold text-blue-600 shadow-xl pointer-events-none">
                                Click anywhere on the map to set location
                            </div>
                        </div>
                    )}
                 </div>
               )}
            </form>

            <div className="mt-12 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <div className="flex gap-4 items-center mb-8">
                    <div className="p-4 bg-red-50 text-red-500 rounded-2xl">
                        <FaLock size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
                        <p className="text-sm text-gray-400 font-medium">Manage your account security and privacy</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={() => setShowPasswordModal(true)}
                        className="flex items-center justify-center gap-2 px-6 py-4 border border-gray-100 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 transition-all shadow-sm group cursor-pointer"
                    >
                        <FaLock className="text-gray-400 group-hover:text-blue-600" />
                        Change Password
                    </button>
                    <button 
                    onClick={() => setAccount(true)}
                    className="flex items-center justify-center gap-2 px-6 py-4 border border-gray-100 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 transition-all shadow-sm group cursor-pointer">
                        <FaShieldAlt className="text-gray-400 group-hover:text-blue-600" />
                        Account Privacy
                    </button>
                </div>
            </div>
            {/* setAccountPrivacy */}
            
            {/* PASSWORD MODAL */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative">
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Update Security</h3>
                        <p className="text-gray-400 text-sm mb-8 font-medium italic">Change your account password securely</p>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1">CURRENT PASSWORD</label>
                                <div className="relative">
                                    <input 
                                        type={showPass.current ? "text" : "password"}
                                        required
                                        className="w-full bg-gray-50 border-gray-100 border-2 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all font-medium"
                                        value={passData.current}
                                        onChange={(e) => setPassData({...passData, current: e.target.value})}
                                    />
                                    <button 
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 cursor-pointer"
                                        onClick={() => setShowPass({...showPass, current: !showPass.current})}
                                    >
                                        {showPass.current ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1">NEW PASSWORD</label>
                                <div className="relative">
                                    <input 
                                        type={showPass.new ? "text" : "password"}
                                        required
                                        className="w-full bg-gray-50 border-gray-100 border-2 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all font-medium"
                                        value={passData.new}
                                        onChange={(e) => setPassData({...passData, new: e.target.value})}
                                    />
                                    <button 
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 cursor-pointer"
                                        onClick={() => setShowPass({...showPass, new: !showPass.new})}
                                    >
                                        {showPass.new ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1">CONFIRM NEW PASSWORD</label>
                                <div className="relative">
                                    <input 
                                        type={showPass.confirm ? "text" : "password"}
                                        required
                                        className="w-full bg-gray-50 border-gray-100 border-2 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all font-medium"
                                        value={passData.confirm}
                                        onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                                    />
                                    <button 
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 cursor-pointer"
                                        onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})}
                                    >
                                        {showPass.confirm ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all border border-gray-100 shadow-sm cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <FaSave /> Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
          </div>
        </div>
      </main>

      {/* ACCOUNT PRIVACY MODAL */}
      {account && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 text-left">
            <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative">
                <div className="mb-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-1">Account Privacy</h3>
                    <p className="text-gray-400 text-sm font-medium italic">Your data and visibility overview</p>
                </div>

                <div className="space-y-5">
                    <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-3">
                            <FaShieldAlt className="text-blue-600" size={18} />
                            <h4 className="font-bold text-gray-900 text-sm">Data Visibility</h4>
                        </div>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                            Your email address and phone number are completely hidden from the public. They are only accessible to administrators to help verify your identity.
                        </p>
                    </div>

                    <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                        <div className="flex items-center gap-3 mb-3">
                            <FaMapMarkerAlt className="text-emerald-600" size={18} />
                            <h4 className="font-bold text-gray-900 text-sm">Location Services</h4>
                        </div>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                            Your location is never tracked in the background. Geolocation is only captured exactly when you choose to report an issue or capture a proximity location.
                        </p>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="button"
                            onClick={() => setAccount(false)}
                            className="w-full px-4 py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-md cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* IMAGE POPUP */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm"
          onClick={() => setFullScreenImage(null)}
        >
          <div
            className="bg-white p-2 rounded-2xl shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setFullScreenImage(null)}
              className="absolute -top-12 right-0 text-white font-bold text-xl hover:text-gray-300 cursor-pointer"
            >
              Close ✕
            </button>
            <img
              src={fullScreenImage}
              alt="Full view"
              className="max-w-full max-h-[80vh] rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
