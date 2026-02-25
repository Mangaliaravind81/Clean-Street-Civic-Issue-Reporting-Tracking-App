// import { useState } from "react";
// import Navbaruser from "../components/Navbaruser";

// const mockComplaints = [
//   {
//     id: 1,
//     title: "Garbage Overflow",
//     user: "Aravind",
//     image: "https://via.placeholder.com/400",
//     description: "Garbage not cleaned for 3 days.",
//     address: "RTC Colony, Anantapur",
//     status: "In Progress",
//     date: "22 Feb 2026",
//     map: "https://via.placeholder.com/300",
//   },
//   {
//     id: 2,
//     title: "Broken Street Light",
//     user: "Ramesh",
//     image: "https://via.placeholder.com/400",
//     description: "Street light not working at night.",
//     address: "Gooty Road",
//     status: "Pending",
//     date: "21 Feb 2026",
//     map: "https://via.placeholder.com/300",
//   },
//   {
//     id: 3,
//     title: "Water Leakage",
//     user: "Suresh",
//     image: "https://via.placeholder.com/400",
//     description: "Water leaking continuously.",
//     address: "Clock Tower",
//     status: "Solved",
//     date: "20 Feb 2026",
//     map: "https://via.placeholder.com/300",
//   },
// ];

// const Viewcomplaints = () => {
//   const [selected, setSelected] = useState(null);
//   const [complaints, setComplaints] = useState([]);

//   return (
//     <div className="min-h-screen bg-gray-200">
//       <Navbaruser />

//       {/* GRID */}
//       <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {mockComplaints.map((item) => (
//           <div
//             key={item.id}
//             className="bg-white rounded-xl shadow p-4 space-y-2"
//           >
//             <h2 className="font-bold">{item.title}</h2>
//             <p className="text-sm text-gray-500">Posted by {item.user}</p>

//             <img
//               src={item.image}
//               className="w-full h-40 object-cover rounded"
//             />

//             <p>{item.description}</p>

//             <p className="text-xs text-gray-500">{item.address}</p>

//             <p className="text-sm font-semibold text-blue-600">{item.status}</p>

//             <div className="flex justify-between text-sm pt-2">
//               <button>👍</button>
//               <button>👎</button>
//               <button>💬</button>

//               <button
//                 onClick={() => setSelected(item)}
//                 className="text-blue-600"
//               >
//                 View Details
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* MODAL */}
//       {selected && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
//           <div className="bg-white w-[80%] rounded-xl p-6 relative">
//             <button
//               onClick={() => setSelected(null)}
//               className="absolute top-2 right-4 text-xl"
//             >
//               ✖
//             </button>

//             <div className="grid grid-cols-2 gap-4">
//               <img
//                 src={selected.image}
//                 className="w-full h-64 object-cover rounded"
//               />

//               <img
//                 src={selected.map}
//                 className="w-full h-64 object-cover rounded"
//               />
//             </div>

//             <div className="mt-4 space-y-1">
//               <h2 className="font-bold text-xl">{selected.title}</h2>
//               <p>{selected.description}</p>
//               <p className="text-sm text-gray-500">{selected.address}</p>
//               <p>Status: {selected.status}</p>
//               <p>Date: {selected.date}</p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Viewcomplaints;

// its dynamically shows the data
// import { useEffect, useState } from "react";
// import Navbaruser from "../components/Navbaruser";
// import axios from "axios";

// const Viewcomplaints = () => {
//   const [complaints, setComplaints] = useState([]);
//   const [selected, setSelected] = useState(null);

//   useEffect(() => {
//     fetchComplaints();
//   }, []);

//   const fetchComplaints = async () => {
//     const res = await axios.get("http://localhost:5000/api/complaints");
//     setComplaints(res.data);
//   };

//   const like = async (id) => {
//     await axios.put(`http://localhost:5000/api/complaints/like/${id}`);
//     fetchComplaints();
//   };

//   const unlike = async (id) => {
//     await axios.put(`http://localhost:5000/api/complaints/unlike/${id}`);
//     fetchComplaints();
//   };

//   const deleteComplaint = async (id) => {
//     if (window.confirm("Delete this complaint?")) {
//       await axios.delete(`http://localhost:5000/api/complaints/${id}`);
//       fetchComplaints();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-200">
//       <Navbaruser />

//       {/* GRID 3 PER ROW */}
//       <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {complaints.map((item) => (
//           <div key={item._id} className="bg-white rounded-xl shadow p-4">
//             <img
//               src={item.image}
//               className="w-full h-40 object-cover rounded"
//             />

//             <h2 className="font-bold mt-2">{item.title}</h2>

//             <p className="truncate text-sm">{item.description}</p>

//             <p className="text-xs text-gray-500">{item.address}</p>

//             <p className="text-blue-600">{item.status}</p>

//             <div className="flex justify-between mt-2 text-sm">
//               <button onClick={() => like(item._id)}>👍 {item.likes}</button>

//               <button onClick={() => unlike(item._id)}>👎</button>

//               <button
//                 onClick={() => setSelected(item)}
//                 className="text-blue-600"
//               >
//                 View
//               </button>

