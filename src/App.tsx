import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import Home from './pages/Home'

const Admin = lazy(() => import('./pages/Admin'))

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/admin"
        element={
          <Suspense fallback={<div className="min-h-screen bg-[#F3F6FB]" />}>
            <Admin />
          </Suspense>
        }
      />
    </Routes>
  )
}
