import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";
import Profile from "./pages/Profile";
import ViewComplaints from "./pages/ViewComplaints";
import UserManagement from "./pages/UserManagement";
import AdminDashboard from "./pages/AdminDashboard";
import ManageComplaints from "./pages/ManageComplaints";
import ZoneManagement from "./pages/ZoneManagement";
import Feedback from "./pages/Feedback";
import AdminFeedbacks from "./pages/AdminFeedbacks";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/report-issue" element={<ReportIssue />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/view-complaints" element={<ViewComplaints />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/user-management" element={<UserManagement />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin-feedbacks" element={<AdminFeedbacks />} />
      <Route path="/manage-complaints" element={<ManageComplaints />} />
      <Route path="/zone-management" element={<ZoneManagement />} />
    </Routes>
  );
}

export default App;
