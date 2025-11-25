import { NavLink, useNavigate } from "react-router-dom";
import { $api } from "../../../utils/axios.instance";
import { User } from "../../../types";

interface NavbarProps {
    user: User | null;
    setUser: (user: User | null) => void;
}

const Navbar = ({ user, setUser }: NavbarProps) => {
    const navigate = useNavigate();
    
    function logoutHandler() {
        $api("/users/logout")
        .then((response) => {
            if (response.status === 200) {
                setUser(null)
                navigate("/login");
            }
        })
        .catch((err) => console.error(err));
    }
    
    return (
        <nav className="flex gap-6 items-center px-8 py-4 bg-white/5 backdrop-blur-lg border-b border-white/10 rounded-b-xl">
            {user ? (
                <>
                    <NavLink 
                        to="/main" 
                        className={({ isActive }) => 
                            `text-white/80 no-underline font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
                                isActive 
                                    ? 'text-orange-400 bg-orange-500/10' 
                                    : 'hover:text-white hover:bg-white/10'
                            }`
                        }
                    >
                        Главная
                    </NavLink>
                    <NavLink
                        to='/interview/setup'   
                        className={({ isActive }) => 
                            `text-white/80 no-underline font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
                                isActive 
                                    ? 'text-orange-400 bg-orange-500/10' 
                                    : 'hover:text-white hover:bg-white/10'
                            }`
                        }
                    >
                    Симулятор интервью
                    </NavLink>
                    <button 
                        onClick={logoutHandler} 
                        className="bg-red-500/20 border border-red-500/40 rounded-lg px-4 py-2 text-red-400 font-medium cursor-pointer transition-all duration-300 hover:bg-red-500/30 hover:border-red-500/60"
                    >
                        Выход
                    </button>
                </>
            ) : (
                <>
                    <NavLink 
                        to="/home" 
                        className={({ isActive }) => 
                            `text-white/80 no-underline font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
                                isActive 
                                    ? 'text-orange-400 bg-orange-500/10' 
                                    : 'hover:text-white hover:bg-white/10'
                            }`
                        }
                    >
                        Домашняя
                    </NavLink>
                    <NavLink 
                        to="/registration" 
                        className={({ isActive }) => 
                            `text-white/80 no-underline font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
                                isActive 
                                    ? 'text-orange-400 bg-orange-500/10' 
                                    : 'hover:text-white hover:bg-white/10'
                            }`
                        }
                    >
                        Регистрация
                    </NavLink>
                    <NavLink 
                        to="/login" 
                        className={({ isActive }) => 
                            `text-white/80 no-underline font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
                                isActive 
                                    ? 'text-orange-400 bg-orange-500/10' 
                                    : 'hover:text-white hover:bg-white/10'
                            }`
                        }
                    >
                        Войти на сайт
                    </NavLink>
                </>
            )}
        </nav>
    );
};

export default Navbar;
