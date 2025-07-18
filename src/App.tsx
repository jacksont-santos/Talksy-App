import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { ToastProvider } from './components/common/ToasterProvider';
import { Home } from './pages/Home';
import { ChatRoomPage } from './pages/ChatRoom';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { LoadingProvider } from './contexts/LoadingContext';

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <WebSocketProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <ToastProvider>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/private/:roomId" element={<ChatRoomPage />} />
                    <Route path="/public/:roomId" element={<ChatRoomPage />} />
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