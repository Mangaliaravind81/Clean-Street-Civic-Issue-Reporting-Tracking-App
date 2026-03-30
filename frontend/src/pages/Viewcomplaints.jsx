import React from 'react';
import AdminViewComplaints from './AdminViewComplaints';
import VolunteerViewComplaints from './VolunteerViewComplaints';
import UserViewComplaints from './UserViewComplaints';

const Viewcomplaints = () => {
  const userRole = localStorage.getItem("userRole");

  if (userRole === "admin") {
    return <AdminViewComplaints />;
  } else if (userRole === "volunteer") {
    return <VolunteerViewComplaints />;
  } else {
    // Default to user view for 'user' role or any missing role
    return <UserViewComplaints />;
  }
};

export default Viewcomplaints;
