import Link from "next/link";

export default async function IngresosButton(){

    return(
              <Link href="/ingresos">
                <button className="mb-4 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
                  Ver Ingresos
                </button>
              </Link>
    );
}