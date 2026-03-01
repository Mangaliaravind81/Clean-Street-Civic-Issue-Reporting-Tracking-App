import { useEffect, useState } from "react";
import axios from "axios";
import Navbaruser from "../components/Navbaruser";

const Viewcomplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [commentText, setCommentText] = useState("");

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

  // Like (logic same)
  const handleLike = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/complaints/${id}/like`
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

  // Unlike (UI only for now)
  const handleUnlikeUI = (id) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c._id === id ? { ...c, unlikes: (c.unlikes || 0) + 1 } : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbaruser />

      {/* Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {complaints.length === 0 && (
          <p className="text-center col-span-3 text-gray-500">
            No complaints available
          </p>
        )}

        {complaints.map((item) => (
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
                    : "bg-yellow-200 text-yellow-800"
                }`}
              >
                {item?.status || "Pending"}
              </span>

              <h2 className="text-lg font-bold mt-2">
                {item?.title || "No Title"}
              </h2>

              <p className="text-gray-600 text-sm">
                {item?.description || "No description"}
              </p>

              <p className="text-gray-500 text-sm">
                {item?.address || "No address"}
              </p>

              <div className="mt-4 flex justify-between items-center text-sm">
                <div className="flex gap-6 text-sm items-center">
                  <button
                    onClick={() => handleLike(item._id)}
                    className="text-blue-600 flex items-center gap-1"
                  >
                    👍 <span>Upvote</span> ({item.likes || 0})
                  </button>

                  <button
                    onClick={() => handleUnlikeUI(item._id)}
                    className="text-red-600 flex items-center gap-1"
                  >
                    👎 <span>Downvote</span> ({item.unlikes || 0})
                  </button>

                  <button
                    onClick={() => setSelected(item)}
                    className="text-green-600 flex items-center gap-1"
                  >
                    💬 <span>Comments</span>
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

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white w-[90%] max-w-4xl rounded-xl p-6 relative grid md:grid-cols-2 gap-6">

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
                <p><b>Priority:</b> {selected.priority}</p>
                <p><b>Type:</b> {selected.issueType}</p>
                <p><b>Description:</b> {selected.description}</p>
                <p><b>Address:</b> {selected.address}</p>
                <p><b>Likes:</b> 👍 {selected.likes || 0}</p>
                <p><b>Unlikes:</b> 👎 {selected.unlikes || 0}</p>
              </div>

              {/* Comment UI Only */}
              <div className="mt-4">
                <textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
                <button
                  className="mt-2 bg-green-600 text-white px-4 py-1 rounded"
                >
                  Send
                </button>
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