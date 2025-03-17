import Link from "next/link";

export default function ConfeccionarPATBoton(){
    return (
        <Link href="/confeccionar_pat">
            <button className="mb-4 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
                Confeccionar PAT
            </button>
        </Link>
    );
}