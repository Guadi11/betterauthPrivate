import Link from "next/link";

export default async function RegistrosButton(){
    return(
        <Link href="/registrar-ingreso">
            <button className="mb-4 bg-yellow-400 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
                Registrar Ingreso
            </button>
        </Link>
    );
}