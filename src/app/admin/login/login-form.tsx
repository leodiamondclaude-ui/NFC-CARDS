"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { login, type LoginState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {} as LoginState);
  return (
    <form action={action} className="space-y-4">
      <Field id="a-email" label="Email">
        <input id="a-email" name="email" type="email" autoComplete="username" required defaultValue={state.email} className="field" />
      </Field>
      <Field id="a-password" label="Password">
        <input id="a-password" name="password" type="password" autoComplete="current-password" required className="field" />
      </Field>
      {state.error && (
        <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
