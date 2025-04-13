import { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Header from './Header';

type Note = {
  _id: string;
  content: string;
  summary: string;
  createdAt: string;
};

export default function Home() {
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [activeTab, setActiveTab] = useState<'main' | 'summary'>('main');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await axios.get('/api/notes');
      setNotes(res.data);
    } catch (err) {
      toast.error('Failed to fetch notes');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await axios.put(`/api/notes/${editingId}`, { content });
        toast.success('Note updated!');
      } else {
        await axios.post('/api/notes', { content });
        toast.success('Note saved and summarized!');
      }
      setContent('');
      setEditingId(null);
      await fetchNotes();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/notes/${id}`);
      toast.success('Note deleted!');
      await fetchNotes();
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  const handleEdit = (note: Note) => {
    setContent(note.content);
    setEditingId(note._id);
  };

  const filteredNotes = notes.filter((note) => {
    // Log invalid notes for debugging
    if (!note || typeof note.content !== 'string' || typeof note.summary !== 'string') {
      console.warn('Invalid note detected:', note);
      return false;
    }
    try {
      return (
        note.content.toLowerCase().includes(search.toLowerCase()) ||
        note.summary.toLowerCase().includes(search.toLowerCase())
      );
    } catch (err) {
      console.error('Error filtering note:', note, err);
      return false;
    }
  });

  const handleCopy = () => {
    if (selectedNote?.summary) {
      navigator.clipboard.writeText(selectedNote.summary);
      setCopied(true);
      toast.success('Summary copied!');
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      <Header />
      <Toaster position="top-right" />

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col justify-center items-center">
        <h1 className="text-center">
          <span className="text-4xl font-bold text-indigo-600">Hey @user!</span>
          <br />
          <span className=" text-gray-900 title-paragraph text-1xl">What can I summarize for you?</span>
        </h1>
        <form onSubmit={handleSubmit} className="w-full max-w-3xl mt-8">
          <textarea
            className="w-full bg-gray-100 shadow-lg textarea text-black border-dark p-4 rounded-lg focus:outline-none focus:ring-5 border-10 border-indigo-600"
            rows={4}
            placeholder="Enter your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <button
            type="submit"
            className="cursor-pointer summary mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-200 disabled:opacity-50"
            disabled={loading}
          >
            {editingId
              ? loading
                ? 'Updating...'
                : 'Update Note'
              : loading
              ? 'Summarizing...'
              : 'Summarize'}
          </button>
        </form>

        {/* display notes summary*/}
        <div className="space-y-2 space-x-2 overflow-y-auto flex">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className="cursor-pointer p-2 bg-gray-100 shadow-md rounded-lg text-sm"
              onClick={() => {
                setSelectedNote(note);
                setActiveTab('main');
              }}
            >
              <div className="flex justify-between text-gray-500 mb-2 text-xs">
                <span>{new Date(note.createdAt).toLocaleString()}</span>
                <div className="space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(note);
                    }}
                    className="cursor-pointer text-yellow-400 hover:text-yellow-600 p-1 bg-gray-200 shadow-md rounded"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note._id);
                    }}
                    className="cursor-pointer text-red-500 hover:text-red-600 p-1 rounded bg-gray-200 shadow-md"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="mb-2 whitespace-pre-wrap">
                {note.content?.length > 20 ? note.content.slice(0, 20) + '...' : note.content || 'No Content'}
              </p>
              <div className="text-green-400 border-t border-gray-700 pt-2 text-xs">
                {note.summary?.length > 20 ? note.summary.slice(0, 20) + '...' : note.summary || 'No summary'}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      {selectedNote && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-opacity-20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-opacity-20 backdrop-blur-md rounded-lg p-6 w-full max-w-2xl relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setSelectedNote(null)}
                className="absolute top-6 right-4 text-gray-400 bg-gray-950 cursor-pointer hover:text-white p-2 rounded-lg"
              >
                <X size={24} />
              </button>
              <div className="flex justify-center space-x-4 mb-4">
                <button
                  className={`px-4 py-2 rounded-lg ${
                    activeTab === 'main' ? 'bg-indigo-600 text-white' : 'bg-gray-950 text-gray-300'
                  }`}
                  onClick={() => setActiveTab('main')}
                >
                  Main Note
                </button>
                <button
                  className={`px-4 py-2 rounded-lg ${
                    activeTab === 'summary' ? 'bg-indigo-600 text-white' : 'bg-gray-950 text-gray-300'
                  }`}
                  onClick={() => setActiveTab('summary')}
                >
                  Summary
                </button>
              </div>
              <div className="whitespace-pre-wrap text-sm p-4 bg-gray-950 text-white rounded-lg max-h-[300px] overflow-y-auto relative">
                {activeTab === 'summary' && (
                  <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 text-indigo-400 text-xs p-2 bg-gray-950 rounded-lg hover:bg-gray-900"
                    title="Copy summary"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
                {activeTab === 'main'
                  ? selectedNote.content
                  : selectedNote.summary || 'No summary available'}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}