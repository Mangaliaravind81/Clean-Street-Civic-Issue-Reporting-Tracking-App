import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Logo from "../assets/logo.png";
import { Bell } from "lucide-react";
import NotificationModal from "./NotificationModal";
import axios from "axios";

const linkClass = ({ isActive }) =>
  isActive
    ? "text-green-600 font-semibold"
    : "text-gray-600 hover:text-green-600";

const Navbaruser = () => {
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchNotifications();
      // Poll for notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/notifications/mark-all-read`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <nav className="sticky top-0 z-[9999] bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <img src={Logo} alt="Logo" className="h-10 w-auto" />
          <span className="text-green-600 font-bold text-xl">Clean Street</span>
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>

          {localStorage.getItem("userRole") !== "volunteer" &&
            localStorage.getItem("userRole") !== "admin" && (
              <NavLink to="/report-issue" className={linkClass}>
                Report Issue
              </NavLink>
            )}

          <NavLink to="/view-complaints" className={linkClass}>
            View Complaints
          </NavLink>

          {localStorage.getItem("userRole") !== "admin" && (
            <NavLink to="/feedback" className={linkClass}>
              Feedback
            </NavLink>
          )}

          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>

          {localStorage.getItem("userRole") === "admin" && (
            <>
              <NavLink to="/admin-dashboard" className={linkClass}>
                Admin
              </NavLink>
              <NavLink to="/admin-feedbacks" className={linkClass}>
                Feedbacks & FAQs
              </NavLink>
            </>
          )}

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1 text-gray-600 hover:text-green-600 transition-colors cursor-pointer relative"
              title="Notifications"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-600 font-medium transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-2xl cursor-pointer"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t px-4 py-4 flex flex-col gap-3 bg-white">
          <NavLink to="/dashboard" onClick={() => setOpen(false)}>
            Dashboard
          </NavLink>

          {localStorage.getItem("userRole") !== "volunteer" &&
            localStorage.getItem("userRole") !== "admin" && (
              <NavLink to="/report-issue" onClick={() => setOpen(false)}>
                Report Issue
              </NavLink>
            )}

          <NavLink to="/view-complaints" onClick={() => setOpen(false)}>
            View Complaints
          </NavLink>

          {localStorage.getItem("userRole") !== "admin" && (
            <NavLink to="/feedback" onClick={() => setOpen(false)}>
              Feedback
            </NavLink>
          )}

          <NavLink to="/profile" onClick={() => setOpen(false)}>
            Profile
          </NavLink>

          {localStorage.getItem("userRole") === "admin" && (
            <>
              <NavLink to="/admin-dashboard" onClick={() => setOpen(false)}>
                Admin
              </NavLink>
              <NavLink to="/admin-feedbacks" onClick={() => setOpen(false)}>
                Feedbacks & FAQs
              </NavLink>
            </>
          )}

          <button
            onClick={() => {
              handleLogout();
              setOpen(false);
            }}
            className="text-left py-2 text-red-600 font-bold border-t border-gray-100 mt-2 "
          >
            Sign Out
          </button>
        </div>
      )}

      {showNotifications && (
        <NotificationModal
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
        />
      )}
    </nav>
  );
};

export default Navbaruser;
