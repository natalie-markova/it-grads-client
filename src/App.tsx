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
  
  // Сохраняем пользователя в localStorage при изменении
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);
  
  useEffect(() => {
    const checkAuth = async () => {
      // Сначала загружаем пользователя из localStorage (основной источник авторизации)
      const savedUser = localStorage.getItem('user');
      const savedAccessToken = localStorage.getItem('accessToken');
      
      if (savedUser && savedAccessToken) {
        try {
          const parsedUser = JSON.parse(savedUser);
          // Устанавливаем пользователя из localStorage - это основной источник авторизации
          setUser(parsedUser);
          setIsLoading(false);
          
          // Проверяем на сервере в фоне ТОЛЬКО для обновления токена
          // НЕ используем результат для определения авторизации
          try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
            const response = await axios.get(`${apiUrl}/tokens/refresh`,
              {
                withCredentials: true,
                timeout: 3000 // Короткий таймаут для Safari
              }
            );
            if (response.status === 200 && response.data.user) {
              // Обновляем пользователя и токен с сервера, если запрос успешен
              setUser(response.data.user);
              if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
              }
            }
          } catch (error: any) {
            // ИГНОРИРУЕМ все ошибки при проверке на сервере
            // Пользователь остается залогиненным с данными из localStorage
            // Это критично для Safari, где cookies могут не работать
          }
          return; // Выходим, так как пользователь уже залогинен
        } catch (e) {
          // Если не удалось распарсить, удаляем
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
        }
      }
      
      // Если нет данных в localStorage, проверяем на сервере
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
        const response = await axios.get(`${apiUrl}/tokens/refresh`,
          {
            withCredentials: true,
            timeout: 5000
          }
        );
        if (response.status === 200 && response.data.user) {
          setUser(response.data.user);
          if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
          }
        } else {
          setUser(null);
        }
      } catch (error: any) {
        // Если нет данных в localStorage и ошибка, разлогиниваем
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
