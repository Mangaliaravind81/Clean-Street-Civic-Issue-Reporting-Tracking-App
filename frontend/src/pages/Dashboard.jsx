import { useEffect, useState } from "react";
import Navbaruser from "../components/Navbaruser";
import { Link } from "react-router-dom";
import axios from "axios";
import { 
  FaPlus, 
  FaSearch, 
  FaUser, 
  FaShieldAlt, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaArrowRight
} from "react-icons/fa";

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  const userRole = localStorage.getItem("userRole"); 
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (userRole === "admin") {
          const token = localStorage.getItem("token");
          const res = await axios.get("http://localhost:5000/admin/analytics", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAnalytics(res.data.metrics);
          const compRes = await axios.get("http://localhost:5000/complaints");
          setIssues(compRes.data.complaints || []);
        } else {
          const compRes = await axios.get("http://localhost:5000/complaints");
          let myIssues = compRes.data.complaints || [];
          if (userRole === "user") {
             myIssues = myIssues.filter(c => c.user_id && c.user_id._id === userId);
          } else if (userRole === "volunteer") {
             myIssues = myIssues.filter(c => c.assigned_to && c.assigned_to._id === userId);
          }
          setIssues(myIssues);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    fetchDashboardData();
  }, [userRole, userId]);

  const pending = issues.filter((i) => i.status === "received").length;
  const progress = issues.filter((i) => i.status === "in_review").length;
  const resolved = issues.filter((i) => i.status === "resolved").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbaruser />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Welcome back 👋</h1>
            <p className="text-gray-400 font-medium">Tracking your impact in the community</p>
          </div>
          {userRole === "admin" && (
            <Link
              to="/admin-dashboard"
              className="group flex items-center gap-3 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
            >
              <FaShieldAlt /> Open Admin Portal <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {userRole === "admin" && analytics ? (
             <>
              <StatCard title="System Total" value={analytics.totalComplaints} icon={<FaExclamationCircle className="text-blue-500" />} />
              <StatCard title="Total Resolved" value={analytics.resolvedComplaints} icon={<FaCheckCircle className="text-emerald-500" />} />
              <StatCard title="Active Users" value={analytics.totalUsers} icon={<FaUser className="text-gray-400" />} />
              <StatCard title="Volunteers" value={analytics.totalVolunteers} icon={<FaShieldAlt className="text-purple-500" />} />
             </>
          ) : (
            <>
              <StatCard title="My Reports" value={issues.length} icon={<FaExclamationCircle className="text-blue-500" />} />
              <StatCard title="Pending" value={pending} icon={<FaClock className="text-amber-500" />} />
              <StatCard title="In Progress" value={progress} icon={<FaExclamationCircle className="text-purple-500" />} />
              <StatCard title="Resolved" value={resolved} icon={<FaCheckCircle className="text-emerald-500" />} />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 px-2">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
                <ActionCard 
                  to="/report-issue" 
                  title="Report Issue" 
                  desc="Pin a new problem" 
                  icon={<FaPlus />} 
                  color="bg-green-600" 
                />
              <ActionCard 
                to="/view-complaints" 
                title="Browse Feed" 
                desc="See community activity" 
                icon={<FaSearch />} 
                color="bg-white border text-gray-700" 
              />
              <ActionCard 
                to="/profile" 
                title="Your Profile" 
                desc="Manage account" 
                icon={<FaUser />} 
                color="bg-white border text-gray-700" 
              />
            </div>
          </div>

          {/* Recent Reports Table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-center px-2">
               <h2 className="text-xl font-bold text-gray-800">Recent Updates</h2>
               <Link to="/view-complaints" className="text-sm font-bold text-blue-600 hover:underline">View all</Link>
            </div>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50 border-b border-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Issue</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:table-cell">Category</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right hidden md:table-cell">Reported</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {issues.slice(0, 6).map((issue) => (
                      <tr key={issue._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-5">
                          <p className="font-bold text-gray-800">{issue.title}</p>
                          <p className="text-xs text-gray-400 md:hidden">{new Date(issue.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-5 hidden sm:table-cell">
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg uppercase">
                            {issue.issue_type || "Misc"}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border ${getStatusStyles(issue.status)}`}>
                            {issue.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right text-sm text-gray-400 font-medium hidden md:table-cell">
                          {new Date(issue.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {issues.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic font-medium">
                          No recent activity found. Click "Report Issue" to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
    <div>
      <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-3xl font-black text-gray-900">{value}</p>
    </div>
    <div className="p-4 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform">
      {icon}
    </div>
  </div>
);

const ActionCard = ({ to, title, desc, icon, color }) => (
  <Link to={to} className={`${color} p-6 rounded-3xl shadow-sm flex items-center gap-5 transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95`}>
    <div className={`p-4 rounded-2xl ${color.includes('bg-white') ? 'bg-blue-50 text-blue-600' : 'bg-white/20 text-white'}`}>
       {icon}
    </div>
    <div>
       <h3 className="font-bold">{title}</h3>
       <p className={`text-xs ${color.includes('bg-white') ? 'text-gray-400' : 'text-white/70'} font-medium`}>{desc}</p>
    </div>
  </Link>
);

const getStatusStyles = (status) => {
  if (status === "resolved") return "bg-emerald-50 border-emerald-100 text-emerald-600";
  if (status === "in_review") return "bg-blue-50 border-blue-100 text-blue-600";
  return "bg-amber-50 border-amber-100 text-amber-600";
};

export default Dashboard;
