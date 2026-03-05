import { useState, useEffect } from "react";
import Navbaruser from "../components/Navbaruser";
import axios from "axios";
import { FaUserShield, FaUserEdit, FaTrashAlt, FaSearch, FaUserTag } from "react-icons/fa";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");

  const adminId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (userRole !== "admin") {
      window.location.href = "/dashboard";
      return;
    }

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data.users);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [userRole]);

  const handleUpdateRole = async (id, newRole) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(`http://localhost:5000/users/${id}`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(u => u._id === id ? res.data.user : u));
      alert("User role updated successfully!");
    } catch (err) {
      alert("Failed to update user role");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u._id !== id));
      alert("User deleted successfully!");
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "All" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbaruser />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2 flex items-center gap-3">
              <FaUserShield className="text-blue-600" />
              User Management
            </h1>
            <p className="text-gray-500 font-medium">Manage permissions and moderate community members</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
             <div className="relative group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all w-full sm:w-64"
              />
            </div>
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold"
            >
              <option value="All">All Roles</option>
              <option value="user">Citizen</option>
              <option value="volunteer">Volunteer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">Member</th>
                  <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shadow-inner">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{u.name}</p>
                          <p className="text-sm text-gray-400 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <select 
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                        className={`text-xs font-bold px-3 py-2 rounded-xl outline-none border-2 transition-all ${
                          u.role === 'admin' ? 'bg-purple-50 border-purple-100 text-purple-600' : 
                          u.role === 'volunteer' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                          'bg-blue-50 border-blue-100 text-blue-600'
                        }`}
                      >
                        <option value="user">CITIZEN</option>
                        <option value="volunteer">VOLUNTEER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Account"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FaSearch className="text-gray-200 text-3xl" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">No members found</h3>
              <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserManagement;
