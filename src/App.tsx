import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import Home from './pages/Home'
import { trackPageView } from './lib/analytics'
import { trackVisit } from './lib/track'

const Admin = lazy(() => import('./pages/Admin'))
const Vsl = lazy(() => import('./pages/Vsl'))
const Blog = lazy(() => import('./pages/Blog'))
const ArticleView = lazy(() => import('./pages/ArticleView'))

// Dispara PageView del pixel + visita propia en cada cambio de ruta (SPA)
function PageViewTracker() {
  const location = useLocation()
  useEffect(() => {
    trackPageView()
    trackVisit(location.pathname)
  }, [location.pathname])
  return null
}

export default function App() {
  return (
    <>
      <PageViewTracker />
      <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/vsl"
        element={
          <Suspense fallback={<div className="min-h-screen bg-[#044379]" />}>
            <Vsl />
          </Suspense>
        }
      />
      <Route
        path="/blog"
        element={
          <Suspense fallback={<div className="min-h-screen bg-[#F3F6FB]" />}>
            <Blog />
          </Suspense>
        }
      />
      <Route
        path="/blog/:slug"
        element={
          <Suspense fallback={<div className="min-h-screen bg-[#F3F6FB]" />}>
            <ArticleView />
          </Suspense>
        }
      />
      <Route
        path="/admin"
        element={
          <Suspense fallback={<div className="min-h-screen bg-[#F3F6FB]" />}>
            <Admin />
          </Suspense>
        }
      />
      </Routes>
    </>
  )
}
