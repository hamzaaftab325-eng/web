"use client";

import Link from "next/link";
import { FileText, Image, HelpCircle, Users, BookOpen } from "lucide-react";

const contentSections = [
  { label: "Hero Slides", href: "#", icon: Image, description: "Manage home page slider" },
  { label: "FAQ Items", href: "#", icon: HelpCircle, description: "Manage frequently asked questions" },
  { label: "Testimonials", href: "#", icon: Users, description: "Manage customer testimonials" },
  { label: "Journal Articles", href: "#", icon: BookOpen, description: "Manage blog posts" },
  { label: "Artisan Profiles", href: "#", icon: Users, description: "Manage workshop profiles" },
  { label: "Care Guides", href: "#", icon: FileText, description: "Manage material care guides" },
];

export default function AdminContent() {
  return (
    <div className="p-8">
      <h1 className="t-display-md c-ink mb-8">Content Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.label} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 hover:border-hairline-gold transition-colors cursor-pointer">
              <Icon size={24} className="c-gold-deep mb-4" />
              <h3 className="t-headline-sm c-ink mb-2">{section.label}</h3>
              <p className="t-body-sm c-ink-muted">{section.description}</p>
            </div>
          );
        })}
      </div>
      <p className="t-body c-ink-faint mt-8">Full content editors coming in B10. For now, manage content directly in Supabase dashboard.</p>
    </div>
  );
}
