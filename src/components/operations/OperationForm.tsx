"use client";
import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api-client";
import type { OperationsWords } from "./operations-copy";
export interface OperationField {
  key: string;
  label: string;
  type?: "text" | "password" | "email" | "number" | "checkbox";
  min?: number;
  max?: number;
  maxLength?: number;
  options?: { value: string; label: string }[];
  optional?: boolean;
  mustBeTrue?: boolean;
}
const uncertain = new Map<
  string,
  { values: Record<string, string | boolean>; request: string }
>();
export function OperationForm({
  title,
  description,
  fields,
  initial,
  onSubmit,
  onClose,
  c,
  intentKey,
  children,
  submitLabel,
}: {
  title: string;
  description?: string;
  fields: OperationField[];
  initial: Record<string, string | boolean>;
  onSubmit: (
    values: Record<string, string | boolean>,
    requestId: string,
  ) => Promise<void>;
  onClose: () => void;
  c: OperationsWords;
  intentKey?: string;
  children?: React.ReactNode;
  submitLabel?: string;
}) {
  const pending = intentKey ? uncertain.get(intentKey) : undefined;
  const [values, setValues] = useState(pending?.values || initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [invalid, setInvalid] = useState(""),
    [showPassword, setShowPassword] = useState(false);
  const frozen = useRef<typeof initial | null>(pending?.values || null),
    request = useRef(pending?.request || crypto.randomUUID()),
    flight = useRef(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (flight.current) return;
    const bad = fields.find((f) => {
      const v = values[f.key];
      if (f.type === "checkbox") return f.mustBeTrue === true && v !== true;
      if (f.optional && !String(v || "").trim()) return false;
      if (!f.optional && !String(v || "").trim()) return true;
      if (f.type === "password" && String(v).length < 12) return true;
      if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)))
        return true;
      if (f.type === "number") {
        const n = Number(v);
        return (
          !Number.isFinite(n) ||
          !Number.isInteger(n) ||
          (f.min !== undefined && n < f.min) ||
          (f.max !== undefined && n > f.max)
        );
      }
      return false;
    });
    if (bad) {
      setInvalid(bad.key);
      setError(c.failure + " · " + bad.label);
      document.getElementById("operation-" + bad.key)?.focus();
      return;
    }
    flight.current = true;
    setBusy(true);
    setError("");
    setInvalid("");
    frozen.current ??= { ...values };
    if (intentKey)
      uncertain.set(intentKey, {
        values: frozen.current,
        request: request.current,
      });
    try {
      await onSubmit(frozen.current, request.current);
      if (intentKey) uncertain.delete(intentKey);
      onClose();
    } catch (error) {
      const ambiguous =
        error instanceof ApiError &&
        (error.status === 0 || error.status >= 500);
      if (!ambiguous) {
        frozen.current = null;
        if (intentKey) uncertain.delete(intentKey);
      }
      setError(c.failure + (ambiguous ? " " + c.pending : ""));
    } finally {
      flight.current = false;
      setBusy(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent
        closeLabel={c.cancel}
        closeDisabled={busy}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description || title}</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={submit} className="space-y-4">
          {children}
          <fieldset disabled={busy || !!frozen.current} className="space-y-4">
            {fields.map((f) => (
              <div key={f.key} className="space-y-2">
                <Label htmlFor={`operation-${f.key}`}>{f.label}</Label>
                {f.type === "checkbox" ? (
                  <div>
                    <Checkbox
                      id={`operation-${f.key}`}
                      checked={values[f.key] === true}
                      aria-invalid={invalid === f.key}
                      aria-describedby={invalid === f.key ? "operation-error" : undefined}
                      onCheckedChange={(v) =>
                        setValues({ ...values, [f.key]: v === true })
                      }
                    />
                  </div>
                ) : f.options ? (
                  <Select
                    value={String(values[f.key] || "")}
                    onValueChange={(v) => setValues({ ...values, [f.key]: v })}
                    required={!f.optional}
                  >
                    <SelectTrigger id={`operation-${f.key}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`operation-${f.key}`}
                    type={
                      f.type === "password"
                        ? showPassword
                          ? "text"
                          : "password"
                        : f.type || "text"
                    }
                    value={String(values[f.key] ?? "")}
                    onChange={(e) =>
                      setValues({ ...values, [f.key]: e.target.value })
                    }
                    required={!f.optional}
                    min={f.min}
                    max={f.max}
                    maxLength={f.maxLength ?? 1000}
                    inputMode={f.type === "number" ? "numeric" : undefined}
                    autoComplete={
                      f.type === "password"
                        ? "new-password"
                        : f.type === "email"
                          ? "email"
                          : "off"
                    }
                    aria-invalid={invalid === f.key}
                    aria-describedby={
                      invalid === f.key ? "operation-error" : undefined
                    }
                  />
                )}
                {f.type === "password" && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? c.hidePassword : c.showPassword}
                  </Button>
                )}
              </div>
            ))}
          </fieldset>
          {error && (
            <p
              id="operation-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              autoFocus
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              {c.cancel}
            </Button>
            <Button type="submit" disabled={busy} aria-busy={busy}>
              {busy ? c.loading : frozen.current ? c.retry : submitLabel || c.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
