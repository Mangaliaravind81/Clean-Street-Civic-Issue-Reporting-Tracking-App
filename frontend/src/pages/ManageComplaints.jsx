import { useState, useEffect } from "react";
import axios from "axios";
import Navbaruser from "../components/Navbaruser";
import { 
  FaTasks, 
  FaTrashAlt, 
  FaUserPlus, 
  FaExclamationCircle,
  FaCheckCircle,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaMapMarkerAlt
} from "react-icons/fa";
import AdminSidebar from "../components/AdminSidebar";

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [nearbyModal, setNearbyModal] = useState(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (userRole !== "admin") {
      window.location.href = "/dashboard";
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [compRes, volRes] = await Promise.all([
          axios.get("http://localhost:5000/complaints"),
          axios.get("http://localhost:5000/users/volunteers", config)
        ]);
        setComplaints(compRes.data.complaints || []);
        setVolunteers(volRes.data.volunteers || []);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userRole]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:5000/complaints/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(complaints.map(c => c._id === id ? { ...c, status } : c));
      alert("Status updated!");
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleAssign = async (id, volunteer_id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(`http://localhost:5000/complaints/${id}`, { volunteer_id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(complaints.map(c => {
        if (c._id === id) {
          const matchedVol = volunteers.find(v => String(v._id) === String(volunteer_id));
          return { ...res.data.complaint, assigned_to: matchedVol || res.data.complaint.assigned_to };
        }
        return c;
      }));
    } catch (err) {
      alert("Assignment failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this complaint permanently?")) return;
    try {
      await axios.delete(`http://localhost:5000/complaints/${id}`);
      setComplaints(complaints.filter(c => c._id !== id));
      alert("Complaint deleted");
    } catch (err) {
      alert("Deletion failed");
    }
  };

  const filtered = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FaSpinner className="animate-spin text-3xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbaruser />

      <div className="flex lg:h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto w-full">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <FaTasks className="text-blue-600" />
                Manage Complaints
              </h1>
              <p className="text-gray-500">Monitor, assign, and resolve community issues</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                />
              </div>
              <div className="relative">
                <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-11 pr-8 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium w-full sm:w-auto"
                >
                  <option value="All">All Status</option>
                  <option value="received">Received</option>
                  <option value="in_review">In Review</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Issue Details</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Assigned To</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Assigned By</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{c.title}</span>
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                          {c.address ? c.address.substring(0, 40) + '...' : 'No address provided'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-medium">
                      <select 
                        value={c.status}
                        onChange={(e) => handleUpdateStatus(c._id, e.target.value)}
                        className={`text-xs font-bold px-3 py-2 rounded-xl outline-none border transition-all ${
                          c.status === 'resolved' ? 'bg-green-50 border-green-100 text-green-600' :
                          c.status === 'in_review' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                          'bg-yellow-50 border-yellow-100 text-yellow-600'
                        }`}
                      >
                        <option value="received">RECEIVED</option>
                        <option value="in_review">IN REVIEW</option>
                        <option value="resolved">RESOLVED</option>
                      </select>
                    </td>
                    <td className="px-6 py-6">
                      <button 
                        onClick={() => setNearbyModal(c)}
                        className={`flex items-center gap-2 px-4 py-2 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm cursor-pointer ${c.assigned_to ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100' : 'bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-slate-800'}`}
                      >
                        <FaUserPlus />
                        {c.assigned_to?.name || "Assign Staff"}
                      </button>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-sm font-bold text-gray-700">
                        {c.assigned_by?.name || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <button 
                        onClick={() => handleDelete(c._id)}
                        className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="p-20 text-center">
               <FaExclamationCircle className="text-gray-100 text-6xl mx-auto mb-4" />
               <p className="text-gray-400 font-medium">No complaints found matching your criteria</p>
            </div>
          )}
        </div>
      </main>

      {/* NEARBY VOLUNTEERS MODAL */}
      {nearbyModal && (() => {
        const [cLat, cLng] = nearbyModal.location_coords.split(',').map(Number);
        
        const sortedVolunteers = [...volunteers].map(v => {
          let distance = Infinity;
          if (v.location_coords) {
            const [vLat, vLng] = v.location_coords.split(',').map(Number);
            distance = calculateDistance(cLat, cLng, vLat, vLng);
          }
          return { ...v, distance };
        }).filter(v => v.distance <= 20).sort((a, b) => a.distance - b.distance);

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 sticky top-0">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Nearby Volunteers</h3>
                  <p className="text-sm text-gray-500 font-medium line-clamp-1">For: {nearbyModal.title}</p>
                </div>
                <button 
                  onClick={() => setNearbyModal(null)} 
                  className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="overflow-y-auto p-4 scrollbar-hide bg-slate-50/50 flex-grow">
                <div className="space-y-3">
                  {sortedVolunteers.map(v => (
                    <div key={v._id} className="bg-white border border-gray-100 p-5 rounded-3xl flex items-center justify-between hover:border-blue-200 transition-all shadow-sm group">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-black text-lg shadow-inner overflow-hidden shrink-0">
                             {v.profile_photo ? (
                               <img src={v.profile_photo} alt={v.name} className="w-full h-full object-cover" />
                             ) : (
                               v.name?.charAt(0)?.toUpperCase() || 'V'
                             )}
                          </div>
                          <div className="min-w-0">
                             <p className="font-bold text-gray-800 truncate">{v.name || 'Unknown Volunteer'}</p>
                             {(v.email || v.phone_number) && (
                               <p className="text-[10px] font-medium text-gray-500 mt-0.5 truncate max-w-[220px]">
                                 {v.email} {v.email && v.phone_number && '|'} {v.phone_number}
                               </p>
                             )}
                             <div className="flex items-center gap-1.5 mt-0.5">
                                <FaMapMarkerAlt className={v.distance < 5 ? "text-emerald-500 shrink-0" : "text-gray-400 shrink-0"} size={10} />
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[200px]">
                                  {v.location ? `${v.location} ` : ""}
                                  <span className={v.distance < 5 ? "text-emerald-400/70" : "text-gray-300"}>({v.distance === Infinity ? "Unknown" : `${v.distance.toFixed(1)} km`})</span>
                                </p>
                             </div>
                          </div>
                       </div>
                       <button 
                        onClick={() => {
                          handleAssign(nearbyModal._id, v._id);
                          setNearbyModal(null);
                        }}
                        className="px-5 py-2.5 bg-gray-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-95 cursor-pointer opacity-80 group-hover:opacity-100"
                       >
                         Assign
                       </button>
                    </div>
                  ))}
                  {sortedVolunteers.length === 0 && (
                    <div className="p-12 text-center text-gray-400 font-medium bg-white rounded-3xl border border-dashed border-gray-200">
                      No volunteers available in the system.
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 bg-white border-t border-gray-50 text-center">
                 <p className="text-xs text-gray-400 font-medium">Displaying volunteers sorted by proximity to the issue.</p>
              </div>
            </div>
          </div>
        );
      })()}

      </div>
    </div>
  );
};

export default ManageComplaints;
