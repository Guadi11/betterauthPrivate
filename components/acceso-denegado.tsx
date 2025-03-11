import { AlertCircle, Lock } from "lucide";

export default function AccesoDenegado(){
  return (
    <div className="max-w-md w-full mx-auto border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center">
      <div className="bg-red-100 rounded-full p-3 mb-4">
        <Lock className="w-6 h-6 text-red-500" />
      </div>
      
      <h2 className="text-xl font-medium text-red-500 mb-4">
        Acceso Restringido
      </h2>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 flex items-center gap-3 w-full mb-4">
        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
        <span className="text-sm text-yellow-800">No tiene acceso a esta información</span>
      </div>
      
      <p className="text-sm text-gray-600">
        Póngase en contacto con el administrador si cree que esto es un error.
      </p>
    </div>
  );
};
