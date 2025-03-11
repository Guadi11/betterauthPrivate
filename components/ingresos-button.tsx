import Link from "next/link";

export default function IngresosButton(){
    return(
              <Link href="/ingresos">
                <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Ver Ingresos
                </button>
              </Link>
    );
}