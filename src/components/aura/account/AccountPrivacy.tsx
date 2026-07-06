"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2, AlertTriangle, Trash2, Shield, Check, FileJson } from "lucide-react";
import { AccountLayout } from "./AccountLayout";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "next/navigation";

export function AccountPrivacy() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clear);
  const router = useRouter();

  const [exportState, setExportState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [deleteState, setDeleteState] = useState<"idle" | "confirm" | "success" | "error">("idle");
  const [deleting, setDeleting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onExport = async () => {
    if (exportState === "loading") return;
    setExportState("loading");
    setError(null);

    try {
      const res = await fetch("/api/user/data/export");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to export data.");
        setExportState("error");
        return;
      }
      // Trigger browser download from the JSON blob.
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename =
        res.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ??
        `aura-living-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportState("success");
      setTimeout(() => setExportState("idle"), 5000);
    } catch {
      setError("Network error. Please try again.");
      setExportState("error");
    }
  };

  const onDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch("/api/user/data/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to delete account.");
        setDeleteState("error");
        setDeleting(false);
        return;
      }

      setDeleteState("success");
      clearAuth();
      setTimeout(() => router.push("/"), 2500);
    } catch {
      setError("Network error. Please try again.");
      setDeleteState("error");
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <AccountLayout>
      <div className="max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="t-overline c-gold-deep mb-3">Your privacy</p>
          <h1 className="font-display text-3xl md:text-4xl c-ink mb-3">
            Data &amp; privacy
          </h1>
          <p className="t-body c-ink-muted leading-relaxed mb-10">
            You have the right to access and control your personal data. Here
            you can download a complete copy of the data we hold about you, or
            permanently delete your account. These rights are part of our
            commitment to your privacy — see our{" "}
            <button
              onClick={() => router.push("/privacy")}
              className="c-gold-deep hover:underline"
            >
              Privacy Policy
            </button>{" "}
            for details.
          </p>

          {/* Export section */}
          <section className="bg-paper border border-hairline rounded-sm p-6 md:p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0">
                <Download size={20} strokeWidth={1.5} className="c-gold-deep" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="t-headline c-ink mb-2">Download your data</h2>
                <p className="t-body c-ink-muted leading-relaxed mb-5">
                  Get a JSON file containing your profile, addresses, orders,
                  reviews, wishlist, and notifications. The file is generated
                  on demand and downloaded directly to your device — we do not
                  email it or store a copy.
                </p>

                {exportState === "success" && (
                  <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-sm mb-4">
                    <Check size={16} strokeWidth={2} className="c-success flex-shrink-0" />
                    <p className="t-body-sm c-ink">
                      Your data export has been downloaded. Check your downloads
                      folder.
                    </p>
                  </div>
                )}

                <button
                  onClick={onExport}
                  disabled={exportState === "loading"}
                  className="inline-flex items-center gap-2 px-5 h-11 bg-ink c-paper t-label-caps hover:bg-gold-deep transition-colors disabled:opacity-60"
                >
                  {exportState === "loading" ? (
                    <>
                      <Loader2 size={14} strokeWidth={2} className="animate-spin" />
                      Preparing
                    </>
                  ) : (
                    <>
                      <FileJson size={14} strokeWidth={1.75} />
                      Download my data
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Delete section */}
          <section className="bg-paper border border-error/30 rounded-sm p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} strokeWidth={1.5} className="c-error" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="t-headline c-ink mb-2">Delete your account</h2>
                <p className="t-body c-ink-muted leading-relaxed mb-5">
                  Permanently delete your account and all associated personal
                  data — addresses, wishlist, reviews, notifications, and
                  preferences. Order records are anonymized and retained for 5
                  years as required by Pakistani tax law, but all identifying
                  information (name, address, phone, email) is wiped.
                </p>
                <p className="t-body-sm c-error font-medium mb-5">
                  This action cannot be undone.
                </p>

                {deleteState === "success" ? (
                  <div className="p-4 bg-success/10 border border-success/30 rounded-sm">
                    <p className="t-body-sm c-ink">
                      Your account has been deleted. Redirecting you home...
                    </p>
                  </div>
                ) : deleteState === "confirm" ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="confirmEmail" className="t-label-caps c-ink-faint block mb-2">
                        Type your email to confirm: <span className="c-ink">{user.email}</span>
                      </label>
                      <input
                        id="confirmEmail"
                        type="email"
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                        className="w-full bg-cream/50 border border-hairline-cream px-4 h-12 t-body c-ink outline-none focus:border-error transition-colors"
                        placeholder={user.email}
                      />
                    </div>
                    {error && <p className="t-body-sm c-error">{error}</p>}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={onDelete}
                        disabled={confirmEmail.toLowerCase() !== user.email.toLowerCase() || deleting}
                        className="inline-flex items-center gap-2 px-5 h-11 bg-error c-paper t-label-caps hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting ? (
                          <>
                            <Loader2 size={14} strokeWidth={2} className="animate-spin" />
                            Deleting
                          </>
                        ) : (
                          <>
                            <Trash2 size={14} strokeWidth={1.75} />
                            Permanently delete
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setDeleteState("idle");
                          setConfirmEmail("");
                          setError(null);
                        }}
                        className="px-5 h-11 border border-hairline c-ink t-label-caps hover:border-gold transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteState("confirm")}
                    className="inline-flex items-center gap-2 px-5 h-11 border border-error c-error t-label-caps hover:bg-error hover:c-paper transition-colors"
                  >
                    <Trash2 size={14} strokeWidth={1.75} />
                    Delete my account
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Privacy commitment footer */}
          <div className="mt-8 flex items-start gap-3 p-4 bg-cream/50 border border-hairline-cream rounded-sm">
            <Shield size={18} strokeWidth={1.5} className="c-gold-deep flex-shrink-0 mt-0.5" />
            <p className="t-caption c-ink-muted leading-relaxed">
              We never sell your personal information. All data is encrypted in
              transit (HTTPS) and passwords are hashed. For privacy enquiries,
              email privacy@auraliving.com — we respond within 30 days.
            </p>
          </div>
        </motion.div>
      </div>
    </AccountLayout>
  );
}
