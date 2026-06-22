// Admin dashboard updated
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
  FaHistory,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];
import AdminSidebar from "../components/AdminSidebar";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

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

        const [analyticsRes, complaintsRes, zonesRes] = await Promise.all([
          axios.get("http://localhost:5000/admin/analytics", config),
          axios.get("http://localhost:5000/complaints"),
          axios.get("http://localhost:5000/zones", config),
        ]);
        setData(analyticsRes.data);
        setComplaints(complaintsRes.data.complaints || []);
        setZones(zonesRes.data.zones || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userRole]);

  const chartData =
    data?.categoryDistribution?.map((c) => ({
      name: c._id || "Other",
      value: c.count,
    })) || [];
  const barData =
    data?.statusDistribution?.map((s) => ({
      name: s._id.toUpperCase(),
      count: s.count,
    })) || [];
  const roleGroups = { PUBLIC: 0, ADMIN: 0, VOLUNTEERS: 0 };
  data?.roleDistribution?.forEach((r) => {
    const roleStr = String(r._id || "")
      .toLowerCase()
      .trim();
    if (roleStr.includes("admin")) roleGroups.ADMIN += r.count;
    else if (roleStr.includes("volunteer")) roleGroups.VOLUNTEERS += r.count;
    else roleGroups.PUBLIC += r.count; // Group user, public, and defaults into PUBLIC
  });
  const roleData = [
    { name: "PUBLIC", count: roleGroups.PUBLIC },
    { name: "ADMIN", count: roleGroups.ADMIN },
    { name: "VOLUNTEERS", count: roleGroups.VOLUNTEERS },
  ];

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const complaintsTrendData =
    data?.complaintsPerMonth?.map((c) => {
      const year = c._id?.year || new Date().getFullYear();
      const month = c._id?.month || 1;
      return {
        name: `${monthNames[month - 1]} '${year.toString().slice(-2)}`,
        count: c.count,
      };
    }) || [];

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

      <div className="flex lg:h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <header className="mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                System Intelligence
              </h1>
              <p className="text-gray-400 font-medium">
                Real-time civic monitoring and analytics
              </p>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <StatCard
              icon={<FaListUl className="text-blue-500" />}
              label="Total Reports"
              value={data?.metrics?.totalComplaints || 0}
            />
            <StatCard
              icon={<FaUserFriends className="text-emerald-500" />}
              label="Community Size"
              value={data?.metrics?.totalUsers || 0}
            />
            <StatCard
              icon={<FaCheckCircle className="text-gray-900" />}
              label="Resolved Today"
              value={data?.metrics?.resolvedToday || 0}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-10">
            {/* Visual Analytics */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <h3 className="font-bold text-gray-800 mb-2">
                Issue Categorization
              </h3>
              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#F1F5F9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: "#F8FAFC" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        shadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#3B82F6"
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <h3 className="font-bold text-gray-800 mb-2">Service Status</h3>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={barData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {barData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Complaint Trends (6 Months) */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FaChartLine className="text-blue-600" /> Monthly Trends
                </h3>
              </div>
              <div className="h-64 mt-4 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={complaintsTrendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#F1F5F9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 10 }}
                      dy={5}
                    />
                    <YAxis
                      dataKey="count"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#F8FAFC" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        shadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#6366F1"
                      radius={[6, 6, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* User Roles Distribution */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <h3 className="font-bold text-gray-800 mb-2">Community Roles</h3>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roleData} outerRadius={80} dataKey="count">
                      {roleData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[(index + 2) % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      cursor={{ fill: "#F8FAFC" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        shadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
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
              <span className="text-xs bg-gray-50 text-gray-400 font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                Live View
              </span>
            </div>
            <div className="h-[400px] rounded-2xl overflow-hidden border border-gray-100 relative z-0">
              <MapContainer
                center={[13.0827, 80.2707]}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {complaints
                  .filter((c) => c.location_coords)
                  .map((c) => {
                    const [lat, lng] = c.location_coords.split(",").map(Number);
                    return (
                      <Marker key={c._id} position={[lat, lng]}>
                        <Popup>
                          <div className="p-1">
                            <h4 className="font-bold text-blue-600 m-0">
                              {c.title}
                            </h4>
                            <p className="text-xs text-gray-500 m-0 mt-1">
                              {c.status.toUpperCase()}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
              </MapContainer>
            </div>
          </div>

          {/* Recent Activity Modal moved to AdminSidebar */}
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 rounded-lg bg-gray-50 text-sm">{icon}</div>
    </div>
    <div className="text-xl font-bold text-gray-900">{value}</div>
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
      {label}
    </div>
  </div>
);

export default AdminDashboard;
