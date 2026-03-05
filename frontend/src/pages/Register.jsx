import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import { NavLink } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmpassword: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ===== Role email validation =====
    if (form.role === "volunteer" && !form.email.endsWith(".in")) {
      alert("Volunteer/Government users must use .in email");
      return;
    }

    if (
      (form.role === "user" || form.role === "admin") &&
      !form.email.endsWith("@gmail.com")
    ) {
      alert("Public (user) or Admin users must use @gmail.com");
      return;
    }

    // ===== Password match =====
    if (form.password !== form.confirmpassword) {
      alert("Both passwords must be same");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.username, // 👈 change username → name
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await res.json();
      setLoading(false);

      alert(data.message);

      if (data.message === "Registered") {
        navigate("/login");
      }
    } catch (err) {
      setLoading(false);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src={Logo} alt="Logo" className="h-10 w-auto" />
            <span className="text-2xl font-bold text-green-600">
              Clean Street
            </span>
          </Link>

          <h2 className="text-xl font-bold mt-2">Create your account</h2>
          <p className="text-gray-500 text-sm">Join the civic community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            placeholder="Enter username"
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
          />

          <Input
            label="Email"
            type="email"
            placeholder="Enter email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />

          <Input
            label="Phone (optional)"
            placeholder="Enter phone"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />

          <div>
            <label className="block text-sm mb-1">Select Role</label>
            <select
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 cursor-pointer"
            >
              <option value="user">Public</option>
              <option value="volunteer">Volunteer/Govt</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Input
            label="Password"
            type="password"
            placeholder="Min 8 characters"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Same password"
            value={form.confirmpassword}
            onChange={(e) => update("confirmpassword", e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition cursor-pointer"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

const Input = ({ label, placeholder, type = "text", value, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
      required
    />
  </div>
);

export default Register;
