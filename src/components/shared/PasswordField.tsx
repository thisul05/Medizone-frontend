"use client";

import { useState } from "react";
import { TextField, type TextFieldProps } from "./TextField";

export type PasswordFieldProps = Omit<TextFieldProps, "type" | "suffix">;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      suffix={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="-mr-1 rounded-sm px-2 py-1 mz-label text-primary-tint-ink transition-colors duration-150 hover:bg-primary-tint"
        >
          {visible ? "Hide" : "Show"}
        </button>
      }
    />
  );
}
