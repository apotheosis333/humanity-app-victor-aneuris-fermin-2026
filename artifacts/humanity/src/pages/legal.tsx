import { Link } from "wouter";

const pageCopy = {
  privacy: {
    title: "Privacy Policy",
    eyebrow: "Draft for founder/legal review",
    body: [
      "This draft page is a placeholder for HuMANity's privacy policy and must be reviewed before public launch.",
      "The final policy should explain what account, profile, message, report, block, upload, analytics, and support data is collected; why it is used; how long it is retained; and how people can request deletion.",
      "Do not treat this placeholder as legal advice or a final privacy policy.",
    ],
  },
  terms: {
    title: "Terms of Service",
    eyebrow: "Draft for founder/legal review",
    body: [
      "This draft page is a placeholder for HuMANity's terms of service and must be reviewed before public launch.",
      "The final terms should cover respectful participation, prohibited content, reporting and moderation, account suspension, intellectual property, user-generated content, and dispute/contact processes.",
      "Do not treat this placeholder as legal advice or final terms.",
    ],
  },
  support: {
    title: "Support",
    eyebrow: "Contact placeholder",
    body: [
      "For launch preparation, this page reserves a visible support/contact location for app-store review.",
      "Before submission, replace this placeholder with the founder-approved support email or support form URL.",
      "People should be able to request help with account access, safety, reporting, blocking, moderation decisions, and account deletion.",
    ],
  },
};

export function LegalPage({ kind }: { kind: keyof typeof pageCopy }) {
  const copy = pageCopy[kind];
  return (
    <section className="w-full max-w-3xl mx-auto px-6 py-16 md:py-24">
      <div className="glass-panel rounded-3xl p-8 md:p-10 space-y-6">
        <div>
          <span className="label-eyebrow text-[#FBBF24]/80">{copy.eyebrow}</span>
          <h1 className="text-3xl md:text-5xl font-serif text-white mt-3">{copy.title}</h1>
        </div>
        <div className="space-y-4 text-white/70 leading-relaxed">
          {copy.body.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
        <Link href="/support" className="inline-flex text-[#FBBF24] hover:text-[#FBBF24]/80 transition-colors">
          Contact support
        </Link>
      </div>
    </section>
  );
}
