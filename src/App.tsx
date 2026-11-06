import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { StorageNotice } from './components/ui/StorageNotice';
import { restaurant } from './config/restaurant.config';
import Home from './routes/Home';
import NotFound from './routes/NotFound';
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
        <header className="foundation-header">
          <Link to="/">{restaurant.name}</Link>
          <nav aria-label="Main navigation">
            <Link to="/menu">Menu</Link>
            <Link to="/reserve">Reserve</Link>
            <Link to="/dashboard">Dashboard</Link>
          </nav>
        </header>
        <main id="main" tabIndex={-1}>
          <Suspense
            fallback={
              <p className="recovery" role="status">
                Setting your table?
              </p>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<ComingSoon />} />
              <Route path="/reserve" element={<ComingSoon />} />
              <Route path="/dashboard" element={<ComingSoon />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <RouteFocus />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
