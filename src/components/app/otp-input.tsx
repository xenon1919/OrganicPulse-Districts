"use client";

import { useRef } from "react";

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled,
}: {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  function setDigit(index: number, digit: string) {
    const chars = value.split("");
    chars[index] = digit;
    const next = chars.join("").slice(0, length);
    onChange(next);
    return next;
  }

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setDigit(index, "");
      return;
    }

    // Handles both a single keystroke and a full-code autofill landing in one box.
    if (digits.length > 1) {
      const next = (value.slice(0, index) + digits).slice(0, length);
      onChange(next);
      const lastFilled = Math.min(next.length, length) - 1;
      inputsRef.current[lastFilled]?.focus();
      if (next.length === length) onComplete?.(next);
      return;
    }

    const next = setDigit(index, digits);
    if (index < length - 1) inputsRef.current[index + 1]?.focus();
    if (next.length === length) onComplete?.(next);
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      setDigit(index - 1, "");
    }
    if (e.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < length - 1) inputsRef.current[index + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!digits) return;
    e.preventDefault();
    onChange(digits);
    const lastFilled = Math.min(digits.length, length) - 1;
    inputsRef.current[lastFilled]?.focus();
    if (digits.length === length) onComplete?.(digits);
  }

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }).map((_, i) => {
        const filled = Boolean(value[i]);
        return (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={disabled}
            value={value[i] ?? ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`Digit ${i + 1} of ${length}`}
            className={`h-10 w-9 shrink-0 rounded-lg border text-center text-base font-semibold tabular-nums outline-none transition-all duration-200 ease-out ${
              filled
                ? "scale-105 border-accent bg-accent/10 text-foreground"
                : "scale-100 border-input bg-transparent text-foreground"
            } focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-50`}
          />
        );
      })}
    </div>
  );
}
