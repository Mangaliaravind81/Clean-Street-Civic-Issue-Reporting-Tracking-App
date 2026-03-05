

import { useEffect, useState } from "react";
import axios from "axios";
import Navbaruser from "../components/Navbaruser";
import { FaRegComment, FaSearch, FaFilter, FaMapMarkerAlt, FaCalendarAlt, FaChevronRight } from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { BiLike, BiDislike, BiMapAlt } from "react-icons/bi";
import { MdOutlineDelete, MdErrorOutline } from "react-icons/md";
import { LuPencil } from "react-icons/lu";
import { FaRegSave, FaExpand, FaCheck, FaTimes, FaMapPin } from "react-icons/fa";

const Viewcomplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [previewState, setPreviewState] = useState({ isOpen: false, images: [], index: 0 });
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [filterType, setFilterType] = useState("All Types");
  const [volunteers, setVolunteers] = useState([]); // In real app, fetch this
  const [searchTerm, setSearchTerm] = useState("");

  const userRole = localStorage.getItem("userRole"); // 'user', 'volunteer', 'admin'

  const fetchComplaints = async () => {
    const res = await axios.get("http://localhost:5000/complaints");
    setComplaints(res.data.complaints || []);
  };

  const [staffLocation, setStaffLocation] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      await fetchComplaints();
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (token && userId) {
        const uRes = await axios.get(`http://localhost:5000/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (uRes.data.user.location_coords) {
          const [lat, lng] = uRes.data.user.location_coords.split(",").map(Number);
          setStaffLocation({ lat, lng });
        }
      }
    };

    loadData();
  }, []);

  // Sync selected item when complaints list updates (e.g., after adding a comment or liking)
  useEffect(() => {
    if (selected) {
      const updated = complaints.find(c => c._id === selected._id);
      if (updated) {
        setSelected(updated);
      }
    }
  }, [complaints]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  const userId = localStorage.getItem("userId");
  
  const like = async (id) => {
    const token = localStorage.getItem("token");
    await axios.post(`http://localhost:5000/complaints/${id}/votes`, { 
      user_id: userId, 
      vote_type: "upvote" 
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchComplaints();
  };

  const unlike = async (id) => {
    const token = localStorage.getItem("token");
    await axios.post(`http://localhost:5000/complaints/${id}/votes`, { 
      user_id: userId, 
      vote_type: "downvote" 
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchComplaints();
  };

  const addComment = async (id) => {
    if (!comment.trim()) return;
    const token = localStorage.getItem("token");
    await axios.post(`http://localhost:5000/complaints/${id}/comments`, {
      user_id: userId,
      content: comment,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setComment("");
    fetchComplaints();
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setPreviewState(prev => ({
      ...prev,
      index: (prev.index + 1) % prev.images.length
    }));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setPreviewState(prev => ({
      ...prev,
      index: (prev.index - 1 + prev.images.length) % prev.images.length
    }));
  };

  const openPreview = (images, initialIndex = 0) => {
    const imagesArray = Array.isArray(images) ? images : [images];
    setPreviewState({
      isOpen: true,
      images: imagesArray,
      index: initialIndex
    });
  };

  const deleteComplaint = async (id) => {
    if (window.confirm("Delete this complaint?")) {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComplaints();
      setSelected(null);
    }
  };

  const updateComplaint = async () => {
    try {
      const token = localStorage.getItem("token");
      const resUpdate = await axios.patch(
        `http://localhost:5000/complaints/${selected._id}`,
        editData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (resUpdate.data.success) {
        alert("Complaint updated successfully!");
        await fetchComplaints();
        const res = await axios.get(`http://localhost:5000/complaints/${selected._id}`);
        setSelected(res.data.complaint);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("Update failed");
    }
  };

  const startEditing = () => {
    setEditData({
      title: selected.title,
      description: selected.description,
      address: selected.address,
      landmark: selected.landmark || "",
      issue_type: selected.issue_type,
      priority: selected.priority,
    });
    setIsEditing(true);
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:5000/complaints/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchComplaints();
    } catch(err) {
      console.error("Status update error:", err);
      const msg = err.response?.data?.message || err.message || "Status update failed";
      alert(msg);
    }
  };

  const assignComplaint = async (id) => {
    let volId = userId; // Default to self for volunteers

    if (userRole === "admin") {
      volId = prompt("Enter Volunteer/Authority ID to Assign:");
      if (!volId) return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:5000/complaints/${id}`, { volunteer_id: volId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(userRole === "admin" ? "Complaint Assigned" : "Task Accepted Successfully");
      await fetchComplaints();
      setSelected(null);
    } catch(err) {
      alert("Assignment failed");
    }
  };

  const rejectComplaint = async (id) => {
    if (!window.confirm("Reject this complaint? It will be hidden for you.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:5000/complaints/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Complaint Rejected");
      await fetchComplaints();
      setSelected(null);
    } catch(err) {
      alert("Rejection failed");
    }
  };

  const filteredComplaints = complaints.filter((item) => {
    const isRejectedByMe = item.rejected_by?.some(u => u._id === userId);
    if ((userRole === 'volunteer' || userRole === 'admin') && isRejectedByMe) return false;

    let proximityMatch = true;
    if (filterStatus === "Nearby (20km)" && staffLocation) {
        if (!item.location_coords) return false;
        const [cLat, cLng] = item.location_coords.split(",").map(Number);
        const dist = calculateDistance(staffLocation.lat, staffLocation.lng, cLat, cLng);
        proximityMatch = dist <= 20;
    }

    const statusMatch = filterStatus === "All Status" || filterStatus === "Nearby (20km)" || item.status.toLowerCase() === filterStatus.toLowerCase();
    const typeMatch = filterType === "All Types" || item.issue_type === filterType;
    const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.address.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && typeMatch && proximityMatch && searchMatch;
  });

  const getIssueIcon = (type) => {
    switch (type) {
      case "Garbage": return "🗑️";
      case "Road": return "🕳️";
      case "Water": return "💧";
      case "Lighting": return "💡";
      default: return "📍";
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "received": return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "in_review": return "bg-amber-500/10 text-amber-600 border-amber-200";
      case "resolved": return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      default: return "bg-slate-500/10 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      <Navbaruser />

      {/* Hero Header Section */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Live Community Feed
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                Civic <span className="text-blue-600">Impact</span> Hub
              </h1>
              <p className="text-slate-500 max-w-xl text-lg font-medium">
                Real-time visibility into local issues. Track progress, support solutions, and connect with your community.
              </p>
            </div>
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
              <div className="px-6 py-3 border-r border-slate-200 text-center">
                <div className="text-2xl font-black text-slate-900">{complaints.length}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Reports</div>
              </div>
              <div className="px-6 py-3 text-center">
                <div className="text-2xl font-black text-emerald-500">
                  {complaints.filter(c => c.status === 'resolved').length}
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Resolved</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar - Floating Glassmorphism Effect */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-slate-200/50 rounded-3xl p-4 flex flex-col lg:flex-row gap-4">
          <div className="flex-grow relative group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search by title, description, or location..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold appearance-none cursor-pointer text-slate-700 min-w-[160px]"
              >
                <option>All Status</option>
                {(userRole === 'admin' || userRole === 'volunteer') && <option value="Nearby (20km)">Nearby (20km)</option>}
                <option value="received">Pending</option>
                <option value="in_review">In Review</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="relative">
              <BiMapAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base" />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold appearance-none cursor-pointer text-slate-700 min-w-[160px]"
              >
                <option>All Types</option>
                <option>Garbage</option>
                <option>Road</option>
                <option>Water</option>
                <option>Lighting</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {filteredComplaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <MdErrorOutline className="text-4xl text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No reports found</h3>
            <p className="text-slate-500 mt-2 max-w-sm">
              We couldn't find any issues matching your current filters or search query. Try adjusting your criteria.
            </p>
            <button 
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("All Status");
                setFilterType("All Types");
              }}
              className="mt-6 text-blue-600 font-bold text-sm hover:underline hover:text-blue-700 cursor-pointer transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredComplaints.map((item) => (
            <div 
              key={item._id} 
              className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
            >
              <div className="p-5 flex-grow relative">
                <div className="absolute top-5 right-5">
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </div>
                </div>

                <div className="flex items-start gap-3 mb-3 max-w-[80%]">
                  <div className="relative">
                    <span className="text-xl bg-slate-50 w-10 h-10 flex items-center justify-center rounded-xl shadow-inner group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-300 flex-shrink-0">
                      {getIssueIcon(item.issue_type)}
                    </span>
                    {item.comments?.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[7px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-bounce">
                        {item.comments.length}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-md font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <p className="text-slate-500 text-[13px] mb-4 line-clamp-2 leading-tight font-medium">
                  {item.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                    <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center">
                      <FaMapMarkerAlt className="text-slate-400 group-hover:text-blue-500 transition-colors scale-90" />
                    </div>
                    <span className="line-clamp-1">{item.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                    <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center">
                      <FaCalendarAlt className="text-slate-400 group-hover:text-blue-500 transition-colors scale-90" />
                    </div>
                    {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                {/* Side-by-Side Contact Details */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-all duration-300">
                  {/* Reporter Details */}
                  {item.user_id ? (
                    <div className="flex items-center gap-2.5 min-w-0 pr-3 border-r border-slate-200/50">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                        <FaSearch className="text-slate-400 text-[10px]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Reporter</span>
                        <span className="text-[10px] font-black text-slate-700 truncate">{item.user_id.name}</span>
                        {(userRole === 'volunteer' || userRole === 'admin') && (
                          <a href={`mailto:${item.user_id.email}`} className="text-[9px] font-bold text-slate-400 truncate hover:text-blue-600 transition-colors">
                            {item.user_id.email}
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 opacity-50 border-r border-slate-200/50">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <MdErrorOutline className="text-[10px] text-slate-400" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400">Anonymous</span>
                    </div>
                  )}

                  {/* Impact Team Details */}
                  {item.assigned_to ? (
                    <div className="flex items-center gap-2.5 min-w-0 pl-1">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200">
                        <FaCheck className="text-white text-[10px]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 leading-none mb-1">Impact Team</span>
                        <span className="text-[10px] font-black text-slate-700 truncate">{item.assigned_to.name}</span>
                        <a href={`mailto:${item.assigned_to.email}`} className="text-[9px] font-bold text-slate-400 truncate hover:text-blue-600 transition-colors">
                          {item.assigned_to.email}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 opacity-60 pl-1">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                        <FaRegSave className="text-slate-400 text-[10px]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Staff</span>
                        <span className="text-[10px] font-bold text-slate-500 italic">Assigning...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status & Action for Admin/Volunteers */}
                {(userRole === 'admin' || userRole === 'volunteer') && (
                  <div className="mt-4 p-3 bg-white rounded-xl border border-slate-100 space-y-2">
                    {(userRole === 'admin' || (userRole === 'volunteer' && item.assigned_to?._id === userId)) ? (
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Control Center</span>
                        <select 
                          className="text-xs font-bold bg-slate-50 border-none rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
                          value={item.status} 
                          onChange={(e) => updateStatus(item._id, e.target.value)}
                        >
                          <option value="received">Received</option>
                          <option value="in_review">In Review</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    ) : null}

                    <div className="flex gap-2">
                       {!item.assigned_to && (
                        <div className="flex gap-2 w-full">
                          {(() => {
                            let distance = null;
                            if (staffLocation && item.location_coords) {
                              const [lat, lng] = item.location_coords.split(',').map(Number);
                              distance = calculateDistance(staffLocation.lat, staffLocation.lng, lat, lng);
                            }

                            if (userRole === 'volunteer') {
                              if (distance !== null && distance <= 20) {
                                return (
                                  <div className="flex gap-2 w-full">
                                    <button 
                                      onClick={() => assignComplaint(item._id)}
                                      className="flex-grow text-[10px] bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 font-black tracking-widest transition-all shadow-lg shadow-blue-200 cursor-pointer hover:scale-[1.02] active:scale-95"
                                    >
                                      ACCEPT TASK
                                    </button>
                                    <button 
                                      onClick={() => rejectComplaint(item._id)}
                                      className="flex-grow text-[10px] bg-white text-rose-600 border border-rose-100 px-4 py-2.5 rounded-xl hover:bg-rose-50 font-black tracking-widest transition-all cursor-pointer hover:border-rose-300 hover:scale-[1.02] active:scale-95"
                                    >
                                      REJECT
                                    </button>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="w-full text-center p-3 bg-slate-100 rounded-xl">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                      {distance !== null ? `Too Far (${distance.toFixed(1)}km)` : 'Location Unknown'}
                                    </span>
                                  </div>
                                );
                              }
                            } else if (userRole === 'admin') {
                              return (
                                <button 
                                  onClick={() => assignComplaint(item._id)}
                                  className="w-full text-[10px] bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-blue-600 font-black tracking-widest transition-all shadow-lg shadow-blue-200 cursor-pointer hover:scale-[1.02] active:scale-95"
                                >
                                  ASSIGN TO STAFF
                                </button>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center px-6">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => like(item._id)}
                    className="flex items-center gap-1.5 group/btn cursor-pointer transition-all hover:scale-110"
                  >
                    <div className="p-2 rounded-xl bg-white border border-slate-200 group-hover/btn:bg-blue-50 group-hover/btn:border-blue-200 transition-all shadow-sm">
                      <BiLike className="text-lg text-slate-400 group-hover/btn:text-blue-600" />
                    </div>
                    <span className="text-xs font-black text-slate-500 group-hover/btn:text-blue-600">{item.upvotes || 0}</span>
                  </button>
                  <button 
                    onClick={() => unlike(item._id)}
                    className="flex items-center gap-1.5 group/btn cursor-pointer transition-all hover:scale-110"
                  >
                    <div className="p-2 rounded-xl bg-white border border-slate-200 group-hover/btn:bg-rose-50 group-hover/btn:border-rose-200 transition-all shadow-sm">
                      <BiDislike className="text-lg text-slate-400 group-hover/btn:text-rose-600" />
                    </div>
                    <span className="text-xs font-black text-slate-500 group-hover/btn:text-rose-600">{item.downvotes || 0}</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelected(item)}
                    className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 cursor-pointer group/comm shadow-sm"
                    title="View Comments"
                  >
                    <FaRegComment className="text-[12px] group-hover/comm:scale-110 transition-transform" />
                  </button>
                  <button 
                    onClick={() => setSelected(item)}
                    className="group/more flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all duration-300 cursor-pointer"
                  >
                    Details
                    <FaChevronRight className="group-hover/more:translate-x-1 transition-transform scale-90" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

      {selected && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex justify-center items-center z-[10000] p-4 transition-all duration-500">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden relative rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row border border-white">
            <button
              onClick={() => {
                setSelected(null);
                setIsEditing(false);
              }}
              className="absolute top-6 right-6 z-20 p-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl hover:bg-rose-50 hover:text-rose-500 transition-all duration-300 group cursor-pointer"
            >
              <IoIosCloseCircleOutline className="text-2xl" />
            </button>

            {/* Modal Left: Image & Map Overlay */}
            <div className="w-full md:w-[45%] h-80 md:h-auto bg-slate-100 relative group/img overflow-hidden">
              {selected.photo || (selected.images && selected.images.length > 0) ? (
                <>
                  <img
                    src={Array.isArray(selected.photo) ? selected.photo[0] : (selected.photo || (selected.images && selected.images[0]))}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700"
                    alt="Complaint"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"></div>
                  <button 
                    onClick={() => openPreview(selected.photo || selected.images)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-300 cursor-pointer"
                  >
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-2xl text-white font-bold text-sm flex items-center gap-2 transform translate-y-4 group-hover/img:translate-y-0 transition-transform duration-300">
                      <FaExpand className="text-base" />
                      View Full Resolution
                    </div>
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50 gap-4">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center">
                    <MdErrorOutline className="text-2xl" />
                  </div>
                  <span className="text-xs font-black tracking-widest uppercase">No Image Provided</span>
                </div>
              )}
              
              {/* Map Badge */}
              <div className="absolute bottom-6 left-6 right-6 h-40 rounded-3xl overflow-hidden border-2 border-white shadow-2xl z-10 cursor-default">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://maps.google.com/maps?q=${selected.location_coords}&z=15&output=embed`}
                  className="transition-all duration-700"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-800 shadow-sm flex items-center gap-2">
                  <FaMapPin className="text-rose-500" />
                  Live Location
                </div>
              </div>
            </div>

            {/* Modal Right: Details & Comments */}
            <div className="w-full md:w-[55%] p-10 overflow-y-auto flex flex-col bg-slate-50/30">
              {!isEditing ? (
                <div className="mb-10 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(selected.status)}`}>
                      {selected.status.replace('_', ' ')}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <FaCalendarAlt />
                      {new Date(selected.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>

                  <h2 className="text-3xl font-black text-slate-900 mb-4 leading-tight">
                    {selected.title}
                  </h2>

                  <div className="flex flex-wrap gap-2 mb-8">
                    <span className="bg-white border border-slate-200 px-4 py-2 rounded-2xl text-xs font-black text-slate-600 uppercase tracking-wider shadow-sm flex items-center gap-2">
                      <span className="text-lg">{getIssueIcon(selected.issue_type)}</span>
                      {selected.issue_type}
                    </span>
                    <span className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border shadow-sm flex items-center gap-2 ${selected.priority === 'High' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-white border-slate-200 text-slate-600'}`}>
                      <div className={`w-2 h-2 rounded-full ${selected.priority === 'High' ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'}`}></div>
                      {selected.priority} Priority
                    </span>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Description</h3>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {selected.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="flex items-start gap-4 group/loc">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0 group-hover/loc:bg-blue-600 group-hover/loc:text-white transition-all duration-300">
                        <FaMapMarkerAlt />
                      </div>
                      <div className="pt-1">
                         <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Precise Location</h4>
                         <p className="text-slate-700 font-bold leading-tight">{selected.address}</p>
                         {selected.landmark && (
                           <p className="text-[11px] text-slate-400 font-medium mt-1 italic">near {selected.landmark}</p>
                         )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group/rep">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0 group-hover/rep:bg-emerald-500 group-hover/rep:text-white transition-all duration-300">
                        <FaCheck />
                      </div>
                      <div className="pt-1">
                         <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Details</h4>
                         {/* Volunteers/Admins see Reporter */}
                         {(userRole === 'volunteer' || userRole === 'admin') ? (
                           <>
                             <p className="text-slate-700 font-bold leading-tight">Reporter: {selected.user_id?.name || "Verified Citizen"}</p>
                             <a 
                               href={`mailto:${selected.user_id?.email}`}
                               className="text-[11px] text-slate-400 font-medium mt-1 block hover:text-blue-600 transition-colors cursor-pointer"
                             >
                               {selected.user_id?.email || "Email Hidden"}
                             </a>
                           </>
                         ) : selected.assigned_to ? (
                           /* Public sees Volunteer */
                           <>
                             <p className="text-slate-700 font-bold leading-tight">Handled By: {selected.assigned_to.name}</p>
                             <a 
                               href={`mailto:${selected.assigned_to.email}`}
                               className="text-[11px] text-slate-400 font-medium mt-1 block hover:text-blue-600 transition-colors cursor-pointer"
                             >
                               {selected.assigned_to.email}
                             </a>
                           </>
                         ) : (
                           /* Public sees Reporter Name Only */
                           <>
                             <p className="text-slate-700 font-bold leading-tight cursor-pointer" >Reporter: {selected.user_id?.name || "Verified Citizen"}</p>
                             <p className="text-[11px] text-slate-400 font-medium mt-1 italic italic">Under Community Review</p>
                           </>
                         )}
                      </div>
                    </div>

                    {selected.rejected_by && selected.rejected_by.length > 0 && (userRole === 'volunteer' || userRole === 'admin') && (
                      <div className="flex items-start gap-4 group/rej mt-4">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0 group-hover/rej:bg-rose-500 group-hover/rej:text-white transition-all duration-300">
                          <MdErrorOutline />
                        </div>
                        <div className="pt-1">
                           <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rejected By</h4>
                           <div className="flex flex-wrap gap-1 mt-1">
                             {selected.rejected_by.map(u => (
                               <span key={u._id} className="text-[10px] font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded border border-rose-100 uppercase">
                                 {u.name}
                               </span>
                             ))}
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-10 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h2 className="text-2xl font-black text-slate-900 italic">Adjust <span className="text-blue-600 text-not-italic">Report Details</span></h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Editing Mode</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="group/field">
                      <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest group-focus-within/field:text-blue-600 transition-colors">Issue Title</label>
                      <input 
                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                        value={editData.title}
                        onChange={(e) => setEditData({...editData, title: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Category</label>
                        <select 
                          className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                          value={editData.issue_type}
                          onChange={(e) => setEditData({...editData, issue_type: e.target.value})}
                        >
                          <option>Garbage</option>
                          <option>Road</option>
                          <option>Water</option>
                          <option>Lighting</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Urgency</label>
                        <select 
                          className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                          value={editData.priority}
                          onChange={(e) => setEditData({...editData, priority: e.target.value})}
                        >
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Description</label>
                      <textarea 
                        className="w-full bg-white border border-slate-200 rounded-[2rem] px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none h-32 resize-none transition-all shadow-sm"
                        value={editData.description}
                        onChange={(e) => setEditData({...editData, description: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mb-10 pt-8 border-t border-slate-100">
                {!isEditing ? (
                  <>
                    {(userId === selected.user_id?._id || userRole === 'admin') && (
                      <button 
                        onClick={startEditing}
                        className="flex items-center gap-3 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer"
                      >
                        <LuPencil className="text-base" /> Edit Report
                      </button>
                    )}
                    {(userId === selected.user_id?._id || userRole === 'admin') && (
                       <button 
                         onClick={() => deleteComplaint(selected._id)}
                         className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all duration-300 ml-auto cursor-pointer"
                       >
                         <MdOutlineDelete className="text-xl" /> Delete
                       </button>
                    )}
                  </>
                ) : (
                  <>
                    <button 
                      onClick={updateComplaint}
                      className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 transition-all duration-300 cursor-pointer"
                    >
                      <FaRegSave className="text-base" /> Save Updates
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="bg-slate-100 text-slate-500 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all duration-300 cursor-pointer"
                    >
                      Discard
                    </button>
                  </>
                )}
              </div>

              {/* Discussion Section */}
              <div className="flex-grow flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-6">
                   <h4 className="font-black text-slate-800 flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
                    <FaRegComment className="text-blue-500" /> Community Discussion
                  </h4>
                  <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">
                    {selected.comments?.length || 0} MESSAGES
                  </span>
                </div>
                
                <div className="space-y-4 mb-4 overflow-y-auto pr-2 custom-scrollbar flex-grow min-h-[150px]">
                  {selected.comments && selected.comments.length > 0 ? (
                    selected.comments.map((c) => (
                      <div key={c._id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative group/msg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-black text-[10px] text-blue-600 uppercase tracking-widest">{c.user_id?.name || "Community Member"}</span>
                          <span className="text-[9px] font-bold text-slate-300 uppercase">{new Date(c.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{c.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                       <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No comments yet</p>
                    </div>
                  )}
                </div>

                <div className="mt-auto relative">
                  <input
                    className="w-full bg-white border-2 border-slate-100 rounded-3xl pl-6 pr-16 py-5 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-lg shadow-slate-200/50"
                    placeholder="Contribute to the discussion..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addComment(selected._id)}
                  />
                  <button
                    onClick={() => addComment(selected._id)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-blue-200 cursor-pointer"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-45" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* FULL SCREEN IMAGE POPUP */}
      {previewState.isOpen && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[20000] p-4 cursor-pointer"
          onClick={() => setPreviewState({ ...previewState, isOpen: false })}
        >
          <div className="relative max-w-5xl w-full flex flex-col items-center">
            <button
               onClick={() => setPreviewState({ ...previewState, isOpen: false })}
               className="absolute -top-12 right-0 text-white font-bold text-xl hover:text-blue-400 transition-colors cursor-pointer"
            >
              Close ✕
            </button>
            
            <div className="relative w-full flex items-center justify-center group/preview">
              {previewState.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 z-10 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all cursor-pointer border border-white/10 shadow-2xl"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 z-10 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all cursor-pointer border border-white/10 shadow-2xl"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              
              <img 
                src={previewState.images[previewState.index]} 
                alt="Full Clarity" 
                className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain border-4 border-white/10"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
              {previewState.images.length > 1 && (
                <div className="flex gap-2">
                  {previewState.images.map((_, i) => (
                    <button 
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewState(prev => ({ ...prev, index: i }));
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${previewState.index === i ? 'bg-blue-500 scale-125 shadow-lg shadow-blue-500/50' : 'bg-white/30 hover:bg-white/50'}`}
                    />
                  ))}
                </div>
              )}
              <div className="flex flex-col items-center gap-1">
                <p className="text-white/80 text-sm font-black uppercase tracking-[0.2em]">
                  Image {previewState.index + 1} of {previewState.images.length}
                </p>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Click anywhere outside to close</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Viewcomplaints;
