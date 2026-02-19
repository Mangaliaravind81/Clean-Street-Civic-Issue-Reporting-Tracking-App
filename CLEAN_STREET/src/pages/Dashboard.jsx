// import Navbar from "../components/Navbar";
// import { Link } from "react-router-dom";

// const mockIssues = [
//   { id: 1, title: "Garbage overflow", type: "Garbage", status: "Pending", date: "18 Feb 2026" },
//   { id: 2, title: "Broken street light", type: "Lighting", status: "In Progress", date: "17 Feb 2026" },
//   { id: 3, title: "Road pothole", type: "Road", status: "Resolved", date: "15 Feb 2026" },
//   { id: 4, title: "Water leakage", type: "Water", status: "Pending", date: "14 Feb 2026" },
// ];

// const Dashboard = () => {
//   const pending = mockIssues.filter(i => i.status === "Pending").length;
//   const progress = mockIssues.filter(i => i.status === "In Progress").length;
//   const resolved = mockIssues.filter(i => i.status === "Resolved").length;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />

//       <div className="max-w-7xl mx-auto px-4 py-8">

//         <h1 className="text-3xl font-bold mb-1">Welcome back 👋</h1>
//         <p className="text-gray-500 mb-6">Here’s your civic activity</p>

//         {/* Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//           <Stat title="Total Issues" value={mockIssues.length} />
//           <Stat title="Pending" value={pending} />
//           <Stat title="In Progress" value={progress} />
//           <Stat title="Resolved" value={resolved} />
//         </div>

//         <div className="grid md:grid-cols-3 gap-6">

//           {/* Actions */}
//           <div className="bg-white p-6 rounded-xl shadow">
//             <h2 className="font-semibold mb-4">Quick Actions</h2>

//             <Link to="/report" className="block bg-green-600 text-white text-center py-2 rounded mb-3">
//               Report New Issue
//             </Link>

//             <Link to="/community" className="block border py-2 rounded text-center mb-3">
//               Browse Community
//             </Link>

//             <Link to="/profile" className="block border py-2 rounded text-center">
//               View Profile
//             </Link>
//           </div>

//           {/* Activity */}
//           <div className="bg-white p-6 rounded-xl shadow md:col-span-2">
//             <h2 className="font-semibold mb-4">Recent Reports</h2>

//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b text-gray-500">
//                   <th className="text-left py-2">Title</th>
//                   <th className="text-left py-2 hidden sm:block">Type</th>
//                   <th className="text-left py-2">Status</th>
//                   <th className="text-left py-2 hidden md:block">Date</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {mockIssues.map(issue => (
//                   <tr key={issue.id} className="border-b last:border-0">
//                     <td className="py-2">{issue.title}</td>
//                     <td className="py-2 hidden sm:block">{issue.type}</td>
//                     <td className="py-2">
//                       <span className={`px-2 py-1 rounded text-xs ${badge(issue.status)}`}>
//                         {issue.status}
//                       </span>
//                     </td>
//                     <td className="py-2 hidden md:block">{issue.date}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const Stat = ({ title, value }) => (
//   <div className="bg-white p-4 rounded-xl shadow text-center">
//     <p className="text-gray-500 text-sm">{title}</p>
//     <p className="text-2xl font-bold">{value}</p>
//   </div>
// );

// const badge = status => {
//   if (status === "Pending") return "bg-yellow-100 text-yellow-700";
//   if (status === "In Progress") return "bg-blue-100 text-blue-700";
//   return "bg-green-100 text-green-700";
// };

// export default Dashboard;




import Navbaruser from "../components/Navbaruser";
import { Link } from "react-router-dom";

const mockIssues = [
  { id: 1, title: "Garbage overflow", type: "Garbage", status: "Pending", date: "18 Feb 2026" },
  { id: 2, title: "Broken street light", type: "Lighting", status: "In Progress", date: "17 Feb 2026" },
  { id: 3, title: "Road pothole", type: "Road", status: "Resolved", date: "15 Feb 2026" },
  { id: 4, title: "Water leakage", type: "Water", status: "Pending", date: "14 Feb 2026" },
];

const Dashboard = () => {
  const pending = mockIssues.filter(i => i.status === "Pending").length;
  const progress = mockIssues.filter(i => i.status === "In Progress").length;
  const resolved = mockIssues.filter(i => i.status === "Resolved").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbaruser />

      <div className="max-w-7xl mx-auto px-4 py-8">

        <h1 className="text-3xl font-bold mb-1">Welcome back 👋</h1>
        <p className="text-gray-500 mb-6">Here’s your civic activity</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat title="Total Issues" value={mockIssues.length} />
          <Stat title="Pending" value={pending} />
          <Stat title="In Progress" value={progress} />
          <Stat title="Resolved" value={resolved} />
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Actions */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-semibold mb-4">Quick Actions</h2>

            <Link to="/report" className="block bg-green-600 text-white text-center py-2 rounded mb-3">
              Report New Issue
            </Link>

            <Link to="/community" className="block border py-2 rounded text-center mb-3">
              Browse Community
            </Link>

            <Link to="/profile" className="block border py-2 rounded text-center">
              View Profile
            </Link>
          </div>

          {/* Reports */}
          <div className="bg-white p-6 rounded-xl shadow md:col-span-2">
            <h2 className="font-semibold mb-4">Recent Reports</h2>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2 hidden sm:block">Type</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2 hidden md:block">Date</th>
                </tr>
              </thead>

              <tbody>
                {mockIssues.map(issue => (
                  <tr key={issue.id} className="border-b last:border-0">
                    <td className="py-2">{issue.title}</td>
                    <td className="py-2 hidden sm:block">{issue.type}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${badge(issue.status)}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="py-2 hidden md:block">{issue.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ title, value }) => (
  <div className="bg-white p-4 rounded-xl shadow text-center">
    <p className="text-gray-500 text-sm">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const badge = status => {
  if (status === "Pending") return "bg-yellow-100 text-yellow-700";
  if (status === "In Progress") return "bg-blue-100 text-blue-700";
  return "bg-green-100 text-green-700";
};

export default Dashboard;
