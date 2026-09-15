import { Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import Dashboard from './pages/Dashboard'
import Matches from './pages/Matches'
import Meta from './pages/Meta'
import Players from './pages/Players'

function App() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <NavBar />
      <main className="p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/players" element={<Players />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/meta" element={<Meta />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
