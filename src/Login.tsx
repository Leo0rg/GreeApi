import React, { useState } from 'react';

interface LoginProps {
  onLogin: (idInstance: string, apiTokenInstance: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(idInstance, apiTokenInstance);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>WhatsApp Web Clone</h2>
        <input
          type="text"
          placeholder="IdInstance"
          value={idInstance}
          onChange={(e) => setIdInstance(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="ApiTokenInstance"
          value={apiTokenInstance}
          onChange={(e) => setApiTokenInstance(e.target.value)}
          required
        />
        <button type="submit">Connect</button>
      </form>
    </div>
  );
};

export default Login; 