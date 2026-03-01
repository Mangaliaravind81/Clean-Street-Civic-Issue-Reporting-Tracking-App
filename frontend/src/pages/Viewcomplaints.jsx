import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbaruser from "../components/Navbaruser";

const Viewcomplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState("all"); 
  const [searchTerm, setSearchTerm] = useState("");
const [userLocation, setUserLocation] = useState(null);

  const currentUser = localStorage.getItem("user"); // adjust if needed

  const commentRef = useRef(null);

  // Fetch complaints
  const fetchComplaints = async () => {
    try {
      const res = await axios.get("http://localhost:5000/complaints");
      const cleanData = res.data.filter((item) => item !== null);
      setComplaints(cleanData);
    } catch (error) {
      console.log("Error fetching complaints:", error);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    (error) => {
      console.log("Location error:", error);
    }
  );
}, []);

  useEffect(() => {
    if (selected) {
      setComments(selected.comments || []);
      setTimeout(() => {
        commentRef.current?.focus();
      }, 200);
    }
  }, [selected]);

  // 👍 Like
  const handleLike = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/complaints/like/${id}`
      );

      if (res.data.success) {
        setComplaints((prev) =>
          prev.map((c) =>
            c._id === id ? { ...c, likes: res.data.likes } : c
          )
        );

        if (selected?._id === id) {
          setSelected({ ...selected, likes: res.data.likes });
        }
      }
    } catch (error) {
      console.log("Like error:", error);
    }
  };

  // 👎 Unlike
  const handleUnlike = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/complaints/unlike/${id}`
      );

      if (res.data.success) {
        setComplaints((prev) =>
          prev.map((c) =>
            c._id === id ? { ...c, unlikes: res.data.unlikes } : c
          )
        );

        if (selected?._id === id) {
          setSelected({ ...selected, unlikes: res.data.unlikes });
        }
      }
    } catch (error) {
      console.log("Unlike error:", error);
    }
  };

  // 💬 Send Comment
  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/complaints/comment/${selected._id}`,
        { text: commentText }
      );

      if (res.data.success) {
        setComments(res.data.comments);
        setCommentText("");
      }
    } catch (error) {
      console.log("Comment error:", error);
    }
  };

  // ✏ Edit Complaint (Only Owner)
const handleEdit = async (id) => {
  const newTitle = prompt("Enter new title:");
  const newDescription = prompt("Enter new description:");

  if (!newTitle || !newDescription) return;

  try {
    const res = await axios.put(
      `http://localhost:5000/complaints/${id}`,
      {
        title: newTitle,
        description: newDescription,
      }
    );

    if (res.data.success) {
      fetchComplaints();
    }
  } catch (error) {
    console.log("Edit error:", error);
  }
};


// 👷 Volunteer Accept Complaint
const handleAccept = async (id) => {
  try {
    const res = await axios.put(
      `http://localhost:5000/complaints/accept/${id}`
    );

    if (res.data.success) {
      setComplaints((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, status: "In Progress" } : c
        )
      );

      if (selected?._id === id) {
        setSelected({ ...selected, status: "In Progress" });
      }
    }
  } catch (error) {
    console.log("Accept error:", error);
  }
};
// 📏 Calculate distance (Haversine Formula)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in KM

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
  // ✅ FILTER LOGIC
  const filteredComplaints = complaints.filter((c) => {
  // Search filter
  const matchesSearch =
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase());

  if (!matchesSearch) return false;

  if (filter === "mine") return c.postedBy === currentUser;

  if (filter === "pending") return c.status === "Pending";

  if (filter === "progress") return c.status === "In Progress";

  if (filter === "resolved") return c.status === "Resolved";

  if (filter === "nearby" && userLocation) {
    const distance = getDistance(
      userLocation.latitude,
      userLocation.longitude,
      parseFloat(c.latitude),
      parseFloat(c.longitude)
    );

    return distance <= 5; // 5 KM radius
  }

  return true;
});

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbaruser />
{/* ✅ FILTER SECTION */}
<div className="p-10 flex justify-start items-center space-x-6">

  <select
    value={filter}
    onChange={(e) => setFilter(e.target.value)}
    className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md focus:outline-none cursor-pointer"
  >
    <option value="all" style={{ color: "black", backgroundColor: "white" }}>
      All Complaints
    </option>
    <option value="mine" style={{ color: "black", backgroundColor: "white" }}>
      My Complaints
    </option>
    <option value="pending" style={{ color: "black", backgroundColor: "white" }}>
      Pending
    </option>
    <option value="progress" style={{ color: "black", backgroundColor: "white" }}>
      In Progress
    </option>
    <option value="resolved" style={{ color: "black", backgroundColor: "white" }}>
      Resolved
    </option>
  </select>

  {/* Search Bar */}
  <input
    type="text"
    placeholder="Search complaints..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-80 border px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
  />

