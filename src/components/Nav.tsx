// src/components/NavBar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";

export const NavBar = () => {
  const { isLoggedIn , logOut} = useAuth();

  const handleLogout = () => {
    logOut();
    alert('Logged out successfully!');
  };

  return (
    <nav className="fixed z-50 w-full px-4 h-[8vh] flex items-center  bg-green-300 rounded-b-md">
      <div className="basis-1/3 flex gap-2">
        <p className="font-bold text-slate-900 text-xl">Label Up</p>
        <img src="" alt="" className="" />
      </div>
      <div className="basis-1/3 flex justify-center text-lg hover:opacity-80">
        <Link to="/" className="">
          Home
        </Link>
      </div>
      <div className="flex basis-1/3 justify-end">
      {
        isLoggedIn? <button className="text-white bg-green-600 px-4 py-2 rounded-md hover:opacity-90" onClick={handleLogout}>
          Log Out
        </button>: 
        <Link
        to="/login"
        className="text-white bg-green-500 px-4 py-2 rounded-md hover:opacity-90"> login </Link>
      }
      </div>
    </nav>
  );
};
