import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LotsProvider } from './context/LotsContext'
import FarmerHome from './screens/farmer/FarmerHome'
import FarmerPrices from './screens/farmer/FarmerPrices'
import FarmerLots from './screens/farmer/FarmerLots'
import FarmerProfile from './screens/farmer/FarmerProfile'
import FarmerMarket from './screens/farmer/FarmerMarket'
import FarmerCropDetail from './screens/farmer/FarmerCropDetail'
import FarmerCreateLot from './screens/farmer/FarmerCreateLot'
import FarmerActivity from './screens/farmer/FarmerActivity'
import FarmerLotDetail from './screens/farmer/FarmerLotDetail'

export default function App() {
  return (
    <LotsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/farmer/home" replace />} />

          {/* Farmer screens */}
          <Route path="/farmer/home"              element={<FarmerHome />} />
          <Route path="/farmer/market"            element={<FarmerMarket />} />
          <Route path="/farmer/market/:cropId"    element={<FarmerCropDetail />} />
          <Route path="/farmer/lots/create"       element={<FarmerCreateLot />} />
          <Route path="/farmer/lots/:lotId"       element={<FarmerLotDetail />} />
          <Route path="/farmer/activity"          element={<FarmerActivity />} />
          <Route path="/farmer/profile"           element={<FarmerProfile />} />

          {/* Phase 1 redirects */}
          <Route path="/farmer/prices"            element={<FarmerPrices />} />
          <Route path="/farmer/lots"              element={<FarmerLots />} />

          {/* Fallback */}
          <Route path="/farmer/*"                 element={<Navigate to="/farmer/home" replace />} />
        </Routes>
      </BrowserRouter>
    </LotsProvider>
  )
}
