import { useEffect, useState } from 'react'
import axios from 'axios'
import { Menu, X, Pencil, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Note = {
  _id: string
  content: string
  summary: string
  createdAt: string
}

export default function Home() {
  const [content, setContent] = useState('')
  const [notes, setNotes] = useState<Note[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [activeTab, setActiveTab] = useState<'main' | 'summary'>('main')

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    const res = await axios.get('/api/notes')
    setNotes(res.data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (editingId) {
      await axios.put(`/api/notes/${editingId}`, { content })
    } else {
      await axios.post('/api/notes', { content })
    }

    setContent('')
    setEditingId(null)
    await fetchNotes()
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await axios.delete(`/api/notes/${id}`)
    await fetchNotes()
  }

  const handleEdit = (note: Note) => {
    setContent(note.content)
    setEditingId(note._id)
    if (window.innerWidth < 768) setSidebarOpen(false) // Close sidebar on mobile
  }

  const filteredNotes = notes.filter((note) =>
    note.content.toLowerCase().includes(search.toLowerCase()) ||
    note.summary.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Mobile Sidebar Toggler */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white p-2 toggle-button bg-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-500"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`sidebar fixed md:static z-40 top-0 left-0 h-full w-80 bg-black p-6 border-r border-gray-500 transition-transform duration-600 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <h2 className="text-4xl font-bold mb-10 text-center title-text">AI NOTE</h2>
        <input
          type="text"
          placeholder="Search Notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search w-full p-2 mb-4 rounded max-w-full bg-black border border-r border-gray-900 text-white focus:outline-none focus:ring-3 focus:ring-indigo-500"
        />

        {/* Notes List in Sidebar */}
        <div className="space-y-2 overflow-y-auto h-[70vh] ">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className="cursor-pointer p-2 bg-gray-950 border-b border-gray-300 rounded-lg hover:bg-gray-800 text-xs"
              onClick={() => {
                setSelectedNote(note)
                setActiveTab('main')
                if (window.innerWidth < 768) setSidebarOpen(false)
              }}
            >
              <div className="flex justify-between text-gray-500 mb-2 text-xs">
                <span>{new Date(note.createdAt).toLocaleString()}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="text-yellow-400 hover:underline cursor-pointer p-1 border rounded-lg"
                    title='Edit'
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="text-red-500 hover:underline cursor-pointer p-1 border rounded-lg"
                    title='Delete'
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
              <p className="mb-2 whitespace-pre-wrap">
                {note.content?.length >20 
                ? note.content.slice(0, 20) + '...'
                : note.content || 'No Content'}
              </p>
              <div className="text-green-400 border-t border-gray-700 pt-2 text-sm">
                {note.summary?.length > 20
                ? note.summary.slice(0, 20) + '...'
                : note.summary || 'No summary'}
              </div>
              
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-2 my-20 flex flex-col justify-center items-center">
        <h1 className='text-center text-light'> <span className="title-text text-4xl">Hey @user !</span>  <br /><span className="font-bold title-paragraph"> What can i summarize for you ?</span></h1>
        <form onSubmit={handleSubmit} className="w-full max-w-3xl mb-8">
          <textarea
            className="textarea w-full bg-gray-800 text-white p-4 mt-12 rounded-lg focus:outline-none focus:ring-5 focus:ring-indigo-500"
            rows={4}
            placeholder="Enter your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <button
            type="submit"
            className="submit-button cursor-pointer mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-200"
            disabled={loading}
          >
            {editingId
              ? loading
                ? 'Updating...'
                : 'Update Note'
              : loading
              ? 'Summarizing...'
              : 'Summarize + Save'}
          </button>
        </form>
      </main>

      {/* Modal */}
      {selectedNote && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0  bg-opacity-60 backdrop-blur-md z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-lg p-6 w-full max-w-2xl relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setSelectedNote(null)}
                className="absolute top-5 right-3 text-gray-400 hover:text-white cursor-pointer bg-gray-800 p-2 rounded-lg"
              >
                <X size={24} />
              </button>

              {/* Tabs */}
              <div className="flex justify-center space-x-4 mb-4">
                <button
                  className={`px-4 py-2 rounded-lg tab-text ${
                    activeTab === 'main' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 '
                  }`}
                  onClick={() => setActiveTab('main')}
                >
                  Main Note
                </button>
                <button
                  className={`px-4 py-2 rounded-lg tab-text ${
                    activeTab === 'summary' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                  onClick={() => setActiveTab('summary')}
                >
                  Summary
                </button>
              </div>

              {/* Content */}
              <div className=" whitespace-pre-wrap text-sm  p-4 rounded-lg max-h-[300px] overflow-y-auto relative">
                {activeTab === 'summary' && (
                  <button
                    onClick={() => {
                      if (selectedNote?.summary) {
                        navigator.clipboard.writeText(selectedNote.summary)
                      }
                    }}
                    className="absolute top-2 right-2 text-indigo-400 hover:text-white text-xs"
                    title="Copy summary"
                  >
                    Copy
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
  )
}