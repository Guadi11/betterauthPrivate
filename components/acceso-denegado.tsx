export default function AccesoDenegado(){
  return (
    <div className="max-w-md w-full mx-auto my-5 border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center">
      <div className="bg-red-100 rounded-full p-3 mb-4">
        {/* Lock icon SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 text-red-500"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      
      <h2 className="text-xl font-medium text-red-500 mb-4">
        Acceso Restringido
      </h2>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 flex items-center gap-3 w-full mb-4">
        {/* Alert Circle icon SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-yellow-500 flex-shrink-0"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
        <span className="text-sm text-yellow-800">No tiene acceso a esta información</span>
      </div>
      
      <p className="text-sm text-gray-600">
        Póngase en contacto con el administrador si cree que esto es un error.
      </p>
    </div>
  );
};
