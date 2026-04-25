import { useState, useEffect } from 'react';
import api from '../api/axios';
import { BookOpen, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

const Notes = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Note States
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // 1. Fetch available sessions for the dropdown
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('/sessions?limit=50'); // Get recent sessions
        setSessions(res.data.data.sessions);
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      }
    };
    fetchSessions();
  }, []);

  // 2. Fetch notes whenever a session is selected
  useEffect(() => {
    if (!selectedSession) {
      setNotes([]);
      return;
    }
    
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/notes/session/${selectedSession}`);
        setNotes(res.data.data);
      } catch (error) {
        console.error("Failed to fetch notes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [selectedSession]);

  // Handlers
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await api.post(`/notes/session/${selectedSession}`, { content: newNote });
      setNewNote('');
      // Refresh notes
      const res = await api.get(`/notes/session/${selectedSession}`);
      setNotes(res.data.data);
    } catch (error) {
      alert('Failed to add note');
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(notes.filter(n => n._id !== noteId));
    } catch (error) {
      alert('Failed to delete note');
    }
  };

  const startEditing = (note) => {
    setEditingId(note._id);
    setEditContent(note.content);
  };

  const saveEdit = async (noteId) => {
    try {
      await api.put(`/notes/${noteId}`, { content: editContent });
      setEditingId(null);
      // Update UI instantly
      setNotes(notes.map(n => n._id === noteId ? { ...n, content: editContent } : n));
    } catch (error) {
      alert('Failed to update note');
    }
  };

  return (
    <div className="mt-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
          <BookOpen size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Workout Notes</h1>
          <p className="text-gray-500">Record thoughts, soreness, or form cues for your sessions.</p>
        </div>
      </div>

      {/* Select Session Dropdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">Select a Workout Session</label>
        <select 
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
        >
          <option value="">-- Choose a session --</option>
          {sessions.map(s => (
            <option key={s._id} value={s._id}>
              {new Date(s.date).toLocaleDateString()} - {s.name || 'Workout'}
            </option>
          ))}
        </select>
      </div>

      {/* Notes Area (Only visible if a session is selected) */}
      {selectedSession && (
        <div className="space-y-6">
          
          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="flex gap-2">
            <input 
              type="text" 
              placeholder="How did this workout feel? e.g., 'Increase squat weight next time'" 
              className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={!newNote.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition"
            >
              <Plus size={20} /> Add
            </button>
          </form>

          {/* Notes List */}
          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-gray-500 py-4">Loading notes...</p>
            ) : notes.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200 border-dashed text-gray-500">
                No notes for this session yet.
              </div>
            ) : (
              notes.map(note => (
                <div key={note._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4 items-start group">
                  
                  {/* If editing this specific note */}
                  {editingId === note._id ? (
                    <div className="flex-1 flex gap-2">
                      <input 
                        type="text" 
                        autoFocus
                        className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <button onClick={() => saveEdit(note._id)} className="p-2 text-green-600 hover:bg-green-50 rounded"><Check size={20} /></button>
                      <button onClick={() => setEditingId(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded"><X size={20} /></button>
                    </div>
                  ) : (
                    /* Standard Note View */
                    <>
                      <div className="flex-1">
                        <p className="text-gray-800">{note.content}</p>
                        <span className="text-xs text-gray-400 mt-2 block">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditing(note)} className="p-2 text-blue-500 hover:bg-blue-50 rounded transition">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(note._id)} className="p-2 text-red-500 hover:bg-red-50 rounded transition">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Notes;