//               <button
//                 onClick={() => deleteComplaint(item._id)}
//                 className="text-red-600"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* MODAL */}
//       {selected && (
//         <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
//           <div className="bg-white w-[70%] p-6 rounded-xl relative">
//             <button
//               onClick={() => setSelected(null)}
//               className="absolute right-4 top-2"
//             >
//               ✖
//             </button>

//             <img
//               src={selected.image}
//               className="w-full h-72 object-cover rounded"
//             />

//             <h2 className="font-bold text-xl mt-3">{selected.title}</h2>
//             <p>{selected.description}</p>
//             <p>{selected.address}</p>
//             <p>Status: {selected.status}</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Viewcomplaints;

// import { useEffect, useState } from "react";
// import axios from "axios";
// import Navbaruser from "../components/Navbaruser";

// const Viewcomplaints = () => {
//   const [complaints, setComplaints] = useState([]);
//   const [selected, setSelected] = useState(null);

//   useEffect(() => {
//     fetchComplaints();
//   }, []);

//   const fetchComplaints = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/complaints");
//       setComplaints(res.data);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const like = async (id) => {
//     await axios.put(`http://localhost:5000/complaints/like/${id}`);
//     fetchComplaints();
//   };

//   const unlike = async (id) => {
//     await axios.put(`http://localhost:5000/complaints/unlike/${id}`);
//     fetchComplaints();
//   };

//   const deleteComplaint = async (id) => {
//     if (window.confirm("Delete complaint?")) {
//       await axios.delete(`http://localhost:5000/complaints/${id}`);
//       fetchComplaints();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-200">
//       <Navbaruser />

//       {/* GRID */}
//       <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {complaints.map((item) => (
//           <div key={item._id} className="bg-white p-4 rounded shadow">
//             <img
//               src={item.images?.[0]}
//               className="w-full h-40 object-cover rounded"
//             />

//             <h2 className="font-bold mt-2">{item.title}</h2>

//             <p className="truncate">{item.description}</p>

//             <p className="text-xs">{item.address}</p>

//             <p className="text-blue-600">{item.status}</p>

//             <div className="flex justify-between mt-2">
//               <button onClick={() => like(item._id)}>👍 {item.likes}</button>

//               <button onClick={() => unlike(item._id)}>👎</button>

//               <button
//                 className="text-blue-500"
//                 onClick={() => setSelected(item)}
//               >
//                 View
//               </button>

//               <button
//                 className="text-red-500"
//                 onClick={() => deleteComplaint(item._id)}
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* MODAL */}
//       {selected && (
//         <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
//           <div className="bg-white p-6 w-[70%] rounded relative">
//             <button
//               onClick={() => setSelected(null)}
//               className="absolute top-2 right-4"
//             >
//               ✖
//             </button>

//             <img
//               src={selected.images?.[0]}
//               className="w-full h-64 object-cover rounded"
//             />

//             <h2 className="font-bold text-xl mt-3">{selected.title}</h2>

//             <p>{selected.description}</p>
//             <p>{selected.address}</p>
//             <p>Status: {selected.status}</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Viewcomplaints;
// dynamically view and mp showing like unlike comments
import { useEffect, useState } from "react";
import axios from "axios";
import Navbaruser from "../components/Navbaruser";

const Viewcomplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    const res = await axios.get("http://localhost:5000/complaints");
    setComplaints(res.data);
  };

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

  // ✅ DELETE FUNCTION (ONLY NEW)
  const deleteComplaint = async (id) => {
    if (window.confirm("Delete this complaint?")) {
      await axios.delete(`http://localhost:5000/complaints/${id}`);
      fetchComplaints();
    }
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <Navbaruser />

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {complaints.map((item) => (
          <div key={item._id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between font-bold">
              <span>{item.title}</span>
              <span>{item.postedBy}</span>
            </div>

            <img src={item.images[0]} className="w-full h-40 mt-2 rounded" />

            <p className="truncate">{item.description}</p>
            <p className="text-xs">{item.address}</p>

            <p className="text-orange-600 animate-pulse font-semibold">
              {item.status} (0%)
            </p>

            <div className="flex gap-4 mt-2">
              <button onClick={() => like(item._id)}>👍 {item.likes}</button>
              <button onClick={() => unlike(item._id)}>
                👎 {item.unlikes}
              </button>
            </div>

            <input
              className="border w-full mt-2 p-1"
              placeholder="Add comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => addComment(item._id)}
                className="bg-blue-500 text-white px-2 py-1 mt-1 hover:text-white hover:bg-green-600 b "
              >
                Send
              </button>

              <button
                onClick={() => setSelected(item)}
                className="text-blue-500 block mt-2"
              >
                View
              </button>

              {/* ✅ DELETE BUTTON (ONLY NEW) */}
              <button
                onClick={() => deleteComplaint(item._id)}
                className="text-green-600  font-semibold mt-1 hover:text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white w-[70%] p-6 grid grid-cols-2 gap-4 relative">
            <div>
              <img src={selected.images[0]} className="w-full h-60 rounded" />

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
            </div>

            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-4"
            >
              ✖
            </button>

            <iframe
              width="100%"
              height="300"
              src={`https://maps.google.com/maps?q=${selected.latitude},${selected.longitude}&z=15&output=embed`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Viewcomplaints;
