import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Reportissue from "./pages/Reportissue";
import Profile from "./pages/Profile";
import Viewcomplaints from "./pages/Viewcomplaints";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/Reportissue" element={<Reportissue />} />
      <Route path="/Profile" element={<Profile />} />
      <Route path="/Viewcomplaints" element={<Viewcomplaints />} />
    </Routes>
  );
}

export default App;
