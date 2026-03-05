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
  FaFilter
} from "react-icons/fa";

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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
      setComplaints(complaints.map(c => c._id === id ? res.data.complaint : c));
      alert("Assigned successfully!");
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

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <FaTasks className="text-blue-600" />
              Manage Complaints
            </h1>
            <p className="text-gray-500">Monitor, assign, and resolve community issues</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
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
                className="pl-11 pr-8 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium"
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
                        <span className="text-[10px] font-bold mt-1 uppercase text-gray-300 tracking-tighter">
                          ID: {c._id}
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
                      <div className="flex items-center gap-2">
                         <FaUserPlus className="text-gray-300" />
                         <select 
                          value={c.assigned_to?._id || ""}
                          onChange={(e) => handleAssign(c._id, e.target.value)}
                          className="bg-transparent text-sm text-gray-600 outline-none focus:text-blue-600 font-medium"
                        >
                          <option value="">Unassigned</option>
                          {volunteers.map(v => (
                            <option key={v._id} value={v._id}>{v.name}</option>
                          ))}
                        </select>
                      </div>
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
    </div>
  );
};

export default ManageComplaints;
