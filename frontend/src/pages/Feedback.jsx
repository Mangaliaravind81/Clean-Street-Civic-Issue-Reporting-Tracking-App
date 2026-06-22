import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbaruser from "../components/Navbaruser";
import Footer from "../components/Footer";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaSearch,
  FaCheck,
  FaRegSave,
  FaChevronRight,
  FaRegComment,
} from "react-icons/fa";
import { MdErrorOutline } from "react-icons/md";
import { BiLike, BiDislike } from "react-icons/bi";

const Feedback = () => {
  const [role, setRole] = useState(localStorage.getItem("userRole"));
  const [complaints, setComplaints] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [appFeedbacks, setAppFeedbacks] = useState([]);
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const [filter, setFilter] = useState("complaints");
  const [loading, setLoading] = useState(true);
  const [selectedIssueType, setSelectedIssueType] = useState("");
  const [selectedComplaintId, setSelectedComplaintId] = useState("");

  // For modal rating (Volunteer)
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [rating, setRating] = useState(5);
  const [description, setDescription] = useState("");

  // For modal rating (App)
  const [showAppFeedbackModal, setShowAppFeedbackModal] = useState(false);
  const [appRating, setAppRating] = useState(5);
  const [appDescription, setAppDescription] = useState("");

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (role === "volunteer") {
      fetchFeedbacks();
    } else if (role !== "admin") {
      fetchComplaints();
      fetchAppFeedbacks();
      fetchUserFeedbacks();
    }
  }, [role]);

  useEffect(() => {
    if (role !== "admin" && role !== "volunteer" && !selectedComplaint) {
      let initialList = [];
      if (filter === "complaints") {
        initialList = complaints.filter((c) => c.status === "resolved");
      } else if (filter === "pending") {
        initialList = complaints.filter((c) => {
          const daysSince =
            (new Date() - new Date(c.created_at)) / (1000 * 60 * 60 * 24);
          return (
            (!c.assigned_to && daysSince > 7) ||
            (c.status !== "resolved" && daysSince > 15)
          );
        });
      }

      if (initialList.length > 0) {
        const latest = initialList[0];
        setSelectedComplaint(latest);
        setSelectedIssueType(latest.issue_type || "Other");
        setSelectedComplaintId(latest._id);
      }
    }
  }, [complaints, filter, role, selectedComplaint]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/feedbacks/volunteer", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setFeedbacks(res.data.feedbacks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppFeedbacks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/feedbacks/app", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setAppFeedbacks(res.data.feedbacks);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserFeedbacks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/feedbacks/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setUserFeedbacks(res.data.feedbacks);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/complaints", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const myComplaints = res.data.complaints.filter(
          (c) =>
            (c.user_id && c.user_id._id === userId) || c.user_id === userId,
        );
        setComplaints(myComplaints);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async (complaintId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/complaints/${complaintId}/escalate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success) {
        alert("Complaint escalated to admin successfully.");
        fetchComplaints();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error escalating complaint");
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      const volunteer_id_value =
        selectedComplaint.assigned_to?._id || selectedComplaint.assigned_to;
      if (!volunteer_id_value) {
        alert("No volunteer assigned to this complaint.");
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/feedbacks",
        {
          complaint_id: selectedComplaint._id,
          volunteer_id: volunteer_id_value,
          rating,
          description,
          feedback_type: "volunteer",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success) {
        alert("Feedback submitted successfully!");
        setShowRatingModal(false);
        setSelectedComplaintId("");
        setSelectedComplaint(null);
        setRating(5);
        setDescription("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting feedback");
    }
  };

  const submitAppFeedback = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/feedbacks",
        {
          rating: appRating,
          description: appDescription,
          feedback_type: "app",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success) {
        alert("App feedback submitted successfully!");
        setShowAppFeedbackModal(false);
        setAppRating(5);
        setAppDescription("");
        fetchAppFeedbacks();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting app feedback");
    }
  };

  const activeComplaints =
    filter === "pending"
      ? complaints.filter((c) => {
          const daysSince =
            (new Date() - new Date(c.created_at)) / (1000 * 60 * 60 * 24);
          return (
            (!c.assigned_to && daysSince > 7) ||
            (c.status !== "resolved" && daysSince > 15)
          );
        })
      : complaints.filter((c) => c.status === "resolved");

  const getIssueIcon = (type) => {
    switch (type) {
      case "Garbage":
        return "🗑️";
      case "Road":
        return "🕳️";
      case "Water":
        return "💧";
      case "Lighting":
        return "💡";
      default:
        return "📍";
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-slate-500/10 text-slate-600 border-slate-200";
    switch (status.toLowerCase()) {
      case "received":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "in_review":
        return "bg-amber-500/10 text-amber-600 border-amber-200";
      case "resolved":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbaruser />
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 mt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-700">
            Feedback Dashboard
          </h1>
          {role !== "admin" && role !== "volunteer" && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFilter("submitted");
                  setSelectedIssueType("");
                  setSelectedComplaintId("");
                  setSelectedComplaint(null);
                }}
                className={`mt-4 md:mt-0 px-4 py-2 rounded shadow transition cursor-pointer font-bold text-xs uppercase tracking-widest ${filter === "submitted" ? "bg-emerald-600 text-white" : "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50"}`}
              >
                Submitted Feedbacks
              </button>
              <button
                onClick={() => {
                  setFilter("app");
                  setSelectedIssueType("");
                  setSelectedComplaintId("");
                  setSelectedComplaint(null);
                }}
                className={`mt-4 md:mt-0 px-4 py-2 rounded shadow transition cursor-pointer font-bold text-xs uppercase tracking-widest ${filter === "app" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"}`}
              >
                App Submitted Feedbacks
              </button>
            </div>
          )}
        </div>

        {role === "volunteer" ? (
          <div className="space-y-6">
            {loading ? (
              <p className="text-gray-500 text-center py-8">
                Loading feedbacks...
              </p>
            ) : (
              <>
                {feedbacks.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100 pb-12">
                    <p className="text-gray-500 font-bold">
                      No feedbacks received yet.
                    </p>
                  </div>
                ) : (
                  <div className="animate-fade-in-up w-full">
                    <h3 className="text-2xl font-black text-gray-800 mb-8 border-b-2 border-gray-100 pb-4">
                      All Received Feedbacks
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 w-full">
                      {feedbacks.map((fb) => (
                        <div
                          key={fb._id}
                          className="bg-transparent flex flex-row gap-3 h-full relative"
                        >
                          {/* LEFT SIDE: Complaint Card */}
                          <div className="w-1/2 flex flex-col">
                            {fb.complaint_id ? (
                              <div className="group bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full w-full hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                                <div className="p-3 flex-grow relative">
                                  <div className="absolute top-2 right-2">
                                    <div
                                      className={`px-1.5 py-0.5 rounded-full text-[6px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(fb.complaint_id.status)}`}
                                    >
                                      {(
                                        fb.complaint_id.status || ""
                                      ).toLowerCase() === "received"
                                        ? "Pending"
                                        : (
                                            fb.complaint_id.status || ""
                                          ).replace("_", " ")}
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-1.5 mb-1.5 max-w-[80%]">
                                    <div className="relative">
                                      <span className="text-sm bg-slate-50 w-6 h-6 flex items-center justify-center rounded-lg shadow-inner flex-shrink-0">
                                        {getIssueIcon(
                                          fb.complaint_id.issue_type,
                                        )}
                                      </span>
                                    </div>
                                    <div>
                                      <h3 className="text-[10px] font-black text-slate-800 leading-tight line-clamp-1 mt-0.5">
                                        {fb.complaint_id.title}
                                      </h3>
                                    </div>
                                  </div>

                                  <p className="text-slate-500 text-[8px] mb-2 line-clamp-2 leading-tight font-medium">
                                    {fb.complaint_id.description}
                                  </p>

                                  <div className="space-y-1 mb-2">
                                    <div className="flex items-center gap-1 text-[7px] font-bold text-slate-400">
                                      <div className="w-4 h-4 rounded-md bg-slate-50 flex items-center justify-center">
                                        <FaMapMarkerAlt className="text-slate-400 scale-75" />
                                      </div>
                                      <span className="line-clamp-1">
                                        {fb.complaint_id.address}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[7px] font-bold text-slate-400">
                                      <div className="w-4 h-4 rounded-md bg-slate-50 flex items-center justify-center">
                                        <FaCalendarAlt className="text-slate-400 scale-75" />
                                      </div>
                                      {new Date(
                                        fb.complaint_id.created_at ||
                                          new Date(),
                                      ).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-1 p-1.5 bg-slate-50 rounded-xl border border-slate-100">
                                    {fb.complaint_id.user_id ? (
                                      <div className="flex items-center gap-1 min-w-0 pr-1 border-r border-slate-200/50">
                                        <div className="w-4 h-4 rounded bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                                          <FaSearch className="text-slate-400 text-[6px]" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                          <span className="text-[5px] font-black uppercase tracking-widest text-slate-400 leading-none mb-0.5">
                                            Reporter
                                          </span>
                                          <span className="text-[6px] font-black text-slate-700 truncate">
                                            {fb.complaint_id.user_id?.name ||
                                              fb.user_id?.name ||
                                              "User"}
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1 opacity-50 border-r border-slate-200/50">
                                        <div className="w-4 h-4 rounded bg-slate-100 flex items-center justify-center">
                                          <MdErrorOutline className="text-[6px] text-slate-400" />
                                        </div>
                                        <span className="text-[5px] font-bold text-slate-400">
                                          Anonymous
                                        </span>
                                      </div>
                                    )}

                                    <div className="flex items-center gap-1 min-w-0 pl-1">
                                      <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-200">
                                        <FaCheck className="text-white text-[6px]" />
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-[5px] font-black uppercase tracking-widest text-blue-500 leading-none mb-0.5">
                                          Assigned
                                        </span>
                                        <span className="text-[6px] font-black text-slate-700 truncate">
                                          You
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-2">
                                <p className="text-gray-400 text-[8px] font-bold">
                                  Details unavailable
                                </p>
                              </div>
                            )}
                          </div>

                          {/* RIGHT SIDE: Feedback Received */}
                          <div className="w-1/2 flex flex-col">
                            <div className="bg-green-50/50 p-3 rounded-3xl border border-green-100 flex-grow shadow-sm flex flex-col justify-center relative hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                              <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-md font-black text-[6px] shadow-sm flex items-center gap-0.5 hover:scale-105 transition-transform">
                                ⭐ {fb.rating}{" "}
                                <span className="text-[5px] text-yellow-600/70">
                                  / 5
                                </span>
                              </div>

                              <h4 className="font-black text-[10px] mb-0.5 text-green-900 tracking-tight">
                                Feedback
                              </h4>
                              <p className="text-[6px] text-green-700 font-medium mb-1.5">
                                You resolved this issue.
                              </p>

                              <div className="bg-white p-2 rounded-xl shadow-sm border border-green-50 relative mt-0.5 flex-grow">
                                <span className="text-xl text-green-200 absolute -top-2 -left-1 font-serif leading-none opacity-50">
                                  "
                                </span>
                                <p className="text-slate-700 text-[7px] font-medium relative z-10 leading-relaxed italic line-clamp-3">
                                  {fb.description}
                                </p>
                              </div>

                              <div className="mt-2 flex items-center gap-1.5 border-t border-green-100 pt-2">
                                {fb.user_id?.profile_photo ? (
                                  <img
                                    src={
                                      fb.user_id.profile_photo.startsWith(
                                        "http",
                                      )
                                        ? fb.user_id.profile_photo
                                        : `http://localhost:5000${fb.user_id.profile_photo}`
                                    }
                                    alt="User"
                                    className="w-5 h-5 rounded-full object-cover border border-green-200 shadow-sm"
                                  />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-black shadow-sm text-[8px]">
                                    {fb.user_id?.name
                                      ? fb.user_id.name.charAt(0).toUpperCase()
                                      : "U"}
                                  </div>
                                )}
                                <div>
                                  <p className="text-[7px] font-black text-slate-800 tracking-wide leading-tight">
                                    {fb.user_id?.name || "Verified Citizen"}
                                  </p>
                                  <p className="text-[5px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                    {new Date(fb.created_at).toLocaleDateString(
                                      undefined,
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      },
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : role !== "admin" ? (
          <div className="w-11/12 md:w-5/6 lg:w-3/4 xl:w-3/5 mx-auto">
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <button
                onClick={() => {
                  setFilter("complaints");
                  setSelectedIssueType("");
                  setSelectedComplaintId("");
                  setSelectedComplaint(null);
                }}
                className={`flex-1 py-2 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm ${filter === "complaints" ? "bg-green-600 text-white shadow-green-200 shadow-lg scale-[1.02]" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-green-600 cursor-pointer"}`}
              >
                Complaint Feedback
              </button>
              <button
                onClick={() => {
                  setFilter("pending");
                  setSelectedIssueType("");
                  setSelectedComplaintId("");
                  setSelectedComplaint(null);
                }}
                className={`flex-1 py-2 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm ${filter === "pending" ? "bg-rose-600 text-white shadow-rose-200 shadow-lg scale-[1.02]" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-rose-600 cursor-pointer"}`}
              >
                Report to Admin
              </button>
              <button
                onClick={() => setShowAppFeedbackModal(true)}
                className={`flex-1 py-2 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-blue-600 cursor-pointer`}
              >
                Give App Feedbacks and FAQs
              </button>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : filter === "app" ? (
              <div className="space-y-4">
                {appFeedbacks.length === 0 ? (
                  <p className="text-gray-500">
                    No app feedback submitted yet.
                  </p>
                ) : (
                  appFeedbacks.map((fb) => (
                    <div
                      key={fb._id}
                      className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row md:items-center justify-between"
                    >
                      <div>
                        <h3 className="font-bold text-lg text-blue-800">
                          Application Feedback
                        </h3>
                        <p className="text-gray-700 mt-2">{fb.description}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(fb.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex bg-yellow-100 text-yellow-700 px-3 py-1 rounded font-bold mt-4 md:mt-0 cursor-default">
                        ⭐ {fb.rating} / 5
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : filter === "submitted" ? (
              <div className="space-y-4">
                {userFeedbacks.length === 0 ? (
                  <p className="text-gray-500">No feedbacks submitted yet.</p>
                ) : (
                  userFeedbacks.map((fb) => (
                    <div
                      key={fb._id}
                      className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row md:items-center justify-between"
                    >
                      <div>
                        <h3 className="font-bold text-lg text-emerald-800">
                          Feedback for: {fb.complaint_id?.title}
                        </h3>
                        <p className="text-sm font-semibold text-gray-600 mb-1">
                          Impact Team: {fb.volunteer_id?.name || "Unknown"}
                        </p>
                        <p className="text-gray-700 mt-2">{fb.description}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(fb.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex bg-yellow-100 text-yellow-700 px-3 py-1 rounded font-bold mt-4 md:mt-0 cursor-default">
                        ⭐ {fb.rating} / 5
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl shadow border border-gray-100 space-y-6">
                {activeComplaints.length === 0 ? (
                  <p className="text-gray-500">No complaints found.</p>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row gap-6 w-full mb-6 bg-slate-50/50 p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                      <div className="flex-1">
                        <label className="block text-[10px] font-black uppercase tracking-widest mb-3 text-slate-400">
                          Select Issue Type
                        </label>
                        <select
                          value={selectedIssueType}
                          onChange={(e) => {
                            setSelectedIssueType(e.target.value);
                            const filtered = activeComplaints.filter(
                              (c) =>
                                e.target.value === "" ||
                                (c.issue_type || "Other") === e.target.value,
                            );
                            if (filtered.length > 0) {
                              setSelectedComplaintId(filtered[0]._id);
                              setSelectedComplaint(filtered[0]);
                            } else {
                              setSelectedComplaintId("");
                              setSelectedComplaint(null);
                            }
                          }}
                          className="w-full border-none p-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 bg-white font-bold text-slate-700 shadow-sm cursor-pointer text-sm"
                        >
                          <option value="">-- All Types --</option>
                          {[
                            ...new Set(
                              activeComplaints.map(
                                (c) => c.issue_type || "Other",
                              ),
                            ),
                          ].map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex-1 animate-fade-in-up">
                        <label className="block text-[10px] font-black uppercase tracking-widest mb-3 text-slate-400">
                          Select Complaint Title
                        </label>
                        <select
                          value={selectedComplaintId}
                          onChange={(e) => {
                            setSelectedComplaintId(e.target.value);
                            const comp = activeComplaints.find(
                              (c) => c._id === e.target.value,
                            );
                            setSelectedComplaint(comp);
                          }}
                          className="w-full border-none p-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 bg-white font-bold text-slate-700 shadow-sm cursor-pointer text-sm"
                        >
                          <option value="">-- Select Report --</option>
                          {activeComplaints
                            .filter((c) =>
                              selectedIssueType
                                ? (c.issue_type || "Other") ===
                                  selectedIssueType
                                : true,
                            )
                            .map((c) => (
                              <option key={c._id} value={c._id}>
                                {c.title} (
                                {c.status.toLowerCase() === "received"
                                  ? "Pending"
                                  : c.status}
                                )
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {selectedComplaintId && selectedComplaint && (
                      <div className="mt-8 border-t border-gray-100 pt-8 animate-fade-in-up grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* LEFT SIDE: Complaint Card */}
                        <div className="h-full">
                          <div className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full w-full">
                            <div className="p-4 flex-grow relative">
                              <div className="absolute top-4 right-4">
                                <div
                                  className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(selectedComplaint.status)}`}
                                >
                                  {selectedComplaint.status.toLowerCase() ===
                                  "received"
                                    ? "Pending"
                                    : selectedComplaint.status.replace(
                                        "_",
                                        " ",
                                      )}
                                </div>
                              </div>

                              <div className="flex items-start gap-2 mb-2 max-w-[80%]">
                                <div className="relative">
                                  <span className="text-lg bg-slate-50 w-8 h-8 flex items-center justify-center rounded-xl shadow-inner flex-shrink-0">
                                    {getIssueIcon(selectedComplaint.issue_type)}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="text-sm font-black text-slate-800 leading-tight line-clamp-1">
                                    {selectedComplaint.title}
                                  </h3>
                                </div>
                              </div>

                              <p className="text-slate-500 text-[11px] mb-3 line-clamp-2 leading-tight font-medium">
                                {selectedComplaint.description}
                              </p>

                              <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                  <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center">
                                    <FaMapMarkerAlt className="text-slate-400 scale-90" />
                                  </div>
                                  <span className="line-clamp-1">
                                    {selectedComplaint.address}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                  <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center">
                                    <FaCalendarAlt className="text-slate-400 scale-90" />
                                  </div>
                                  {new Date(
                                    selectedComplaint.created_at,
                                  ).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>
                              </div>

                              {/* Side-by-Side Contact Details */}
                              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                {/* Reporter Details */}
                                {selectedComplaint.user_id ? (
                                  <div className="flex items-center gap-2.5 min-w-0 pr-3 border-r border-slate-200/50">
                                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                                      <FaSearch className="text-slate-400 text-[10px]" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">
                                        Reporter
                                      </span>
                                      <span className="text-[10px] font-black text-slate-700 truncate">
                                        {selectedComplaint.user_id.name ||
                                          "User"}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2.5 opacity-50 border-r border-slate-200/50">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                      <MdErrorOutline className="text-[10px] text-slate-400" />
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400">
                                      Anonymous
                                    </span>
                                  </div>
                                )}

                                {/* Impact Team Details */}
                                {selectedComplaint.assigned_to ? (
                                  <div className="flex items-center gap-2.5 min-w-0 pl-1">
                                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200">
                                      <FaCheck className="text-white text-[10px]" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 leading-none mb-1">
                                        Impact Team
                                      </span>
                                      <span className="text-[10px] font-black text-slate-700 truncate">
                                        {selectedComplaint.assigned_to.name}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2.5 opacity-60 pl-1">
                                    <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                                      <FaRegSave className="text-slate-400 text-[10px]" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">
                                        Staff
                                      </span>
                                      <span className="text-[10px] font-bold text-slate-500 italic">
                                        Assigning...
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center px-6">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                                    <BiLike className="text-lg text-slate-400" />
                                  </div>
                                  <span className="text-xs font-black text-slate-500">
                                    {selectedComplaint.upvotes || 0}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                                    <BiDislike className="text-lg text-slate-400" />
                                  </div>
                                  <span className="text-xs font-black text-slate-500">
                                    {selectedComplaint.downvotes || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT SIDE: Feedback / Action */}
                        <div className="h-full flex flex-col">
                          {selectedComplaint.status === "resolved" ? (
                            <form
                              onSubmit={submitFeedback}
                              className="bg-green-50 p-6 rounded-[2rem] border border-green-100 flex-grow shadow-sm flex flex-col justify-center"
                            >
                              <h4 className="font-black text-xl mb-4 text-green-800 tracking-tight">
                                Provide Feedback
                              </h4>
                              <div className="mb-4">
                                <label className="block text-xs font-bold mb-2 text-green-900">
                                  Rating (Stars)
                                </label>
                                <select
                                  value={rating}
                                  onChange={(e) =>
                                    setRating(Number(e.target.value))
                                  }
                                  className="w-full border-none p-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 bg-white font-medium text-slate-700 shadow-sm cursor-pointer text-sm"
                                >
                                  <option value={5}>5 - Excellent 🌟</option>
                                  <option value={4}>4 - Good ⭐</option>
                                  <option value={3}>3 - Average 😐</option>
                                  <option value={2}>2 - Poor 👎</option>
                                  <option value={1}>1 - Terrible 😡</option>
                                </select>
                              </div>
                              <div className="mb-6">
                                <label className="block text-xs font-bold mb-2 text-green-900">
                                  Description
                                </label>
                                <textarea
                                  value={description}
                                  onChange={(e) =>
                                    setDescription(e.target.value)
                                  }
                                  className="w-full border-none p-4 rounded-xl h-24 focus:outline-none focus:ring-4 focus:ring-green-500/20 shadow-sm resize-none text-slate-700 font-medium text-sm"
                                  required
                                  placeholder="Share your feedback about the resolution..."
                                ></textarea>
                              </div>
                              <button
                                type="submit"
                                className="w-full bg-green-600 text-white font-black py-3 rounded-xl shadow-md hover:bg-green-700 hover:shadow-lg hover:shadow-green-700/20 transition-all cursor-pointer tracking-widest uppercase text-xs"
                              >
                                Submit Feedback
                              </button>
                            </form>
                          ) : (
                            <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex-grow shadow-sm flex flex-col justify-center items-center text-center">
                              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4">
                                <MdErrorOutline className="text-3xl text-amber-500" />
                              </div>
                              <h4 className="font-black text-xl text-amber-900 mb-2">
                                Complaint Pending
                              </h4>
                              <p className="text-xs text-slate-600 mb-6 max-w-[250px]">
                                You can provide feedback once the complaint is
                                resolved.
                              </p>

                              <button
                                onClick={() =>
                                  handleEscalate(selectedComplaint._id)
                                }
                                disabled={
                                  selectedComplaint.escalation_level === "admin"
                                }
                                className={`w-full max-w-[250px] px-6 py-3 rounded-2xl shadow-md transition-all font-black text-xs tracking-widest ${selectedComplaint.escalation_level === "admin" ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-rose-600 text-white hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-600/20 hover:-translate-y-1 cursor-pointer"}`}
                              >
                                {selectedComplaint.escalation_level === "admin"
                                  ? "ESCALATED TO ADMIN"
                                  : "REPORT TO ADMIN"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <p>Admins do not need access to this page.</p>
        )}
      </div>

      {/* App Feedback Modal */}
      {showAppFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl w-full relative flex flex-col md:flex-row gap-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAppFeedbackModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 font-bold cursor-pointer z-10"
            >
              X
            </button>

            {/* FAQs Side */}
            <div className="md:w-1/2 md:border-r border-gray-100 md:pr-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                <div className="border border-gray-100 p-3 rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-sm mb-1">
                    How do I report a new issue?
                  </h3>
                  <p className="text-xs text-gray-600">
                    Go to the 'Report Issue' page, fill in the details, and
                    upload a photo. Click submit to register your complaint.
                  </p>
                </div>
                <div className="border border-gray-100 p-3 rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-sm mb-1">
                    How are volunteers assigned?
                  </h3>
                  <p className="text-xs text-gray-600">
                    Administrators manually assign registered volunteers to
                    nearby issues.
                  </p>
                </div>
                <div className="border border-gray-100 p-3 rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-sm mb-1">
                    What happens when an issue is resolved?
                  </h3>
                  <p className="text-xs text-gray-600">
                    The status updates to 'Resolved', and you can then provide
                    feedback and rating for the assigned volunteer.
                  </p>
                </div>
                <div className="border border-gray-100 p-3 rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-sm mb-1">
                    Can I escalate a complaint?
                  </h3>
                  <p className="text-xs text-gray-600">
                    Yes, if no action is taken on a pending complaint, click
                    "Report to Admin" on the Feedback Dashboard.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Side */}
            <div className="md:w-1/2 pt-6 md:pt-0">
              <h2 className="text-xl font-bold mb-4 text-blue-800">
                Application Feedback
              </h2>
              <form onSubmit={submitAppFeedback} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Rate the App (Stars)
                  </label>
                  <select
                    value={appRating}
                    onChange={(e) => setAppRating(Number(e.target.value))}
                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Average</option>
                    <option value={2}>2 - Poor</option>
                    <option value={1}>1 - Terrible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Feedback/Suggestions
                  </label>
                  <textarea
                    value={appDescription}
                    onChange={(e) => setAppDescription(e.target.value)}
                    className="w-full border p-2 rounded h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Any changes required or suggestions to improve?"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 cursor-pointer transition mt-2"
                >
                  Submit App Feedback
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Feedback;
