// src/pages/Login.jsx
import React, { useState } from 'react'; 


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo size="large" showText={true} />
        </div>
        
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Your existing login form */}
        </div>
      </div>
    </div>
  );
};

export default Login;