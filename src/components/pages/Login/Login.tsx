import { FormEvent } from "react";
import { $api, setAccessToken } from "../../../utils/axios.instance";
import { useNavigate, useOutletContext } from "react-router-dom";
import { OutletContext } from "../../../types";

function Login() {
    const { setUser } = useOutletContext<OutletContext>();
    const navigate = useNavigate();
    
    function submitHandler(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = {
            email: formData.get('email') as string,
            password: formData.get('password') as string
        };
        $api.post("/users/login", data)
        .then(data => {
            console.log("Response:", data.data);
            alert("Авторизация прошла успешно!");
            setAccessToken(data.data.accessToken)
            setUser(data.data.user)
            navigate('/main');
        })
        .catch(error => {
            console.error("Что-то пошло не так:", error.response?.data || error.message);
            alert("Ошибка авторизации. Проверьте логин и пароль.");
        });
    }
    
    return (
        <div className="flex justify-center items-center min-h-[80vh] p-8">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-10 w-full max-w-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <h2 className="text-white text-3xl font-bold mb-8 text-center">Вход</h2>
                <form onSubmit={submitHandler} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-white/80 text-sm font-medium">Email:</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white text-base transition-all duration-300 w-full focus:outline-none focus:border-orange-500/80 focus:bg-white/10 focus:ring-4 focus:ring-orange-500/10 placeholder:text-white/40"
                            required 
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="text-white/80 text-sm font-medium">Пароль:</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white text-base transition-all duration-300 w-full focus:outline-none focus:border-orange-500/80 focus:bg-white/10 focus:ring-4 focus:ring-orange-500/10 placeholder:text-white/40"
                            required 
                        />
                    </div>
                    <button type="submit" className="bg-gradient-to-r from-orange-600 to-orange-500 border-none rounded-lg px-6 py-3.5 text-white text-base font-semibold cursor-pointer transition-all duration-300 mt-2 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(234,88,12,0.4)] active:translate-y-0">Войти</button>
                </form>
            </div>
        </div>
    );
}

export default Login;
