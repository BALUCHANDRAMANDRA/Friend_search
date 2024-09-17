import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css'

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        username,
        password,
      });

      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);  
        navigate('/home');
      }
    } catch (err) {
      setError(err.response ? err.response.data.error : 'An error occurred');
    }
  };

  return (
    <div className="auth-container">
      <h1>Login</h1>
      {error && <div className="error-message">{error}</div>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <div className="register-link">
        <span>Don't have an account? </span>
        <a href="/signup">Register here</a>
      </div>
    </div>
  );
};
