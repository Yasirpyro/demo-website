import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { StorageNotice } from './components/ui/StorageNotice';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import Home from './routes/Home';
import NotFound from './routes/NotFound';
const Menu = lazy(() => import('./routes/Menu'));
const Reserve = lazy(() => import('./routes/Reserve'));
const ComingSoon = lazy(() => import('./routes/ComingSoon'));
function RouteFocus() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
      document.getElementById('main')?.focus({ preventScroll: true });
    }
  }, [location.pathname, location.hash]);
  return null;
}
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <StorageNotice />
        <Header />
        <main id="main" tabIndex={-1}>
          <Suspense
            fallback={
              <p className="recovery" role="status">
                Setting your table…
              </p>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/reserve" element={<Reserve />} />
              <Route path="/dashboard" element={<ComingSoon />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <RouteFocus />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
