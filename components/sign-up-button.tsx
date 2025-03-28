import Link from "next/link";
import { buttonVariants } from "./ui/button";

export default function SignUpButton() {
  return (
    <Link href="/signup" className={buttonVariants({variant: 'default', size: 'sidenav'})}>
      Registrar un Usuario
    </Link>
  );
}
