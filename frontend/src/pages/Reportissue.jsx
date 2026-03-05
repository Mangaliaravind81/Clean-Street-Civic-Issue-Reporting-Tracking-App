import { useNavigate } from "react-router-dom";
import Navbaruser from "../components/Navbaruser";
import MapComponent from "../components/MapComponent";
import { useState, useRef, useEffect } from "react";

const Reportissue = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const userId = localStorage.getItem("userId");
  const [formData, setFormData] = useState({
    title: "",
    issue_type: "",
    priority: "",
    address: "",
    landmark: "",
    description: "",
    latitude: "",
    longitude: "",
  });

  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (userRole === "volunteer" || userRole === "admin") {
      alert("Only citizens can report issues.");
      navigate("/view-complaints");
    }
  }, [userRole, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImages = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length + images.length > 3) {
      alert("Maximum 3 images only");
      return;
    }
    setImages([...images, ...selected]);
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    if (updatedImages.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "latitude" && key !== "longitude") {
        data.append(key, formData[key]);
      }
    });

    data.append("user_id", userId);
    data.append(
      "location_coords",
      `${formData.latitude},${formData.longitude}`,
    );

    images.forEach((img) => {
      data.append("images", img);
    });

    try {
      if (!userId) {
        alert("You must be logged in to report an issue.");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/complaints", {
        method: "POST",
        body: data,
      });

      const result = await response.json().catch(() => ({ success: false, message: "Response was not valid JSON" }));

      if (response.ok && result.success) {
        alert("Complaint Submitted Successfully");
        setImages([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        navigate("/view-complaints");
      } else {
        console.error("Submission failed:", result);
        alert(`Error: ${result.message || "Something went wrong"}`);
      }
    } catch (error) {
      console.error("Network or parsing error:", error);
      alert("Submission failed. Please check your internet connection or server status.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbaruser />

      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-8">
          Report a Civic Issue
        </h1>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden max-w-6xl mx-auto border border-gray-100">
          <div className="p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl font-bold text-gray-700 mb-6 border-b pb-4">
              Issue Details
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* LEFT SIDE: FORM FIELDS */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">
                        Issue Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Brief description of the issue"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none bg-gray-50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">
                        Issue Type
                      </label>
                      <select
                        name="issue_type"
                        value={formData.issue_type}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 appearance-none"
                        required
                      >
                        <option value="">Select issue type</option>
                        <option value="Garbage">Garbage</option>
                        <option value="Road">Road/Pothole</option>
                        <option value="Water">Water leakage</option>
                        <option value="Lighting">Street Light</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">
                        Priority Level
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                        required
                      >
                        <option value="">Select priority</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter street address"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Nearby Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      placeholder="e.g., Near City Hall"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Describe the issue in detail..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 resize-none"
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Upload Images (Max 3)
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleImages}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                    />
                    {images.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-4">
                        {images.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(img)}
                              alt="Preview"
                              className="w-20 h-20 object-cover rounded-xl border-2 border-white shadow-md shadow-gray-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-xl transition-opacity">
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewImage(URL.createObjectURL(img))
                                }
                                className="text-white p-1 hover:text-blue-200 cursor-pointer"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="text-white p-1 hover:text-red-300 ml-1 cursor-pointer"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT SIDE: MAP */}
                <div className="space-y-4 flex flex-col relative z-0">
                  <label className="block text-sm font-semibold text-gray-600">
                    Location on Map
                  </label>
                  <div className="flex-grow h-[250px] lg:h-[400px] rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner">
                    <MapComponent
                      onLocationChange={(loc) =>
                        setFormData({
                          ...formData,
                          latitude: loc.lat,
                          longitude: loc.lng,
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-400 italic">
                    Click on the map to mark the exact location
                  </p>
                </div>
              </div>

              <div className="pt-8 border-t flex justify-center">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-10 py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 hover:shadow-blue-200 transition-all active:scale-95 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 rotate-45"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* IMAGE POPUP */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white p-2 rounded-2xl shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white font-bold text-xl hover:text-gray-300 cursor-pointer"
            >
              Close ✕
            </button>
            <img
              src={previewImage}
              alt="Full view"
              className="max-w-full max-h-[80vh] rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Reportissue;
