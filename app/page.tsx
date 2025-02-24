import SessionCard from "@/components/session-card";
import SignInButton from "@/components/sign-in-button";
import SignOutButton from "@/components/sign-out-button";
import SignUpButton from "@/components/sign-up";

export default function Home() {
  return (
    <div className="lex flex-col items-center w-full max-w-xs">
      <h1 className="text-2xl font-bold mb-4">BetterAuth Project</h1>
      {/*TODO mostrar los datos del usuario ingresado
      y boton de sign out*/}
      <SessionCard/>
      <SignUpButton/>
      <SignInButton/>
      <SignOutButton/>
    </div>
  );
}
