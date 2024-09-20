// src/components/NavBar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
export const NavBar = () => 
{ 
  const { isLoggedIn } = useAuth();

  return (
  <nav className=' flex flex-row gap-2 bg-slate-900 px-4 text-2xl py-2 text-slate-400 '>
    <Link to="/"      className=' hover:text-white'>Home</Link>
    <Link to="/login" className=' hover:text-white'>
    {isLoggedIn? "LogOut":"Login"}
    </Link>
  </nav>)}
;
