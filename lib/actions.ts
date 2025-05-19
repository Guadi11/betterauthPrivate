"use server"

import { auth } from "@/lib/auth";

export async function createMemberServerAction({
  userId,
  organizationId,
  role,
}: {
  userId: string;
  organizationId: string;
  role: "admin" | "member" | "owner" | ("admin" | "member" | "owner")[];
}){ 
    console.log("➤ creando miembro con:", { userId, organizationId, role });

    await auth.api.addMember({
        body: {
            userId: userId,
            organizationId: organizationId,
            role: role, 
        }
    })
}