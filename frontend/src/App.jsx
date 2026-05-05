import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
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
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="new" element={<NewResearch />} />
          <Route path="research/:id" element={<ResearchView />} />
          <Route path="graph" element={<KnowledgeGraph />} />
          <Route path="search" element={<PaperSearch />} />
          <Route path="write/:projectId" element={<Writing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
