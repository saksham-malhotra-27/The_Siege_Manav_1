import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
export const Footer = () => {
  const { isLoggedIn } = useAuth();

  return (
    <nav className="fixed z-50 w-full px-4 h-[8vh] flex items-center bg-slate-200 rounded-b-md">
      <div className="basis-1/3 flex gap-2">
        <p className="font-semibold text-slate-900 text-lg">Prod.</p>
        <img src="" alt="" className="" />
      </div>
      <div className="basis-1/3 flex justify-center text-lg hover:opacity-80">
        <Link to="/" className="">
          Home
        </Link>
      </div>
      <div className="flex basis-1/3 justify-end">
        <Link
          to="/login"
          className="text-white bg-slate-600 px-4 py-2 rounded-md hover:opacity-90"
        >
          {isLoggedIn ? "LogOut" : "Login"}
        </Link>
      </div>
    </nav>
  );
};
