import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/pages/Navbar/Navbar";
import { Outlet } from "react-router-dom";
import { User, OutletContext } from "./types";

const App = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios("http://localhost:5001/api/tokens/refresh",
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
    <>
      <nav className="flex gap-24">
        <Navbar user={user} setUser={setUser}/> 
      </nav>
      <main className="p-8 text-white/90 leading-relaxed">
        <Outlet context={contextValue}/>
      </main>
    </>
  );
};

export default App;
