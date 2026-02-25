// import { NavLink } from "react-router-dom";
// import { useState } from "react";
// import Logo from "../assets/logo.png";

// const linkClass = ({ isActive }) =>
//   isActive
//     ? "text-green-600 font-semibold"
//     : "text-gray-600 hover:text-green-600";

// const Navbar = () => {
//   const [open, setOpen] = useState(false);

//   return (
//     <nav className="sticky top-0 z-50 bg-white shadow">

//       <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

//         {/* Logo */}
//         <NavLink to="/" className="flex items-center gap-2">
//           <img src={Logo} alt="Logo" className="h-10 w-auto" />
//           <span className="text-green-600 font-bold text-xl">
//             Clean Street
//           </span>
//         </NavLink>

//         {/* Desktop Menu */}
//         <div className="hidden md:flex items-center gap-6">

//           <NavLink to="/" className={linkClass}>
//             Dashboard
//           </NavLink>

//           <NavLink to="/features" className={linkClass}>
//             Report issue
//           </NavLink>

//           <NavLink to="/how-it-works" className={linkClass}>
//             View complaints
//           </NavLink>

//           <NavLink to="/login" className={linkClass}>
//             Profile
//           </NavLink>

//           {/* <NavLink
//             to="/register"
//             className={({ isActive }) =>
//               isActive
//                 ? "bg-green-600 text-white px-4 py-2 rounded-lg"
//                 : "bg-green-600 text-white  px-4 py-2 rounded-lg"
//             }
//           >
//            SIGN UP
//           </NavLink> */}

//         </div>

//         {/* Mobile Button */}
//         <button
//           onClick={() => setOpen(!open)}
//           className="md:hidden text-2xl"
//         >
//           ☰
//         </button>
//       </div>

//       {/* Mobile Menu */}
//       {open && (
//         <div className="md:hidden border-t px-4 py-4 flex flex-col gap-3 bg-white">

//           <NavLink to="/" onClick={() => setOpen(false)}>
//             Dashboard
//           </NavLink>

//          <a href="#features" className="text-gray-600 hover:text-green-600">
//   Report issue
// </a>

//           <NavLink to="/how-" onClick={() => setOpen(false)}>
//             View complaints
//           </NavLink>

//           <NavLink to="/login" onClick={() => setOpen(false)}>
//             Profile
//           </NavLink>

//           {/* <NavLink
//             to="/register"
//             onClick={() => setOpen(false)}
//             className="bg-green-600 text-white text-center py-2 rounded"
//              >

//           SIGN UP
//           </NavLink> */}

//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbaruser;

import { NavLink } from "react-router-dom";
import { useState } from "react";
import Logo from "../assets/logo.png";

const linkClass = ({ isActive }) =>
  isActive
    ? "text-green-600 font-semibold"
    : "text-gray-600 hover:text-green-600";

const Navbaruser = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
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

          <NavLink to="/reportissue" className={linkClass}>
            Report Issue
          </NavLink>

          <NavLink to="/viewcomplaints" className={linkClass}>
            View Complaints
          </NavLink>

          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
        </div>

        {/* Mobile Button */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-2xl">
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t px-4 py-4 flex flex-col gap-3 bg-white">
          <NavLink to="/dashboard" onClick={() => setOpen(false)}>
            Dashboard
          </NavLink>
          <NavLink to="/login" onClick={() => setOpen(false)}>
            Sign In
          </NavLink>

          <NavLink to="/reportissue" onClick={() => setOpen(false)}>
            Report Issue
          </NavLink>

          <NavLink to="/viewcomplaints" onClick={() => setOpen(false)}>
            View Complaints
          </NavLink>

          <NavLink to="/profile" onClick={() => setOpen(false)}>
            Profile
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export default Navbaruser;
