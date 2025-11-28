import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/pages/Navbar/Navbar";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";
import { type User, type OutletContext } from "./types";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/common/ScrollToTop/ScrollToTop";

const App = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
        const response = await axios(`${apiUrl}/tokens/refresh`,
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error: any) {
        if (error.response?.status !== 401) {
          console.error("Ошибка при проверке авторизации:", error);
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading</div>;
  }
  
  const contextValue: OutletContext = { user, setUser };
  
  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <ScrollToTop />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Navbar user={user} setUser={setUser}/> 
      <main className="flex-grow">
        <Outlet context={contextValue}/>
      </main>
      <Footer user={user} />
    </div>
  );
};

export default App;
