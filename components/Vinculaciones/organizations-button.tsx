import Link from "next/link";
import { buttonVariants } from "../ui/button";

export default function OrganizationButton(){
    return(
              <Link href="/organizations" className={buttonVariants({variant:'default', size: 'sidenav'})}>
                  Ir a Organizaciontes
              </Link>
    );
}