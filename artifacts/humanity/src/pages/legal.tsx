import { Link } from "wouter";

const pageCopy = {
  privacy: {
    title: "Privacy Policy",
    eyebrow: "Launch-prep draft for founder/legal review",
    body: [
      "HuMANity helps people discover humanity beyond stereotypes through profiles, culture exploration, respectful connection, and global understanding. This draft explains the app's current privacy posture and must be reviewed by the owner and legal counsel before public launch.",
      "When you sign in, HuMANity uses Clerk for authentication. Clerk may process account identifiers such as your sign-in identity, session state, and related security data. HuMANity stores app profile data you choose to provide, such as display name, username, country, bio, cultural background, languages, interests, profile photo, pledge state, and related profile settings.",
      "The app may store user-generated and social data, including connection requests, accepted connections, messages between connected users, reports, blocks, account deletion requests, uploaded profile photos, and other content you submit inside HuMANity.",
      "HuMANity uses service providers to operate the app, including Railway for backend hosting, PostgreSQL for app data, Cloudflare R2 or S3-compatible storage for uploads, and Clerk for authentication. These providers process data only as needed to run, secure, and support the service.",
      "HuMANity may receive technical information such as device/browser details, network requests, server logs, and error information from the app, backend, hosting provider, or authentication/storage providers. This information is used to keep the service working, troubleshoot issues, and protect users.",
      "You can request deletion of your HuMANity account and app data from the Profile edit screen or through Support. Deletion is currently a manual-review process that may include removing or anonymizing app-owned data and coordinating Clerk identity deletion. See Data Deletion for current instructions.",
      "This page is not final legal advice. Before launch, confirm the exact data collected, retention periods, support contact, subprocessors, international transfer language, and deletion workflow.",
    ],
    links: [{ href: "/data-deletion", label: "Data deletion instructions" }],
  },
  terms: {
    title: "Terms of Service",
    eyebrow: "Launch-prep draft for founder/legal review",
    body: [
      "These draft terms describe expected behavior in HuMANity and must be reviewed by the owner and legal counsel before public launch.",
      "Use HuMANity with respect. Do not harass, threaten, abuse, impersonate others, spam, exploit, or post hateful, violent, sexual, illegal, misleading, or otherwise harmful content. Do not use the app to target people based on protected characteristics or to promote stereotypes or dehumanization.",
      "You are responsible for the profile information, messages, uploads, reports, and other content you submit. Only upload or share content you have the right to use. Do not post private information about other people without permission.",
      "HuMANity may review reports, remove content, limit features, suspend accounts, or take other moderation action when needed to protect users, comply with law, or preserve the purpose of the community. Reporting and blocking tools are provided so users can help maintain a safer environment.",
      "The HuMANity name, brand, design, and app experience belong to HuMANity or its owner. You keep ownership of content you create, but you grant HuMANity the permissions needed to display and operate that content inside the service.",
      "HuMANity is provided for connection, learning, and cultural understanding. The service may change, pause, or stop, and some features may be experimental. Final terms should include complete disclaimers, limitation-of-liability language, governing law, and dispute/contact terms after legal review.",
    ],
  },
  support: {
    title: "Support",
    eyebrow: "Help, safety, and account requests",
    body: [
      "Use this page for help with account access, profile issues, uploads, reporting, blocking, safety concerns, moderation questions, privacy requests, and account deletion requests.",
      "For support, contact jawsofthetrap@gmail.com. Do not send passwords, private keys, payment details, or other sensitive credentials in support requests.",
      "For urgent safety or abuse concerns inside the app, use the Report and Block controls on the relevant profile when available. For account or data deletion, see the Data Deletion instructions.",
    ],
    links: [{ href: "/data-deletion", label: "Account and data deletion" }],
  },
  dataDeletion: {
    title: "Data Deletion",
    eyebrow: "Account and data deletion instructions",
    body: [
      "HuMANity currently supports account deletion through a request-only, manual-review process. This page is a launch-prep draft and must be reviewed before public launch.",
      "To request deletion in the app, sign in, open Profile, choose Edit profile, and use the account deletion request section. The backend records a pending deletion request for review. Do not use this flow unless you want the HuMANity team to review your deletion request.",
      "A deletion request may cover your HuMANity profile, profile photo references, account registry record, connections, messages, reports, blocks, account deletion request records, and other app-owned data associated with your account. Some data may need to be retained or anonymized when required for safety, fraud prevention, legal compliance, or moderation records.",
      "Clerk manages authentication identity for HuMANity. Completing a full deletion may require manual coordination to delete or deactivate the related Clerk identity in addition to app-owned data.",
      "If you cannot access your account, use the Support page or contact jawsofthetrap@gmail.com.",
      "HuMANity does not currently promise instant or automated deletion. The current deletion target is within 30 days after a verified deletion request, unless legal or security retention is required. Final retention and anonymization rules still need owner/legal confirmation before launch.",
    ],
    links: [{ href: "/support", label: "Contact support" }],
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
        <div className="flex flex-wrap gap-4">
          {("links" in copy ? copy.links : [{ href: "/support", label: "Contact support" }]).map((link) => (
            <Link key={link.href} href={link.href} className="inline-flex text-[#FBBF24] hover:text-[#FBBF24]/80 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
