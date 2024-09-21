import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import { redirect, useNavigate } from 'react-router-dom';


const Auth: React.FC = () => {
  const { isLoggedIn, logIn, logOut, setToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      const data = await response.json();
      console.log('Login successful:', data);

      // Store the token in context
      setToken(data.access_token);
      logIn();

      navigate('/')
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Registration failed. Please try again.');
      }

      const data = await response.json();
      console.log('Registration successful:', data);

      // Optionally log in the user after successful registration
      logIn();
      
      navigate('/')

    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  

    return (
  //     <div className=" h-full items-center text-gray-900 flex justify-center">
  //   <div className="max-w-screen-xl flex w-full">
  //     <div className="lg:w-1/2 w-full p-6 bg-white rounded shadow-md flex flex-col justify-center">
  //       {isLoggedIn ? (
  //         <>
  //           <h2 className="text-2xl mb-4 text-center">Welcome!</h2>
  //           <button
  //             onClick={handleLogout}
  //             className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
  //           >
  //             Logout
  //           </button>
  //         </>
  //       ) : (
  //         <>
  //           <h2 className="text-2xl mb-4 text-center">{isRegistering ? 'Register' : 'Login'}</h2>
  //           <form onSubmit={isRegistering ? handleRegister : handleLogin}>
  //             <div className="mb-4">
  //               <label className="block text-gray-700">Email</label>
  //               <input
  //                 type="email"
  //                 value={email}
  //                 onChange={(e) => setEmail(e.target.value)}
  //                 className="mt-1 block w-full p-2 border border-gray-300 rounded"
  //                 required
  //               />
  //             </div>
  //             <div className="mb-4">
  //               <label className="block text-gray-700">Password</label>
  //               <input
  //                 type="password"
  //                 value={password}
  //                 onChange={(e) => setPassword(e.target.value)}
  //                 className="mt-1 block w-full p-2 border border-gray-300 rounded"
  //                 required
  //               />
  //             </div>
  //             {error && <div className="text-red-500 mb-2">{error}</div>}
  //             <button
  //               type="submit"
  //               className={`w-full ${loading ? 'bg-gray-400' : 'bg-blue-500'} text-white p-2 rounded hover:bg-blue-600`}
  //               disabled={loading}
  //             >
  //               {loading ? (isRegistering ? 'Registering...' : 'Logging in...') : (isRegistering ? 'Register' : 'Login')}
  //             </button>
  //           </form>
  //           <div className="mt-4 text-center">
  //             <button
  //               onClick={() => setIsRegistering(!isRegistering)}
  //               className="text-blue-500 hover:underline"
  //             >
  //               {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
  //             </button>
  //           </div>
  //         </>
  //       )}
  //     </div>
  //     <div className="hidden lg:flex lg:w-1/2 justify-center items-center">
  //       <img 
  //         src="https://drive.google.com/uc?export=view&id=1MFiKAExRFF0-2YNpAZzIu1Sh52J8r16v" 
  //         alt="Illustration" 
  //         className="object-cover h-64 w-full"
  //       />
  //     </div>
  //   </div>
  // </div>

    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center pt-12">
    <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
            <div>
                
            </div>
            <div className="mt-12 flex flex-col items-center">
                <div className="w-full flex-1 mt-8">
                    <div className="flex flex-col items-center">
                        <button
                            className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-green-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline">
                            
                            <span className="ml-4 text-3xl">
                                Label It
                            </span>
                        </button>

                    </div>

                    <div className="my-12 border-b text-center">
                        <div
                            className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                            {isRegistering ? "Register Now" : "Login Now"}
                        </div>
                    </div>

                    <div className="mx-auto max-w-xs">
                        <input
                            className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
                        <input
                            className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                            type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
                        <button
                            onClick={isRegistering? handleRegister: handleLogin}
                            className="mt-5 tracking-wide font-semibold bg-green-400 text-white-500 w-full py-4 rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none">
                            
                            <svg className="w-6 h-6 -ml-2" fill="none" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round">
                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <path d="M20 8v6M23 11h-6" />
                            </svg>
                            <span className="ml-3">
                            {isRegistering ? "Register" : "Sign In"}
                            </span>
                        </button>
                        <p className="mt-6 text-xs text-gray-600 text-center">
                            I agree to abide by Label It {" "}
                            <a href="#" className="border-b border-gray-500 border-dotted">
                                Terms of Service
                            </a>
                            and its {" "}
                            <a href="#" className="border-b border-gray-500 border-dotted">
                                Privacy Policy
                            </a>
                        </p>
                    </div>
                    <div className="mt-4 text-center">
               <button
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-slate-600 hover:underline"
                >
                  {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
                </button>
              </div>
                </div>
            </div>
        </div>
        <div className="flex-1 bg-green-100 text-center hidden lg:flex">
            <div className="m-12 xl:m-16 w-full bg-contain bg-center h-full bg-no-repeat"
              >
                <img src='/magr.png' className=' object-cover h-[70vh] w-full'/>
                 
            </div>
        </div>
    </div>
</div>
  );
};

export default Auth;
