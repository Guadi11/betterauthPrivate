import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId, organizationId, role } = await request.json();

    if (!userId || !organizationId || !role) {
      return NextResponse.json(
        { error: "Se requieren userId, organizationId y role" },
        { status: 400 }
      );
    }

    // Agregar al usuario como miembro de la organización
    await auth.api.addMember({
      body: {
        userId,
        organizationId,
        role
      },
      headers: request.headers
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error al agregar miembro:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error del servidor" },
      { status: 500 }
    );
  }
}