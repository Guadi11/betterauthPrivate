"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function SignInForm() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await authClient.signIn.username({
        username: form.username,
        password: form.password,
      });

      console.log("Server Response:", data, error);

      if (error) {
        alert("Error: " + error.message);
      } else {
        alert("Inicio de sesión exitoso.");
        // Aquí podrías redirigir al usuario a otra página
      }
    } catch (err) {
      console.error("Error en el inicio de sesión:", err);
      alert("Error al iniciar sesión.");
    }
  };

  return (
    <div className="w-full max-w-xs">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Usuario</label>
          <input 
            name="username" 
            type="text" 
            value={form.username} 
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Contraseña</label>
          <input 
            name="password" 
            type="password" 
            value={form.password} 
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}