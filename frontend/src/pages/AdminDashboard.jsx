import { useState, useEffect } from "react";
import axios from "axios";
import Navbaruser from "../components/Navbaruser";
import { 
  FaChartLine, 
  FaListUl, 
  FaUsers, 
  FaFileAlt, 
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
  FaUserFriends,
  FaMapMarkedAlt,
  FaHistory
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

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
        
        const [analyticsRes, complaintsRes] = await Promise.all([
          axios.get("http://localhost:5000/admin/analytics", config),
          axios.get("http://localhost:5000/complaints")
        ]);
        setData(analyticsRes.data);
        setComplaints(complaintsRes.data.complaints || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userRole]);

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/admin/export", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.complaints;
      const headers = ["ID", "Title", "Type", "Status", "Priority", "Reporter", "Assigned To", "Date"];
      const rows = data.map(c => [
        c._id, c.title, c.issue_type || "Misc", c.status, c.priority || "Normal",
        c.user_id?.name || "Anonymous", c.assigned_to?.name || "Unassigned",
        new Date(c.created_at).toLocaleDateString()
      ]);
      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `clean_street_full_report_${new Date().toLocaleDateString()}.csv`;
      link.click();
    } catch (err) { alert("Export failed"); }
  };

  const chartData = data?.categoryDistribution?.map(c => ({ name: c._id || "Other", value: c.count })) || [];
  const barData = data?.statusDistribution?.map(s => ({ name: s._id.toUpperCase(), count: s.count })) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbaruser />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white min-h-[calc(100vh-64px)] border-r border-gray-100 p-6 sticky top-16 hidden lg:block">
          <div className="flex items-center gap-3 mb-10 px-2">
            <FaShieldAlt className="text-blue-600 text-xl" />
            <h2 className="font-bold text-gray-800 text-lg">Admin Panel</h2>
          </div>
          <nav className="space-y-2">
            <SidebarLink icon={<FaChartLine />} label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
            <Link to="/manage-complaints" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium">
              <FaListUl /> Manage Complaints
            </Link>
            <Link to="/user-management" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium">
              <FaUsers /> Users
            </Link>
            <Link to="/zone-management" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium">
              <FaMapMarkedAlt /> Zones
            </Link>
            <button onClick={handleExportCSV} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium">
              <FaFileAlt /> Download Report
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 lg:p-12 overflow-hidden">
          <header className="mb-10 flex justify-between items-end">
            <div>
               <h1 className="text-3xl font-bold text-gray-900 mb-1">System Intelligence</h1>
               <p className="text-gray-400 font-medium">Real-time civic monitoring and analytics</p>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard icon={<FaListUl className="text-blue-500" />} label="Total Reports" value={data?.metrics?.totalComplaints || 0} />
            <StatCard icon={<FaClock className="text-amber-500" />} label="Active Queue" value={data?.metrics?.pendingComplaints || 0} />
            <StatCard icon={<FaUserFriends className="text-emerald-500" />} label="Community Size" value={data?.metrics?.totalUsers || 0} />
            <StatCard icon={<FaCheckCircle className="text-gray-900" />} label="Resolved Today" value={data?.metrics?.resolvedToday || 0} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
            {/* Visual Analytics */}
            <div className="xl:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
               <h3 className="font-bold text-gray-800 mb-8">Issue Categorization</h3>
               <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                      <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '12px', border: 'none', shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
               <h3 className="font-bold text-gray-800 mb-8">Service Status</h3>
               <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={barData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count">
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>

          {/* Global Monitoring Map */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-10">
            <div className="flex justify-between items-center mb-8">
               <h3 className="font-bold text-gray-800 flex items-center gap-2">
                 <FaMapMarkedAlt className="text-blue-600" /> Global Issue Map
               </h3>
               <span className="text-xs bg-gray-50 text-gray-400 font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Live View</span>
            </div>
            <div className="h-[400px] rounded-2xl overflow-hidden border border-gray-100 relative z-0">
               <MapContainer center={[13.0827, 80.2707]} zoom={12} style={{ height: "100%", width: "100%" }}>
                 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                 {complaints.filter(c => c.location_coords).map(c => {
                   const [lat, lng] = c.location_coords.split(",").map(Number);
                   return (
                     <Marker key={c._id} position={[lat, lng]}>
                       <Popup>
                         <div className="p-1">
                           <h4 className="font-bold text-blue-600 m-0">{c.title}</h4>
                           <p className="text-xs text-gray-500 m-0 mt-1">{c.status.toUpperCase()}</p>
                         </div>
                       </Popup>
                     </Marker>
                   );
                 })}
               </MapContainer>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-gray-50 flex items-center gap-2 font-bold text-gray-800">
                <FaHistory className="text-blue-500" /> System Activity
             </div>
             <div className="divide-y divide-gray-50">
                {data?.recentLogs?.map(log => (
                  <div key={log._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                           {log.user_id?.name?.charAt(0) || "A"}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-gray-800">{log.action}</p>
                           <p className="text-xs text-gray-400 font-medium">by {log.user_id?.name || "System"}</p>
                        </div>
                     </div>
                     <span className="text-xs font-bold text-gray-300 uppercase tracking-tighter">
                       {new Date(log.timestamp).toLocaleTimeString()}
                     </span>
                  </div>
                ))}
                {(!data?.recentLogs || data.recentLogs.length === 0) && (
                  <div className="p-12 text-center text-gray-400 italic">No recent activities logged</div>
                )}
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarLink = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}`}>
    <span className="text-lg">{icon}</span> {label}
  </button>
);

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
    <div className="flex justify-between items-start mb-4">
       <div className="p-3 rounded-xl bg-gray-50">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</div>
  </div>
);

export default AdminDashboard;
