import Link from "next/link";
import Image from 'next/image';
import SignOutButton from "../sign-out-button";

export default function Sidebar() {
    return (
      <div className="bg-white h-screen w-64 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-black text-white p-2 rounded flex items-center justify-center">
                <Image 
                src="/shield-user.svg" 
                alt="CI Logo" 
                width={20} 
                height={20} 
                />
            </div>
            <span className="font-medium text-gray-800">Contra Inteligencia</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-4 px-2 space-y-1">
          
        </nav>
   
        <SignOutButton/>
        
      </div>
    );
  }