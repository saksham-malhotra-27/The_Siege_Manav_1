import React, { useState } from 'react';
import { useAuth } from '../context/authContext';

const Auth: React.FC = () => {
  const { isLoggedIn, logIn, logOut, setToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      alert('Login successful!');
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
      alert('Registration successful! You can now log in.');
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logOut();
    setEmail(''); // Reset email state
    setPassword(''); // Reset password state
    alert('Logged out successfully!');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-96">
        {isLoggedIn ? (
          <>
            <h2 className="text-2xl mb-4 text-center ">Welcome!</h2>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl mb-4">{isRegistering ? 'Register' : 'Login'}</h2>
            <form onSubmit={isRegistering ? handleRegister : handleLogin}>
              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              {error && <div className="text-red-500 mb-2">{error}</div>}
              <button
                type="submit"
                className={`w-full ${loading ? 'bg-gray-400' : 'bg-blue-500'} text-white p-2 rounded hover:bg-blue-600`}
                disabled={loading}
              >
                {loading ? (isRegistering ? 'Registering...' : 'Logging in...') : (isRegistering ? 'Register' : 'Login')}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-blue-500 hover:underline"
              >
                {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
