

import Navbaruser from "../components/Navbaruser";


const ProfileAvatar = ({ name, photo }) => {
  const firstLetter = name?.charAt(0).toUpperCase();

  return (
    <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center overflow-hidden">
      {photo ? (
        <img src={photo} alt="profile" className="w-full h-full object-cover" />
      ) : (
        <span className="text-white text-3xl font-bold">{firstLetter}</span>
      )}
    </div>
  );
};

const Profile = () => {
  return (
    <div>
      <Navbaruser />

      <div className="min-h-screen bg-gray-200 text-left flex gap-4">

        <div
          className=" bg-white w-100 h-120 m-4 md:m-6 p-4 md:p-5 rounded-xl
                    max-w-7xl  mx-auto flex flex-col md:flex-row gap-4"
        >

          <ProfileAvatar
            name="Aravind"
            photo=""
          />
        </div>


        <div
          className=" bg-white w-180 h-120 m-4 md:m-6 p-4 md:p-5 rounded-xl 
        max-w-7xl  mx-auto flex flex-col md:flex-row gap-4"
        >
          <h1 className="text-center font-semi bold text-center md:text-2xl mb-4">
            Account Information
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Profile;