</div>

      {/* Cards */}
      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComplaints.length === 0 && (
          <p className="text-center col-span-3 text-gray-500">
            No complaints available
          </p>
        )}

        {filteredComplaints.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            {item?.images?.length > 0 && (
              <img
                src={item.images[0]}
                alt="complaint"
                className="w-full h-48 object-cover"
              />
            )}

            <div className="p-4">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  item.status === "Resolved"
                    ? "bg-green-200 text-green-800"
                    : item.status === "In Progress"
                    ? "bg-blue-200 text-blue-800"
                    : "bg-yellow-200 text-yellow-800"
                }`}
              >
                {item?.status || "Pending"}
              </span>

              <h2 className="text-lg font-bold mt-2">
                {item?.title}
              </h2>

              <p className="text-gray-600 text-sm">
                {item?.description}
              </p>

              <p className="text-gray-500 text-sm">
                {item?.address}
              </p>

              <p className="text-gray-500 text-sm mt-1">
                💬 {item.comments?.length || 0} Comments
              </p>

              <div className="mt-4 flex justify-between items-center text-sm">
                <div className="flex gap-6 items-center">
                  <button
                    onClick={() => handleLike(item._id)}
                    className="text-blue-600"
                  >
                    👍 ({item.likes || 0})
                  </button>

                  <button
                    onClick={() => handleUnlike(item._id)}
                    className="text-red-600"
                  >
                    👎 ({item.unlikes || 0})
                  </button>

                  <button
                    onClick={() => setSelected(item)}
                    className="text-green-600"
                  >
                    💬 Comments
                  </button>
                </div>

                <button
                  onClick={() => setSelected(item)}
                  className="text-green-600 font-semibold hover:underline"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal remains EXACTLY SAME */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white w-[90%] max-w-4xl rounded-xl p-6 relative grid md:grid-cols-2 gap-6 overflow-y-auto max-h-[90vh]">

            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-4 text-xl font-bold"
            >
              X
            </button>

            <div>
              {selected?.images?.length > 0 && (
                <img
                  src={selected.images[0]}
                  alt="complaint"
                  className="w-full h-60 object-cover rounded-xl"
                />
              )}

              <div className="mt-4 space-y-1">
                <p><b>Issue:</b> {selected.title}</p>
                <p><b>Description:</b> {selected.description}</p>
                <p><b>Address:</b> {selected.address}</p>
                <p><b>Likes:</b> 👍 {selected.likes || 0}</p>
                <p><b>Unlikes:</b> 👎 {selected.unlikes || 0}</p>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Add a Comment</h3>

                <textarea
                  ref={commentRef}
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />

                <button
                  onClick={handleSendComment}
                  className="mt-2 bg-green-600 text-white px-4 py-1 rounded"
                >
                  Send
                </button>

                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No comments yet
                    </p>
                  ) : (
                    comments.map((c, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 p-2 rounded text-sm"
                      >
                        <p>{c.text}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <iframe
              width="100%"
              height="350"
              src={`https://maps.google.com/maps?q=${selected.latitude},${selected.longitude}&z=15&output=embed`}
              title="map"
            ></iframe>

          </div>
        </div>
      )}
    </div>
  );
};

export default Viewcomplaints;