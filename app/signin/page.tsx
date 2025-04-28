import SignInForm from "@/components/sign-in-form";
import { ShieldUser } from "lucide-react";

export default function SignInPage(){
    return(
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-50 rounded-lg shadow-md">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <ShieldUser className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-blue-600">Cargo Contra Inteligencia</h1>
                    <p className="mt-2 text-gray-600">Ingrese sus credenciales para acceder</p>
                </div>
                <SignInForm />
            </div>
    );
}