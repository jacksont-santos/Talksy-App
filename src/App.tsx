import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/common/ToasterProvider";
import { ServicesProvider } from "./contexts/ServicesContext";
import { AuthProvider } from "./contexts/AuthContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import { AuthScreen } from "./components/auth/AuthScreen";
import { HomePage } from "./components/room/Home";

function App() {
  return (
    <ToastProvider>
      <LoadingProvider>
        <ServicesProvider>
          <AuthProvider>
            <WebSocketProvider>
              <Router>
                <div className="flex flex-col w-screen h-screen overflow-hidden bg-gray-300 dark:bg-[#161616]">
                  <main className="flex-grow h-[100vh] overflow-hidden">
                    <Routes>
                      <Route path="/" element={<AuthScreen />} />
                      <Route path="/home" element={<HomePage />} />
                    </Routes>
                  </main>
                </div>
              </Router>
            </WebSocketProvider>
          </AuthProvider>
        </ServicesProvider>
      </LoadingProvider>
    </ToastProvider>
  );
}

export default App;
