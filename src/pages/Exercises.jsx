import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { Search, Plus, Trash2, Dumbbell } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const MUSCLE_GROUPS = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'full body', 'other'];

const Exercises = () => {
  const { user } = useContext(AuthContext);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  // Filters
  const [search, setSearch] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: '', muscleGroup: 'chest', description: '' });
  const [modalError, setModalError] = useState('');

  const fetchExercises = async () => {
    try {
      setLoading(true);
      // Pass search and filter as query parameters
      const params = {};
      if (search) params.search = search;
      if (muscleGroup) params.muscleGroup = muscleGroup;

      const res = await api.get('/exercises', { params });
      setExercises(res.data.data.exercises);
    } catch (error) {
      console.error("Failed to fetch exercises", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when page loads or filters change
  useEffect(() => {
    fetchExercises();
  }, [muscleGroup]); // We trigger search manually via button, but muscle group auto-updates

  const handleSearch = (e) => {
    e.preventDefault();
    fetchExercises();
  };

  
const handleExternalSearch = async () => {
  if (!search) {
    alert("Please type an exercise name in the search bar first!");
    return;
  }
  try {
    setImporting(true);
    // This calls the RapidAPI through your backend!
    const res = await api.get(`/exercises/external/search?name=${search}`);
    alert(`Imported ${res.data.data.length} exercises from ExerciseDB!`);
    fetchExercises(); // Refresh the list
  } catch (error) {
    alert("Failed to import from external API. Check backend logs/API key.");
  } finally {
    setImporting(false);
  }
};


  const handleAddExercise = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      await api.post('/exercises', newExercise);
      setShowModal(false);
      setNewExercise({ name: '', muscleGroup: 'chest', description: '' });
      fetchExercises(); // Refresh list
    } catch (error) {
      setModalError(error.response?.data?.message || 'Failed to create exercise');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exercise?")) return;
    try {
      await api.delete(`/exercises/${id}`);
      fetchExercises();
    } catch (error) {
      alert(error.response?.data?.message || 'Cannot delete this exercise');
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Exercise Library</h1>
        
         <button 
            onClick={handleExternalSearch}
            disabled={importing}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
          >
            {importing ? "Importing..." : "Import from API"}
          </button>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={20} /> Add Exercise
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input 
            type="text" 
            placeholder="Search exercises..." 
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 transition">
            <Search size={20} />
          </button>
        </form>

        <select 
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none capitalize"
          value={muscleGroup}
          onChange={(e) => setMuscleGroup(e.target.value)}
        >
          <option value="">All Muscle Groups</option>
          {MUSCLE_GROUPS.map(mg => (
            <option key={mg} value={mg}>{mg}</option>
          ))}
        </select>
      </div>

      {/* Exercise Grid */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading exercises...</div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg border border-gray-100 text-gray-500">
          No exercises found. Create one to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map(exercise => (
            <div key={exercise._id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800 capitalize">{exercise.name}</h3>
                {exercise.isCustom && exercise.createdBy?._id === user.id && (
                  <button onClick={() => handleDelete(exercise._id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize w-max mb-3">
                {exercise.muscleGroup}
              </span>
              <p className="text-gray-600 text-sm flex-1">{exercise.description || 'No description provided.'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Exercise Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Dumbbell size={24} className="text-blue-600"/> New Exercise
            </h2>
            
            {modalError && <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">{modalError}</div>}
            
            <form onSubmit={handleAddExercise} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Exercise Name</label>
                <input required type="text" className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={newExercise.name} onChange={e => setNewExercise({...newExercise, name: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Muscle Group</label>
                <select className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none capitalize" value={newExercise.muscleGroup} onChange={e => setNewExercise({...newExercise, muscleGroup: e.target.value})}>
                  {MUSCLE_GROUPS.map(mg => <option key={mg} value={mg}>{mg}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description (Optional)</label>
                <textarea className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" rows="3" value={newExercise.description} onChange={e => setNewExercise({...newExercise, description: e.target.value})}></textarea>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded transition">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exercises;