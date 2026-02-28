



import { useNavigate } from "react-router-dom";
import Navbaruser from "../components/Navbaruser";
import MapComponent from "../components/MapComponent";
import { useState } from "react";

const Reportissue = () => {
  const navigate = useNavigate();



  const userId = localStorage.getItem("userId");
  const [formData, setFormData] = useState({
    title: "",
    priority: "",
    issueType: "",
    address: "",
    description: "",
    latitude: "",
    longitude: "",
  });


  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);


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
    setImages(images.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    data.append("postedBy", userId);

    images.forEach((img) => {
      data.append("images", img);
    });

    try {
      await fetch("http://localhost:5000/complaints", {
        method: "POST",
        body: data,
      });

      alert("Complaint Submitted Successfully");
      navigate("/viewcomplaints");
    } catch (error) {

      alert("Error submitting complaint");
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 text-left">
      <Navbaruser />

      <div className="bg-white m-4 md:m-6 p-4 md:p-5 rounded-xl max-w-7xl mx-auto flex flex-col md:flex-row gap-4">
        {/* LEFT SIDE FORM */}
        <div className="flex-1">
          <h1 className="text-center font-bold text-2xl md:text-3xl mb-4">
            Report a Civic Issue
          </h1>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 flex flex-col md:flex-row gap-6"
          >
            <div className="w-full">
              <label>Issue Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter Issue name"
                className="border w-full rounded-sm text-sm mb-2 p-2"
              />

              <label>Priority Level</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="border w-full rounded-sm text-sm mb-2 p-2"
              >
                <option value="">Select Priority Level</option>
                <option className="">High</option>
                <option>Medium</option>
                <option>LOw</option>
              </select>

              <label>Near by Landmark</label>
              <input
                type="text"
                placeholder="e.g. Near mall"
                className="border w-full rounded-sm text-sm mb-2 p-2"
              />
            </div>

            <div className="w-full">
              <label>Issue Type</label>
              <select
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
                className="border w-full rounded-sm text-sm mb-2 p-2"
              >
                <option value="">Select Issue Type</option>
                <option>Garbage</option>
                <option>Street Lights</option>
                <option>Pothole</option>
                <option>Water Overflow</option>
                <option>Others</option>
              </select>

              <label>Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                type="text"
                placeholder="Enter Address"
                className="border w-full rounded-sm text-sm mb-2 p-2"
              />

              <label>Upload Images (Max 3)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImages}
                className="border w-full rounded-sm text-sm mb-2 p-2"
              />

              {/* IMAGE PREVIEW */}
              <div className="flex gap-3 flex-wrap mt-2">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(img)}
                      className="w-24 h-24 object-cover rounded border"
                    />

                    {/* Eye */}
                    <button
                      type="button"
                      onClick={() => setPreviewImage(URL.createObjectURL(img))}
                      className="absolute top-1 left-1 bg-white px-2 rounded"
                    >
                      👁
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white px-2 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>

          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe Issue In Detail....."
            className="border w-full h-20 rounded-sm mb-2 p-2"
          ></textarea>

          <div className="flex items-center justify-center">
            <button
              onClick={handleSubmit}
              className="border bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded"
            >
              Submit
            </button>
          </div>
        </div>

        {/* RIGHT SIDE MAP */}
        <div className="flex-1 h-[350px] md:h-[420px]">
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
      </div>

      {/* IMAGE POPUP */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded">
            <img src={previewImage} className="max-w-md max-h-[400px]" />

            <button
              onClick={() => setPreviewImage(null)}
              className="block mx-auto mt-3 bg-red-500 text-white px-4 py-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reportissue;

