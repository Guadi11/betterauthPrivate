import CreateOrganizationsButton from "@/components/create-organizations-button";
import SessionCard from "@/components/session-card-sv";
import SignInButton from "@/components/sign-in-button";
import SignOutButton from "@/components/sign-out-button";
import SignUpButton from "@/components/sign-up";

export default function Home() {
  return (
    <div className="lex flex-col items-center w-full max-w-xs">
      <h1 className="text-2xl font-bold mb-4">BetterAuth Project</h1>
      <SessionCard/>
      <SignUpButton/>
      <SignInButton/>
      <SignOutButton/>
      <CreateOrganizationsButton/>
    </div>
  );
}
