import { Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import NavBar from './components/NavBar'
import Dashboard from './pages/Dashboard'
import Matches from './pages/Matches'
import Meta from './pages/Meta'
import Players from './pages/Players'

function App() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <NavBar />
      <main className="p-4 sm:p-6">
        <Routes>
          <Route
            path="/"
            element={
              <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary>
            }
          />
          <Route
            path="/players"
            element={
              <ErrorBoundary>
                <Players />
              </ErrorBoundary>
            }
          />
          <Route
            path="/matches"
            element={
              <ErrorBoundary>
                <Matches />
              </ErrorBoundary>
            }
          />
          <Route
            path="/meta"
            element={
              <ErrorBoundary>
                <Meta />
              </ErrorBoundary>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
