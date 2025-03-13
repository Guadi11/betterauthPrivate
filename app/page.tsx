import IngresosButton from "@/components/PEN/ingresos-button";
import OrganizationButton from "@/components/Vinculaciones/organizations-button";
import SessionCard from "@/components/session-card-sv";
import SignInButton from "@/components/sign-in-button";
import SignOutButton from "@/components/sign-out-button";
import SignUpButton from "@/components/sign-up";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 space-y-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">LANDING PAGE BetterAuth Project</h1>
        
        <SessionCard/>
        
        <div className="grid grid-cols-3 gap-4">
          <SignUpButton />
          <SignInButton />
          <SignOutButton />
        </div>
        
        
        <div className="grid grid-cols-2 gap-4">
          <OrganizationButton />
          <IngresosButton />
        </div>
      </div>
    </div>
  );
}