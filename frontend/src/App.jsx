import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NewResearch from './pages/NewResearch'
import ResearchView from './pages/ResearchView'
import KnowledgeGraph from './pages/KnowledgeGraph'
import PaperSearch from './pages/PaperSearch'
import Writing from './pages/Writing'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* App */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
        </Route>
        <Route path="/new" element={<Layout />}>
          <Route index element={<NewResearch />} />
        </Route>
        <Route path="/research/:id" element={<Layout />}>
          <Route index element={<ResearchView />} />
        </Route>
        <Route path="/graph" element={<Layout />}>
          <Route index element={<KnowledgeGraph />} />
        </Route>
        <Route path="/search" element={<Layout />}>
          <Route index element={<PaperSearch />} />
        </Route>
        <Route path="/write/:projectId" element={<Layout />}>
          <Route index element={<Writing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
