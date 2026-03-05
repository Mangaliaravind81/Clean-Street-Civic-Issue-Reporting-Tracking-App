import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Reportissue from "./pages/Reportissue";
import Profile from "./pages/Profile";
import Viewcomplaints from "./pages/Viewcomplaints";
import UserManagement from "./pages/UserManagement";
import AdminDashboard from "./pages/AdminDashboard";
import ManageComplaints from "./pages/ManageComplaints";
import ZoneManagement from "./pages/ZoneManagement";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/report-issue" element={<Reportissue />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/view-complaints" element={<Viewcomplaints />} />
      <Route path="/user-management" element={<UserManagement />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/manage-complaints" element={<ManageComplaints />} />
      <Route path="/zone-management" element={<ZoneManagement />} />
    </Routes>
  );
}

export default App;
