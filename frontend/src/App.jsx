import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
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
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="new" element={<NewResearch />} />
          <Route path="research/:id" element={<ResearchView />} />
          <Route path="graph" element={<KnowledgeGraph />} />
          <Route path="search" element={<PaperSearch />} />
          <Route path="write/:projectId" element={<Writing />} />
        </Route>
        {/* Also keep old routes working */}
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
