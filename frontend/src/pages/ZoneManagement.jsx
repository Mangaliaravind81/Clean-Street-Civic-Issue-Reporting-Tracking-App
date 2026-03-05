import { useState, useEffect } from "react";
import axios from "axios";
import Navbaruser from "../components/Navbaruser";
import { 
  FaMapMarkedAlt, 
  FaPlus, 
  FaTrashAlt, 
  FaEdit, 
  FaGlobeAmericas,
  FaInfoCircle
} from "react-icons/fa";

const ZoneManagement = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newZone, setNewZone] = useState({ name: "", description: "", boundary_coords: "" });

  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (userRole !== "admin") {
      window.location.href = "/dashboard";
      return;
    }

    const fetchZones = async () => {
      try {
        const res = await axios.get("http://localhost:5000/zones");
        setZones(res.data.zones || []);
      } catch (err) {
        console.error("Failed to fetch zones", err);
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
  }, [userRole]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/zones", newZone);
      setZones([res.data.zone, ...zones]);
      setNewZone({ name: "", description: "", boundary_coords: "" });
      setShowAdd(false);
      alert("Zone created successfully!");
    } catch (err) {
      alert("Creation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this zone?")) return;
    try {
      await axios.delete(`http://localhost:5000/zones/${id}`);
      setZones(zones.filter(z => z._id !== id));
      alert("Zone deleted");
    } catch (err) {
      alert("Deletion failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbaruser />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <FaMapMarkedAlt className="text-blue-600" />
              Zone Management
            </h1>
            <p className="text-gray-500">Define and monitor administrative districts</p>
          </div>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all font-bold"
          >
            {showAdd ? "Close" : <><FaPlus /> Add New Zone</>}
          </button>
        </div>

        {showAdd && (
          <div className="bg-white rounded-3xl p-8 border border-blue-100 shadow-xl shadow-blue-50/50 mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Create New Administrative Zone</h3>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Zone Name</label>
                  <input 
                    required
                    type="text"
                    value={newZone.name}
                    onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                    placeholder="e.g. North District"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Boundary Coordinates</label>
                  <input 
                    type="text"
                    value={newZone.boundary_coords}
                    onChange={(e) => setNewZone({...newZone, boundary_coords: e.target.value})}
                    placeholder="e.g. 13.0827, 80.2707"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  value={newZone.description}
                  onChange={(e) => setNewZone({...newZone, description: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">
                  Save Zone
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((z) => (
            <div key={z._id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <FaGlobeAmericas />
                </div>
                <button 
                  onClick={() => handleDelete(z._id)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <FaTrashAlt />
                </button>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{z.name}</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {z.description || "No description provided for this administrative zone."}
              </p>
              <div className="pt-4 border-t border-gray-50 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <FaInfoCircle className="text-blue-500/50" />
                Base: {z.boundary_coords || "Not Set"}
              </div>
            </div>
          ))}

          {zones.length === 0 && !showAdd && (
            <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
               <FaMapMarkedAlt className="text-gray-100 text-6xl mx-auto mb-4" />
               <p className="text-gray-400 font-medium">No zones defined yet. Start by adding one from the button above.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ZoneManagement;
