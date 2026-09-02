import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/farmer/home" replace />} />
        <Route
          path="/farmer/*"
          element={
            <div style={{ padding: 'var(--space-4)', fontFamily: 'var(--font-core)' }}>
              <p style={{ color: 'var(--text-brand)', fontSize: 'var(--text-lg)' }}>
                Krishi Mitra — design tokens active
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                Phase 0 scaffold complete.
              </p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
