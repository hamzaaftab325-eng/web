"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Users, ShieldCheck, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface Customer {
  id: string; email: string; firstName: string; lastName: string;
  phone: string | null; role: string; isActive: boolean;
  createdAt: string; orderCount: number;
}

export default function AdminCustomers() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "admin" | "customer" | "inactive">("all");

  useEffect(() => {
    // Bug #17 fix: pass search to API (was fetching 200 and filtering client-side)
    const params = new URLSearchParams({ limit: "500" });
    if (search.trim()) params.set("search", search.trim());
    fetch(`/api/admin/customers?${params}`)
      .then((r) => (r.ok ? r.json() : { customers: [] }))
      .then((data) => setCustomers(data.customers ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  const filtered = customers.filter((c) => {
    const matchesSearch = !search ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.firstName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "admin" && c.role === "admin") ||
      (filter === "customer" && c.role === "customer" && c.isActive) ||
      (filter === "inactive" && !c.isActive);
    return matchesSearch && matchesFilter;
  });

  const filters = [
    { key: "all" as const, label: "All", count: customers.length },
    { key: "admin" as const, label: "Admins", count: customers.filter((c) => c.role === "admin").length },
    { key: "customer" as const, label: "Customers", count: customers.filter((c) => c.role === "customer" && c.isActive).length },
    { key: "inactive" as const, label: "Inactive", count: customers.filter((c) => !c.isActive).length },
  ];

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "customer" : "admin";
    if (!confirm(`Change this user's role to ${newRole}?`)) return;
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setCustomers(customers.map((c) => (c.id === id ? { ...c, role: newRole } : c)));
      }
    } catch { /* ignore */ }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    const action = currentActive ? "Deactivate" : "Activate";
    if (!confirm(`${action} this account?`)) return;
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setCustomers(customers.map((c) => (c.id === id ? { ...c, isActive: !currentActive } : c)));
      }
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />Accounts
          </p>
          <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Customers</TextBlurReveal>
          <p className="t-body c-ink-muted max-w-lg">View customer accounts, manage admin roles, and deactivate problematic users.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 c-ink-faint pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-gradient-to-r from-cream to-cream-deep rounded-full border border-hairline-cream">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-4 py-2 t-body-sm rounded-full transition-all duration-300 flex items-center gap-2",
                filter === f.key
                  ? "bg-gradient-to-r from-gold-pale to-cream c-gold-deep font-semibold shadow-gold-glow border border-gold/20"
                  : "c-ink-faint hover:c-ink hover:bg-cream/50"
              )}
            >
              {f.label}
              <span className={cn("t-caption t-num px-1.5 py-0.5 rounded-full", filter === f.key ? "bg-gold c-paper" : "bg-cream-deep")}>{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <Users size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
          <p className="t-headline-sm c-ink mb-2">{customers.length === 0 ? "No customers yet" : "No matches found"}</p>
          <p className="t-body c-ink-muted">When customers sign up, they&apos;ll appear here.</p>
        </div>
      ) : (
        <RevealOnScroll stagger={0.04} className="space-y-3">
          {filtered.map((customer) => (
            <motion.div
              key={customer.id}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              onClick={() => router.push(`/admin/customers/${customer.id}`)}
              className="group bg-gradient-card-warm border border-hairline-cream rounded-sm p-5 hover:shadow-card-hover hover:border-gold/30 transition-all cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-ink to-ink/80 flex items-center justify-center flex-shrink-0 ring-1 ring-hairline-gold">
                  <span className="t-label-caps c-paper">
                    {(customer.firstName?.[0] ?? "?")}{(customer.lastName?.[0] ?? "")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <p className="t-body c-ink font-medium">{customer.firstName} {customer.lastName}</p>
                    {customer.role === "admin" && (
                      <span className="inline-flex items-center gap-1 chip bg-gold-pale c-gold-deep t-label-caps">
                        <ShieldCheck size={10} /> Admin
                      </span>
                    )}
                    {!customer.isActive && (
                      <span className="chip bg-error/10 c-error t-label-caps">Inactive</span>
                    )}
                  </div>
                  <p className="t-caption c-ink-faint truncate flex items-center gap-1">
                    <Mail size={11} /> {customer.email}
                    {customer.phone && <span> · {customer.phone}</span>}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="t-body c-ink t-num font-medium">{customer.orderCount}</p>
                  <p className="t-caption c-ink-faint">orders</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="t-caption c-ink-faint">{customer.createdAt}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleRole(customer.id, customer.role)}
                    className={cn(
                      "px-3 py-2 t-label-caps rounded-sm transition-all",
                      customer.role === "admin"
                        ? "bg-error/10 c-error hover:bg-error hover:c-paper"
                        : "bg-cream-deep c-ink-muted hover:bg-gold-pale hover:c-gold-deep"
                    )}
                  >
                    {customer.role === "admin" ? "Demote" : "Promote"}
                  </button>
                  <button
                    onClick={() => toggleActive(customer.id, customer.isActive)}
                    className={cn(
                      "px-3 py-2 t-label-caps rounded-sm transition-all",
                      customer.isActive
                        ? "bg-cream-deep c-ink-muted hover:bg-error/10 hover:c-error"
                        : "bg-success/10 c-success hover:bg-success hover:c-paper"
                    )}
                  >
                    {customer.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </RevealOnScroll>
      )}
    </div>
  );
}
