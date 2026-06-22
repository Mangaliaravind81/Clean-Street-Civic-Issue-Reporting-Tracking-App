import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbaruser from "../components/Navbaruser";
import Footer from "../components/Footer";

const faqs = [
  {
    question: "How do I report a new issue?",
    answer: "Go to the 'Report Issue' page, fill in the details like title, description, and location, and upload a photo if possible. Click submit to register your complaint."
  },
  {
    question: "How are volunteers assigned?",
    answer: "Currently, administrators can manually assign registered volunteers to nearby issues from the Manage Complaints page."
  },
  {
    question: "What happens when an issue is resolved?",
    answer: "The user who reported the issue will see its status updated to 'Resolved' and can then provide feedback and a star rating for the responsible volunteer."
  },
  {
    question: "Can I delete a complaint?",
    answer: "Public users can delete their own complaints from the View Complaints page. Admins can delete any complaint if it violates guidelines."
  }
];

const AdminFeedbacks = () => {
  const [appFeedbacks, setAppFeedbacks] = useState([]);
  const [volunteerFeedbacks, setVolunteerFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("complaints");

  const role = localStorage.getItem("userRole");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (role !== "admin") {
      window.location.href = "/dashboard";
      return;
    }
    fetchAppFeedbacks();
    fetchVolunteerFeedbacks();
  }, [role]);

  const fetchAppFeedbacks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/feedbacks/admin/app", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAppFeedbacks(res.data.feedbacks);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVolunteerFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/feedbacks/admin/volunteer", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setVolunteerFeedbacks(res.data.feedbacks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbaruser />
      <div className="flex-1 max-w-6xl mx-auto w-full p-4 mt-6">
        <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight mb-8 text-center">
          Admin Feedback & Support
        </h1>

        <div className="flex justify-center space-x-4 mb-8">
          <button 
            onClick={() => setActiveTab("complaints")}
            className={`px-6 py-2.5 rounded-full font-bold transition cursor-pointer ${activeTab === "complaints" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            Complaint Feedbacks
          </button>
          <button 
            onClick={() => setActiveTab("app")}
            className={`px-6 py-2.5 rounded-full font-bold transition cursor-pointer ${activeTab === "app" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            Application Feedbacks
          </button>
        </div>

        <div className="w-full">
          
          {/* Complaint Feedbacks Tab */}
          {activeTab === "complaints" && (
            <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                 Complaint Feedbacks from Users
              </h2>
              {loading ? (
                 <p className="text-gray-500">Loading feedbacks...</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[800px] overflow-y-auto pr-2">
                  {volunteerFeedbacks.length === 0 ? (
                    <p className="text-gray-500">No complaint feedback received yet.</p>
                  ) : (
                    volunteerFeedbacks.map((fb) => (
                      <div key={fb._id} className="bg-gray-50 p-5 rounded-xl border border-gray-200 flex flex-col justify-between">
                        {/* Complaint Card */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4 flex flex-col sm:flex-row gap-4">
                           {fb.complaint_id?.photo && fb.complaint_id.photo[0] && (
                             <img src={fb.complaint_id.photo[0].startsWith('http') ? fb.complaint_id.photo[0] : `http://localhost:5000${fb.complaint_id.photo[0]}`} alt="Complaint" className="w-full sm:w-28 h-28 object-cover rounded-md flex-shrink-0" />
                           )}
                           <div className="flex-1">
                             <div className="flex justify-between items-start gap-2">
                               <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{fb.complaint_id?.title || "Unknown Complaint"}</h3>
                               <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-[10px] font-bold uppercase flex-shrink-0">{fb.complaint_id?.status}</span>
                             </div>
                             <p className="text-xs text-gray-600 mt-1 line-clamp-2">{fb.complaint_id?.description}</p>
                             <div className="mt-2 flex flex-wrap gap-2">
                               <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100">User: {fb.user_id?.name || "Unknown"}</span>
                               {fb.volunteer_id && (
                                 <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium border border-purple-100">Vol: {fb.volunteer_id.name}</span>
                               )}
                             </div>
                           </div>
                        </div>

                        {/* Feedback Below Complaint */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100 border-l-4 border-l-green-500 relative">
                          <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-bold text-sm cursor-default flex items-center shadow-sm">
                            ⭐ {fb.rating} / 5
                          </div>
                          <h4 className="font-bold text-green-800 mb-2 text-sm uppercase tracking-wide">Resolution Feedback</h4>
                          <p className="text-gray-700 text-sm italic">"{fb.description}"</p>
                          <p className="text-xs text-gray-400 mt-3">{new Date(fb.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          )}

          {/* App Feedbacks Tab */}
          {activeTab === "app" && (
            <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                 Application Feedbacks
              </h2>
              {loading ? (
                 <p className="text-gray-500">Loading feedbacks...</p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {appFeedbacks.length === 0 ? (
                    <p className="text-gray-500">No application feedback received yet.</p>
                  ) : (
                    appFeedbacks.map((fb) => (
                      <div key={fb._id} className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-gray-900">{fb.user_id?.name || "Unknown User"}</p>
                            <p className="text-xs text-gray-500">{fb.user_id?.email}</p>
                          </div>
                          <div className="flex bg-yellow-100 text-yellow-700 px-3 py-1 rounded font-bold text-sm cursor-default">
                            ⭐ {fb.rating} / 5
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm mt-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                          {fb.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 text-right">
                          {new Date(fb.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          )}



        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminFeedbacks;
