import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const [projects, setProjects] = useState([])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Research Projects</h1>
          <p className="text-gray-400 mt-1">Your AI-powered literature reviews</p>
        </div>
        <Link
          to="/new"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          New Research
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <BookOpenIcon className="mx-auto mb-4" size={48} />
          <p className="text-lg">No research projects yet</p>
          <p className="mt-2">Start by creating a new research topic</p>
          <Link
            to="/new"
            className="inline-block mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg"
          >
            Get Started
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/research/${project.id}`}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-emerald-500/50 transition-colors"
            >
              <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.topic}</p>
              <div className="flex items-center gap-2 text-sm">
                {project.status === 'completed' && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle size={14} /> Completed
                  </span>
                )}
                {project.status === 'active' && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Clock size={14} /> In Progress
                  </span>
                )}
                {project.status === 'failed' && (
                  <span className="flex items-center gap-1 text-red-400">
                    <AlertCircle size={14} /> Failed
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function BookOpenIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}
