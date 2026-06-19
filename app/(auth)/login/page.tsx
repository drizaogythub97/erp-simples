import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { LoginForm } from "./login-form";

export const metadata = {
  title: "Entrar — ERP Simples",
};

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <Card className="p-6">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Entrar</CardTitle>
        <CardDescription className="text-base">
          Acesse sua conta com e-mail e senha.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <LoginForm />
        <p className="text-muted-foreground text-center text-base">
          Não tem uma conta?{" "}
          <Link
            href="/signup"
            className="text-primary font-medium underline underline-offset-4 hover:no-underline"
          >
            Criar conta
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
