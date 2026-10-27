"use client";

import { useEffect, useRef, useState } from "react";

const ELEMENT_ID = "opd-qr-scanner";

export function QrScanner({
  onScan,
  active,
}: {
  onScan: (payload: string) => void;
  active: boolean;
}) {
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (cancelled) return;
      const scanner = new Html5Qrcode(ELEMENT_ID);
      scannerRef.current = scanner;
      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 220 },
          (decodedText) => onScan(decodedText),
          () => {
            // ignore per-frame "no QR found" callbacks
          }
        )
        .then(() => {
          startedRef.current = true;
        })
        .catch((err) => {
          if (!cancelled) setError(err?.message ?? "Could not access the camera—use the manual entry below.");
        });
    });

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      if (!scanner || !startedRef.current) return;
      startedRef.current = false;
      try {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {});
      } catch {
        // Scanner was never fully running - nothing to clean up.
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className="flex flex-col gap-2">
      <div id={ELEMENT_ID} className="w-full overflow-hidden rounded-xl bg-black" />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
