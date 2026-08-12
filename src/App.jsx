import { Route, Routes } from 'react-router-dom'
import MapPage from './pages/MapPage.jsx'
import LogPage from './pages/LogPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import BottomNav from './components/BottomNav.jsx'

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/log" element={<LogPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <BottomNav />
    </div>
  )
}
