// src/pages/Admin/Login.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Pastikan mengimpor file CSS

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Validasi username dan password
    if (username === 'admin' && password === 'password123') {
      // Jika username dan password benar, login
      login({ name: 'Admin' });
      alert('Login successful!');
      navigate('/admin/dashboard'); // Arahkan ke halaman dashboard setelah login sukses
    } else {
      alert('Invalid username or password');
    }
  };

  return (
    <div className="login-body">
      <div className="login-container">
        <h2 className="login-header">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="login-input-group">
            <label className="login-input-label">Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
            />
          </div>
          <div className="login-input-group">
            <label className="login-input-label">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;