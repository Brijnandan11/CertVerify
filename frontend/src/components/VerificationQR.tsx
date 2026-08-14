import { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * Renders a scannable QR code for the given value (e.g. a verification URL).
 * The QR is generated client-side so it always matches the exact link shown.
 */
export function VerificationQR({ value, size = 120 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { width: size, margin: 1, errorCorrectionLevel: "H" })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        className="bg-white rounded-lg flex items-center justify-center text-xs text-slate-400"
        style={{ width: size, height: size }}
      >
        …
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="Verification QR code"
      width={size}
      height={size}
      className="rounded-lg bg-white border border-slate-200 p-1.5"
    />
  );
}
