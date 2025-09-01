"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { ORGANIZATION_IDS } from "@/lib/organization/organization-ids";
// ⬇️ Ajustá esta ruta si tu actions.ts está en otro lugar
import { createMemberServerAction } from "@/lib/actions";

// shadcn ui
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const ORG_VALUES = [
  ORGANIZATION_IDS.PERSONAL_VINCULACIONES,
  ORGANIZATION_IDS.PERSONAL_ESTABLECIMIENTOS_NAVALES,
  ORGANIZATION_IDS.PERSONAL_PASES,
] as const;

const ORG_OPTIONS = [
  { id: ORGANIZATION_IDS.PERSONAL_VINCULACIONES, label: "Personal Vinculaciones" },
  { id: ORGANIZATION_IDS.PERSONAL_ESTABLECIMIENTOS_NAVALES, label: "Establecimientos Navales" },
  { id: ORGANIZATION_IDS.PERSONAL_PASES, label: "Pases" },
] as const;

const SignUpSchema = z
  .object({
    name: z.string().min(2, "Ingresá un nombre válido"),
    username: z.string().min(3, "Mínimo 3 caracteres"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Repetí la contraseña"),
    organizationId: z.enum(ORG_VALUES, { required_error: "Seleccioná una organización" }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

type FormValues = z.infer<typeof SignUpSchema>;

function internalEmailFrom(username: string) {
  return `${username}@internal.local`;
}

export default function SignUpForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
      organizationId: undefined as unknown as FormValues["organizationId"], // obliga a elegir
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const email = internalEmailFrom(values.username);

      // Registro en el CLIENTE (Plan A)
      const { data, error } = await authClient.signUp.email({
        email,
        name: values.name,
        password: values.password,
        username: values.username,
        displayUsername: values.username
      });

      if (error) {
        toast.error(error.message ?? "No se pudo registrar el usuario");
        return;
      }

      toast.success("Usuario creado correctamente");

      // Intento de membresía: rol oculto = "admin"
      try {
        await createMemberServerAction({
          userId: data.user.id,
          organizationId: values.organizationId,
          role: "admin",
        });
        toast.success("Membresía creada.");
      } catch (err) {
        console.error(err);
        toast.message("Usuario creado. No se pudo asignar la membresía (revisá logs).");
      }

      router.push("/"); // ajustá destino
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error("Error inesperado al registrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input id="name" placeholder="Nombre y apellido" disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de usuario</FormLabel>
                <FormControl>
                  <Input id="username" placeholder="usuario" disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input id="password" type="password" placeholder="••••••••" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <FormControl>
                    <Input id="confirmPassword" type="password" placeholder="••••••••" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />          </div>

          <FormField
            control={form.control}
            name="organizationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organización</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger id="organizationId">
                      <SelectValue placeholder="Seleccioná una organización" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ORG_OPTIONS.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Rol oculto = "admin" (se aplica al crear la membresía) */}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creando usuario..." : "Crear usuario"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
