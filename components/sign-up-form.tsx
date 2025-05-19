"use client";

import { createMemberServerAction } from "@/lib/actions";
import { authClient } from "@/lib/auth-client";
import { ORGANIZATION_IDS } from "@/lib/organization/organization-ids";
import { useState } from "react";

const ROLES = ["member", "admin", "owner"] as const;

export default function SignUpForm() {
  const [form, setForm] = useState<{
  email: string;
  name: string;
  username: string;
  password: string;
  organizationId: string;
  role: "admin" | "member" | "owner";
}>({
  email: "",
  name: "",
  username: "",
  password: "",
  organizationId: ORGANIZATION_IDS.PERSONAL_VINCULACIONES,
  role: "member",
});

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

  const {data, error} = await authClient.signUp.email({
    email: form.email,
    name: form.name,
    password: form.password,
    username: form.username
  });
  console.log(data)
  if (error) {
    alert("Error: " + error.message);
  } else {
    console.log("usuario creado:", data.user.id);
    await createMemberServerAction({
      userId: data.user.id,
      organizationId: form.organizationId,
      role: form.role
    });
    alert("Registro exitoso. Ahora puedes iniciar sesión.");
  }
  };

  return (
    <div className="w-full max-w-xs">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
          <input name="email" type="text" value={form.email} onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Nombre</label>
          <input name="name" type="text" value={form.name} onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Nombre de Usuario</label>
          <input name="username" type="text" value={form.username} onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Contraseña</label>
          <input name="password" type="password" value={form.password} onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
        </div>

        {/* Organización */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="organizationId">Organización</label>
          <select name="organizationId" value={form.organizationId} onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            <option value={ORGANIZATION_IDS.PERSONAL_VINCULACIONES}>Personal Vinculaciones</option>
            <option value={ORGANIZATION_IDS.PERSONAL_ESTABLECIMIENTOS_NAVALES}>Establecimientos Navales</option>
            <option value={ORGANIZATION_IDS.PERSONAL_PASES}>Pases</option>
          </select>
        </div>

        {/* Rol */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">Rol</label>
          <select name="role" value={form.role} onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Registrarse
        </button>
      </form>
    </div>
  );
}
