

import { useEffect, useState } from "react";
import axios from "axios";
import Navbaruser from "../components/Navbaruser";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { BiLike } from "react-icons/bi";
import { BiDislike } from "react-icons/bi";
import { MdOutlineDelete } from "react-icons/md";
import { LuPencil } from "react-icons/lu";
import { FaRegSave } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";

// Haversine formula: distance in km between two lat/lng points
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const NEARBY_RADIUS_KM = 10;

const Viewcomplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all"); // "all" | "nearby"
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const fetchComplaints = async () => {
    const res = await axios.get("http://localhost:5000/complaints");
    setComplaints(res.data);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchComplaints();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (filter === "nearby") {
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by your browser");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocationError(null);
        },
        () => {
          setLocationError("Could not get your location. Showing all complaints.");
          setFilter("all");
        },
        { enableHighAccuracy: true }
      );
    } else {
      setUserLocation(null);
      setLocationError(null);
    }
  }, [filter]);

  const displayComplaints =
    filter === "nearby" && userLocation
      ? complaints
          .filter(
            (c) =>
              c.latitude &&
              c.longitude &&
              getDistanceKm(
                userLocation.lat,
                userLocation.lng,
                parseFloat(c.latitude),
                parseFloat(c.longitude)
              ) <= NEARBY_RADIUS_KM
          )
          .map((c) => ({
            ...c,
            distance: getDistanceKm(
              userLocation.lat,
              userLocation.lng,
              parseFloat(c.latitude),
              parseFloat(c.longitude)
            ),
          }))
          .sort((a, b) => a.distance - b.distance)
      : complaints;
  const like = async (id) => {
    await axios.put(`http://localhost:5000/complaints/like/${id}`);
    fetchComplaints();
  };

  const unlike = async (id) => {
    await axios.put(`http://localhost:5000/complaints/unlike/${id}`);
    fetchComplaints();
  };

  const addComment = async (id) => {
    await axios.post(`http://localhost:5000/complaints/comment/${id}`, {
      text: comment,
    });
    setComment("");
    fetchComplaints();
  };


  const deleteComplaint = async (id) => {
    if (window.confirm("Delete this complaint?")) {
      await axios.delete(`http://localhost:5000/complaints/${id}`);
      fetchComplaints();
      setSelected(null);

    }
  };

  const updateComplaint = async () => {
    try {
      await axios.put(
        `http://localhost:5000/complaints/${selected._id}`,
        editData
      );

      await fetchComplaints();
      setSelected(editData);
      setIsEditing(false);
    } catch (error) {
      alert("Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <Navbaruser />

      <div className="p-6">
        {/* Filter Button */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow p-1">
            <MdFilterList className="text-xl text-green-600" />
            <span className="text-sm font-medium text-gray-600">Filter:</span>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "all"
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All Complaints
            </button>
            <button
              onClick={() => setFilter("nearby")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "nearby"
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Nearby ({NEARBY_RADIUS_KM} km)
            </button>
          </div>
          {filter === "nearby" && userLocation && (
            <span className="text-xs text-gray-500">
              Showing {displayComplaints.length} within {NEARBY_RADIUS_KM} km
            </span>
          )}
          {locationError && (
            <span className="text-xs text-amber-600">{locationError}</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayComplaints.map((item) => (
          <div key={item._id} className="bg-white p-4 rounded-xl shadow">
            <div className="flex justify-between font-bold">
              <span>{item.title}</span>
              <span>{item.postedBy?.name || "Unknown"}</span>
            </div>

            {item.images?.[0] ? (
              <img src={item.images[0]} className="w-full h-40 mt-2 rounded object-cover" alt={item.title} />
            ) : (
              <div className="w-full h-40 mt-2 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-sm">No image</div>
            )}

            <p className="truncate">{item.description}</p>
            <p className="text-xs">{item.address}</p>
            {item.distance !== undefined && (
              <p className="text-xs text-green-600 font-medium">
                {item.distance.toFixed(1)} km away
              </p>
            )}

            <p className="text-orange-600 animate-pulse font-semibold">
              {item.status} (0%)
            </p>

            <div className="flex gap-4 mt-2 cursor-pointer">
              <button className="cursor-pointer" onClick={() => like(item._id)}>
                <BiLike /> {item.likes}
              </button>
              <button
                className="cursor-pointer"
                onClick={() => unlike(item._id)}
              >
                <BiDislike />
                {/* <FaRegComment /> */}
                {item.unlikes}
              </button>
            </div>

            <input
              className="border w-full mt-2 p-1"
              placeholder="Add comment "
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => addComment(item._id)}
                className=" text-black rounded-xl cursor-pointer px-2 py-1 mt-1 hover:text-black  font-bold x hover:bg-gray-300 "
              >
                Send
              </button>

              <button
                onClick={() => setSelected(item)}
                className="text-green-500 block mt-2 font-bold hover:bg-gray-300 rounded-xl cursor-pointer"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center rounded-xl">
          <div className="bg-white w-[70%] p-6 grid grid-cols-2 gap-4  relative rounded-xl">
            <div>
              <button
                onClick={() => setSelected(null)}
                className="absolute top-2 right-2 cursor-pointer"
              >
                <IoIosCloseCircleOutline className="text-3xl" />
                {/* back button  in pop up messge*/}
              </button>
              {selected.images?.[0] ? (
                <img
                  src={selected.images[0]}
                  className="w-full h-60 rounded-xl object-cover"
                  alt={selected.title}
                />
              ) : (
                <div className="w-full h-60 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400">No image</div>
              )}
              {/* IF DETAILS NEED TO EDIT IT WILL NAVIAGATES */}
              {!isEditing ? (
                <>
                  <p>
                    <b>Issue :</b> {selected.title}
                  </p>
                  <p>
                    <b>Priority :</b> {selected.priority}
                  </p>
                  <p>
                    <b>Type :</b> {selected.issueType}
                  </p>
                  <p>
                    <b>Description :</b> {selected.description}
                  </p>
                  <p>
                    <b>Address :</b> {selected.address}
                  </p>
                </>
              ) : (
                <>
                  <div>
                    <div className="space-y-2 flex flex-row  gap-2">
                      <div>
                        <label>Issue Title</label>
                        <input
                          name="title"
                          value={editData.title}
                          onChange={(e) =>
                            setEditData({ ...editData, title: e.target.value })
                          }
                          placeholder="Enter Issue name"
                          className="border w-45 rounded-sm text-sm mb-2 p-2"
                        />
                      </div>
                      <div>
                        <label>Issue Type</label>
                        <select
                          className="border w-45 rounded-sm text-sm mb-2 p-2"
                          value={editData.issueType}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              issueType: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Issue Type</option>
                          <option>Garbage</option>
                          <option>Street Lights</option>
                          <option>Pothole</option>
                          <option>Water Overflow</option>
                          <option>Others</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1 flex flex-row  gap-1">
                      <div>
                        <label>Priority Level</label>

                        <select
                          name="priority"
                          value={editData.priority}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              priority: e.target.value,
                            })
                          }
                          className="border w-45 rounded-sm text-sm mb-2 p-2"
                        >
                          <option value="">Select Priority Level</option>
                          <option className="">High</option>
                          <option>Medium</option>
                          <option>LOw</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="">Address</label>
                        <input
                          className="border w-45 rounded-sm text-sm mb-2 p-2"
                          value={editData.address}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              address: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <textarea
                      className="border w-full p-2 mt-2"
                      value={editData.description}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}
              <div className="flex gap-30 ">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditData(selected);
                  }}
                  className="flex items-center gap-2 cursor-pointer font-semibold hover:text-green-600 hover:bg-gray-300 rounded-xl"
                >
                  <LuPencil /> Edit
                </button>
                <div className="flex gap-28 ">
                  {isEditing && (
                    <button
                      onClick={updateComplaint}
                      className="flex items-center gap-1 font-semibold hover:text-blue-600 hover:bg-gray-300 rounded-xl"
                    >
                      <FaRegSave /> Save
                    </button>
                  )}
                  {/* ✅ DELETE BUTTON (ONLY NEW) */}
                  <button

                    onClick={() => deleteComplaint(selected._id)}
                    className="flex items-center gap-1 rounded-2xl font-semibold mt-1 cursor-pointer text-red-600 hover:bg-gray-300"
                  >
                    <MdOutlineDelete className="text-xl" /> Delete
                  </button>
                </div>
              </div>
            </div>

            <iframe
              width="100%"
              height="380"
              src={`https://maps.google.com/maps?q=${selected.latitude},${selected.longitude}&z=15&output=embed`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Viewcomplaints;
