import { useState, useEffect } from 'react';
import api from '../api/axios';
import axios from 'axios'; // <-- ADD THIS IMPORT
import { Plus, Dumbbell, Trash2, CalendarDays } from 'lucide-react';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState({ text: "Loading motivation...", author: "" });

  // Modal State for New Session
  const [showModal, setShowModal] = useState(false);
  const [newSession, setNewSession] = useState({
    name: '',
    date: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    exercises: [] // Array of { exerciseId, sets, reps, weight }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, exercisesRes] = await Promise.all([
        api.get('/sessions'),
        api.get('/exercises?limit=100') // Get exercises for the dropdown
      ]);
      setSessions(sessionsRes.data.data.sessions);
      setAvailableExercises(exercisesRes.data.data.exercises);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchData();
  
  // Fares's External API Call
  axios.get('https://dummyjson.com/quotes/random')
    .then(res => setQuote({ text: res.data.quote, author: res.data.author }))
    .catch(err => console.log(err));
}, []);

  // Form Handlers
  const handleAddExerciseRow = () => {
    if (availableExercises.length === 0) {
      alert("Please create some exercises in the Exercise Library first!");
      return;
    }
    setNewSession({
      ...newSession,
      exercises: [
        ...newSession.exercises,
        { exerciseId: availableExercises[0]._id, sets: 3, reps: 10, weight: 0 }
      ]
    });
  };

  const handleRemoveExerciseRow = (index) => {
    const updated = [...newSession.exercises];
    updated.splice(index, 1);
    setNewSession({ ...newSession, exercises: updated });
  };

  const handleExerciseChange = (index, field, value) => {
    const updated = [...newSession.exercises];
    updated[index][field] = value;
    setNewSession({ ...newSession, exercises: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newSession.exercises.length === 0) {
      alert("Please add at least one exercise to the session.");
      return;
    }
    try {
      await api.post('/sessions', newSession);
      setShowModal(false);
      setNewSession({ name: '', date: new Date().toISOString().slice(0, 16), exercises: [] });
      fetchData(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to log session');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this workout session?")) return;
    try {
      await api.delete(`/sessions/${id}`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Workout Logs</h1>
{/* Fares's Motivational Quote UI */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-lg shadow mb-6 italic text-center">
        "{quote.text}" <br/>
        <span className="text-blue-200 text-sm font-bold">- {quote.author}</span>
      </div>

 
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >

          <Plus size={20} /> Log Workout
        </button>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg border border-gray-100 text-gray-500">
          No workouts logged yet. Time to hit the gym!
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <div key={session._id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{session.name || 'Workout Session'}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <CalendarDays size={16} /> {new Date(session.date).toLocaleString()}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {session.exercises.map((ex, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border border-gray-200 capitalize">
                      {ex.exercise?.name || 'Deleted Exercise'} ({ex.sets}x{ex.reps} @ {ex.weight}kg)
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Volume</p>
                  <p className="font-bold text-blue-600">{session.totalVolume} kg</p>
                </div>
                <button onClick={() => handleDelete(session._id)} className="text-red-400 hover:text-red-600 p-2">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Session Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Dumbbell size={24} className="text-blue-600"/> Log New Workout
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Session Name</label>
                  <input type="text" placeholder="e.g. Pull Day" className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={newSession.name} onChange={e => setNewSession({...newSession, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Date & Time</label>
                  <input type="datetime-local" required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={newSession.date} onChange={e => setNewSession({...newSession, date: e.target.value})} />
                </div>
              </div>

              {/* Dynamic Exercises List */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-700">Exercises</h3>
                  <button type="button" onClick={handleAddExerciseRow} className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded flex items-center gap-1 transition">
                    <Plus size={16} /> Add Row
                  </button>
                </div>

                {newSession.exercises.length === 0 && (
                  <p className="text-sm text-gray-500 italic text-center py-4">Click "Add Row" to start adding exercises.</p>
                )}

                <div className="space-y-3">
                  {newSession.exercises.map((ex, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-3 bg-gray-50 p-3 rounded border border-gray-200 items-end">
                      <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Exercise</label>
                        <select className="w-full px-2 py-2 border rounded capitalize outline-none" value={ex.exerciseId} onChange={(e) => handleExerciseChange(index, 'exerciseId', e.target.value)}>
                          {availableExercises.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                        </select>
                      </div>
                      <div className="w-full md:w-20">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Sets</label>
                        <input type="number" min="1" required className="w-full px-2 py-2 border rounded outline-none" value={ex.sets} onChange={(e) => handleExerciseChange(index, 'sets', Number(e.target.value))} />
                      </div>
                      <div className="w-full md:w-20">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Reps</label>
                        <input type="number" min="1" required className="w-full px-2 py-2 border rounded outline-none" value={ex.reps} onChange={(e) => handleExerciseChange(index, 'reps', Number(e.target.value))} />
                      </div>
                      <div className="w-full md:w-24">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Weight (kg)</label>
                        <input type="number" min="0" required className="w-full px-2 py-2 border rounded outline-none" value={ex.weight} onChange={(e) => handleExerciseChange(index, 'weight', Number(e.target.value))} />
                      </div>
                      <button type="button" onClick={() => handleRemoveExerciseRow(index)} className="p-2 text-red-500 hover:bg-red-100 rounded transition mb-1">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition">Save Workout</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;