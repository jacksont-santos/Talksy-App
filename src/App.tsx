import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { ToastProvider } from './components/common/ToasterProvider';
import { HomePage } from './components/room/Home';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { RoomMemoryHandler } from './components/room/RoomMemoryHandler';

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <WebSocketProvider>
          <Router>
            <div className="flex flex-col w-screen h-screen overflow-hidden bg-gray-300 dark:bg-[#161616]">
              <RoomMemoryHandler />
              <main className="flex-grow h-[100vh] overflow-hidden">
                <ToastProvider>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                  </Routes>
                </ToastProvider>
              </main>
            </div>
          </Router>
        </WebSocketProvider>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;