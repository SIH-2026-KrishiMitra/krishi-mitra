import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import FarmerHome from './screens/farmer/FarmerHome'
import FarmerPrices from './screens/farmer/FarmerPrices'
import FarmerLots from './screens/farmer/FarmerLots'
import FarmerProfile from './screens/farmer/FarmerProfile'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/farmer/home" replace />} />
        <Route path="/farmer/home"    element={<FarmerHome />} />
        <Route path="/farmer/prices"  element={<FarmerPrices />} />
        <Route path="/farmer/lots"    element={<FarmerLots />} />
        <Route path="/farmer/profile" element={<FarmerProfile />} />
        <Route path="/farmer/*"       element={<Navigate to="/farmer/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
