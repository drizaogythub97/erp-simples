"use client";

import { Trash2 } from "lucide-react";
import { useActionState, useState, useTransition } from "react";

import { ErrorAlert, SuccessAlert } from "@/components/auth/form-feedback";
import { PasswordField } from "@/components/auth/password-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  deleteAccount,
  type ProfileFormState,
  updateProfile,
} from "./actions";

const initialState: ProfileFormState = {};

type Props = {
  initialFullName: string;
  email: string;
  createdAt: string | null;
  privacyAcceptedAt: string | null;
};

const DATE_FMT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function AccountClient({
  initialFullName,
  email,
  createdAt,
  privacyAcceptedAt,
}: Props) {
  const [state, formAction] = useActionState(updateProfile, initialState);
  const [fullName, setFullName] = useState(initialFullName);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmDelete() {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteAccount(password);
      if (result && result.ok === false) {
        setDeleteError(result.error);
      }
      // Em caso de sucesso o servidor redireciona para "/" e a página recarrega.
    });
  }

  function closeDialog() {
    if (pending) return;
    setDialogOpen(false);
    setPassword("");
    setDeleteError(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <section
        aria-labelledby="profile-heading"
        className="ring-foreground/10 bg-card flex flex-col gap-4 rounded-xl p-5 ring-1"
      >
        <header>
          <h2 id="profile-heading" className="text-xl font-semibold">
            Dados pessoais
          </h2>
          <p className="text-muted-foreground text-base">
            O e-mail é fixo e usado para entrar no sistema.
          </p>
        </header>
        <form action={formAction} className="flex flex-col gap-4">
          {state.error ? <ErrorAlert message={state.error} /> : null}
          {state.ok ? <SuccessAlert message="Dados atualizados." /> : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-base">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              readOnly
              disabled
              className="h-14 text-lg"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName" className="text-base">
              Nome completo
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              aria-invalid={Boolean(state.fieldErrors?.fullName)}
              aria-describedby={
                state.fieldErrors?.fullName ? "fullName-error" : undefined
              }
              className="h-14 text-lg"
              required
              minLength={2}
              maxLength={120}
            />
            {state.fieldErrors?.fullName ? (
              <p
                id="fullName-error"
                className="text-destructive text-sm"
                role="alert"
              >
                {state.fieldErrors.fullName}
              </p>
            ) : null}
          </div>
          <SubmitButton className="sm:max-w-xs" pendingText="Salvando…">
            Salvar alterações
          </SubmitButton>
        </form>
        {createdAt || privacyAcceptedAt ? (
          <div className="text-muted-foreground border-border space-y-1 border-t pt-4 text-sm">
            {createdAt ? (
              <p>
                Conta criada em{" "}
                <strong className="text-foreground font-medium">
                  {DATE_FMT.format(new Date(createdAt))}
                </strong>
                .
              </p>
            ) : null}
            {privacyAcceptedAt ? (
              <p>
                Política de privacidade aceita em{" "}
                <strong className="text-foreground font-medium">
                  {DATE_FMT.format(new Date(privacyAcceptedAt))}
                </strong>
                .
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section
        aria-labelledby="danger-heading"
        className="ring-destructive/30 bg-destructive/5 flex flex-col gap-4 rounded-xl p-5 ring-1"
      >
        <header>
          <h2
            id="danger-heading"
            className="text-destructive text-xl font-semibold"
          >
            Excluir conta
          </h2>
          <p className="text-foreground/80 text-base">
            Esta ação <strong>não pode ser desfeita</strong>. Todos os seus
            produtos, vendas, código de barras, taxas, logo e dados pessoais
            serão apagados imediatamente.
          </p>
        </header>
        <Button
          type="button"
          variant="destructive"
          onClick={() => setDialogOpen(true)}
          className="h-12 px-5 text-base sm:self-start"
        >
          <Trash2 aria-hidden="true" className="size-4" />
          Excluir minha conta
        </Button>
      </section>

      <ConfirmDialog
        open={dialogOpen}
        onClose={closeDialog}
        title="Excluir conta definitivamente?"
        description={
          <span>
            Confirme sua senha para apagar todos os seus dados. Essa ação{" "}
            <strong className="text-foreground">não pode ser desfeita</strong>.
          </span>
        }
        confirmLabel="Excluir conta"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
        pending={pending}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="delete-password" className="text-base">
            Sua senha
          </Label>
          <PasswordField
            id="delete-password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
            className="h-14 text-lg"
          />
          {deleteError ? (
            <p className="text-destructive text-sm" role="alert">
              {deleteError}
            </p>
          ) : null}
        </div>
      </ConfirmDialog>
    </div>
  );
}
