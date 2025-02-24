"use client";

import Link from "next/link";

export default function SignInButton() {
  return (
    <Link href="/signin">
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        Iniciar Sesión
      </button>
    </Link>
  );
}
