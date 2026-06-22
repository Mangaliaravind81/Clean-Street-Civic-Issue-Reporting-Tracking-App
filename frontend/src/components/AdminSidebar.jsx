import { useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { FaChartLine, FaListUl, FaUsers, FaMapMarkedAlt, FaHistory, FaFileAlt, FaShieldAlt } from "react-icons/fa";
import axios from "axios";

const AdminSidebar = () => {
  const location = useLocation();
  const path = location.pathname;
  const [showActivity, setShowActivity] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const handleShowActivity = async () => {
    setShowActivity(true);
    setLoadingLogs(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentLogs(res.data.recentLogs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/admin/export", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.complaints;
      const headers = ["Title", "Type", "Status", "Priority", "Reporter", "Assigned To", "Date", "Time"];
      
      const rows = data.map(c => {
        const dateObj = c.created_at ? new Date(c.created_at) : (c.createdAt ? new Date(c.createdAt) : null);
        const dateStr = dateObj && !isNaN(dateObj) ? dateObj.toLocaleDateString() : "N/A";
        const timeStr = dateObj && !isNaN(dateObj) ? dateObj.toLocaleTimeString() : "N/A";

        return [
          c.title || "Untitled",
          c.issue_type || "Misc",
          c.status || "Unknown",
          c.priority || "Normal",
          c.user_id?.name || "Anonymous",
          c.assigned_to?.name || "Unassigned",
          dateStr,
          timeStr
        ].map(val => {
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        });
      });

      const csvContent = [headers.map(h => `"${h}"`), ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `clean_street_report_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
      link.click();
    } catch (err) { alert("Export failed"); }
  };

  const SidebarLink = ({ to, icon, label, active }) => (
    <Link to={to} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}`}>
      <span className="text-lg">{icon}</span> {label}
    </Link>
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-100 p-6 hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
      <div className="flex items-center gap-3 mb-10 px-2">
        <FaShieldAlt className="text-blue-600 text-xl" />
        <h2 className="font-bold text-gray-800 text-lg">Admin Panel</h2>
      </div>
      <nav className="space-y-2">
        <SidebarLink to="/admin-dashboard" icon={<FaChartLine />} label="Overview" active={path === "/admin-dashboard"} />
        <SidebarLink to="/manage-complaints" icon={<FaListUl />} label="Manage Complaints" active={path === "/manage-complaints"} />
        <SidebarLink to="/user-management" icon={<FaUsers />} label="Users" active={path === "/user-management"} />
        {/* <SidebarLink to="/zone-management" icon={<FaMapMarkedAlt />} label="Zones" active={path === "/zone-management"} /> */}
        <button 
          onClick={handleShowActivity} 
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium cursor-pointer"
        >
          <FaHistory className="text-blue-500" /> Admin Changes Activity
        </button>
        <button onClick={handleExportCSV} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium cursor-pointer">
          <FaFileAlt /> Download Report
        </button>
      </nav>
      {showActivity && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[10000] flex items-center justify-center p-4 overflow-hidden animate-in fade-in duration-300">
          <div 
            className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col border border-white overflow-hidden animate-in slide-in-from-bottom-8 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-gray-50 flex items-center justify-between font-bold text-gray-800 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <FaHistory className="text-blue-500" /> Admin Modification Activity Audit
              </div>
              <button 
                onClick={() => setShowActivity(false)}
                className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 flex-grow scrollbar-hide bg-slate-50/30">
              {loadingLogs ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentLogs?.map(log => (
                    <div key={log._id} className="bg-white border border-gray-100 p-6 rounded-3xl flex items-center justify-between hover:border-blue-200 transition-all shadow-sm">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-lg shadow-inner">
                             {log.user_id?.name?.charAt(0) || "A"}
                          </div>
                          <div>
                             <p className="text-sm font-black text-gray-800">{log.action}</p>
                             <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-0.5">by {log.user_id?.name || "System"}</p>
                          </div>
                       </div>
                       <div className="text-right">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                           {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </p>
                         <p className="text-[9px] font-bold text-gray-300 uppercase mt-1">
                           {new Date(log.timestamp).toLocaleDateString()}
                         </p>
                       </div>
                    </div>
                  ))}
                  {(!recentLogs || recentLogs.length === 0) && (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                         <FaHistory className="text-2xl" />
                      </div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No activities found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
               <button 
                onClick={() => setShowActivity(false)}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 cursor-pointer"
               >
                 Close Portal
               </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
};

export default AdminSidebar;
