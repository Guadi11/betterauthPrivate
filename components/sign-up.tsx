"use client";

import Link from "next/link";

export default function SignUpButton() {
  return (
    <Link href="/signup">
      <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        Registrarse
      </button>
    </Link>
  );
}
