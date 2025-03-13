"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false); // Estado de carga

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Inicia la carga y bloquea el botón

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
        router.push("/"); // Redirigir después del login
        router.refresh(); // Recargar pagina principal asi se muestra la sidenav
      }
    } catch (err) {
      console.error("Error en el inicio de sesión:", err);
      alert("Error al iniciar sesión.");
    } finally {
      setLoading(false); // Finaliza la carga y desbloquea el botón
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
            disabled={loading} // Deshabilitar input si está cargando
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
            disabled={loading} // Deshabilitar input si está cargando
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} // Deshabilitar botón si está cargando
          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Ingresando..." : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
}
