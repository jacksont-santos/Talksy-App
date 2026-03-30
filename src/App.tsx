import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/common/ToasterProvider";
import { HomePage } from "./components/room/Home";
import { AuthProvider } from "./contexts/AuthContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { LoadingProvider } from "./contexts/LoadingContext";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <LoadingProvider>
          <WebSocketProvider>
            <Router>
              <div className="flex flex-col w-screen h-screen overflow-hidden bg-gray-300 dark:bg-[#161616]">
                <main className="flex-grow h-[100vh] overflow-hidden">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                  </Routes>
                </main>
              </div>
            </Router>
          </WebSocketProvider>
        </LoadingProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
