import Link from "next/link";

export default function OrganizationButton(){
    return(
              <Link href="/organizations">
                <button className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
                  Ir a Organizaciontes
                </button>
              </Link>
    );
}