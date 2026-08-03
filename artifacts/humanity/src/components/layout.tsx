import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Compass, Footprints, History, Heart, ArrowRightLeft, Utensils, LogIn, Radio, Users, Menu, User, MessageCircle, Newspaper } from "lucide-react";
import { UserButton, useUser } from "@clerk/react";
import { useTranslation } from "react-i18next";
import {
  useListConnectionRequests,
  getListConnectionRequestsQueryKey,
  useGetUnreadMessageCount,
  getGetUnreadMessageCountQueryKey,
} from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useHumanityScore } from "@/hooks/useHumanityScore";
import { Starfield } from "@/components/starfield";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import logoUrl from "@/assets/humanity-logo-128.png";

const NAV_LINKS = [
  { href: "/explore", label: "nav.explore", icon: Compass, match: (l: string) => l.startsWith("/explore") || l.startsWith("/country"), desktopOnly: true },
  { href: "/dinner-table", label: "nav.table", icon: Utensils, match: (l: string) => l.startsWith("/dinner-table"), desktopOnly: true },
  { href: "/live-map", label: "nav.liveMap", icon: Radio, match: (l: string) => l === "/live-map", desktopOnly: true },
  { href: "/walk", label: "nav.walk", icon: Footprints, match: (l: string) => l === "/walk", desktopOnly: true },
  { href: "/humanity-timeline", label: "nav.timeline", icon: History, match: (l: string) => l === "/humanity-timeline", desktopOnly: true },
  { href: "/world-news", label: "nav.news", icon: Newspaper, match: (l: string) => l.startsWith("/world-news"), desktopOnly: true },
  { href: "/compare", label: "nav.compare", icon: ArrowRightLeft, match: (l: string) => l === "/compare", desktopOnly: true },
  { href: "/connections", label: "nav.connections", icon: Users, match: (l: string) => l.startsWith("/connections"), desktopOnly: true },
  { href: "/messages", label: "nav.messages", icon: MessageCircle, match: (l: string) => l.startsWith("/messages"), desktopOnly: true },
];

function useIncomingRequests() {
  const { isSignedIn } = useUser();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data } = useListConnectionRequests({
    query: {
      enabled: !!isSignedIn,
      queryKey: getListConnectionRequestsQueryKey(),
      refetchInterval: 30000,
    },
  });
  const count = data?.incoming.length ?? 0;
  const prev = useRef<number | null>(null);

  useEffect(() => {
    if (prev.current !== null && count > prev.current) {
      toast({ title: t("nav.newRequest") });
    }
    prev.current = count;
  }, [count, t, toast]);

  return count;
}

function useUnreadMessages() {
  const { isSignedIn } = useUser();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data } = useGetUnreadMessageCount({
    query: {
      enabled: !!isSignedIn,
      queryKey: getGetUnreadMessageCountQueryKey(),
      refetchInterval: 30000,
    },
  });
  const count = data?.count ?? 0;
  const prev = useRef<number | null>(null);

  useEffect(() => {
    if (prev.current !== null && count > prev.current) {
      toast({ title: t("nav.newMessage") });
    }
    prev.current = count;
  }, [count, t, toast]);

  return count;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { scorePercent, hasPledged } = useHumanityScore();
  const [menuOpen, setMenuOpen] = useState(false);
  const incomingCount = useIncomingRequests();
  const unreadMessages = useUnreadMessages();
  const { isSignedIn } = useUser();

  const badgeFor = (href: string) =>
    href === "/connections" ? incomingCount : href === "/messages" ? unreadMessages : 0;

  return (
    <div className="relative min-h-[100dvh] flex flex-col font-sans text-foreground">
      <Starfield />

      <header className="sticky top-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
        <div className="container mx-auto glass-strong rounded-2xl glow-blue/40 shadow-xl">
          <div className="px-4 md:px-6 h-[64px] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden border border-[#2563EB]/40 glow-blue transition-transform duration-500 group-hover:scale-105">
                <img src={logoUrl} alt="huMANity logo" className="h-full w-full object-cover" />
              </span>
              <span className="font-sans text-xl font-bold tracking-tight text-white">
                Hu<span className="text-[#FBBF24] text-glow-gold">MAN</span>ity
              </span>
            </Link>

            <nav className="flex items-center gap-1 md:gap-2">
              {NAV_LINKS.map((link) => {
                const active = link.match(location);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-label={t(link.label)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative text-sm font-medium transition-all duration-300 flex items-center gap-2 px-3 py-2 rounded-lg",
                      link.desktopOnly && "hidden md:flex",
                      active
                        ? "text-[#FBBF24] bg-white/5"
                        : "text-white/70 hover:text-white hover:bg-white/5",
                    )}
                  >
                    <span className="relative">
                      <link.icon className="h-4 w-4" />
                      {badgeFor(link.href) > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#FBBF24] text-[#0F172A] text-[10px] font-bold flex items-center justify-center leading-none">
                          {badgeFor(link.href) > 9 ? "9+" : badgeFor(link.href)}
                        </span>
                      )}
                    </span>
                    <span className="hidden sm:inline">{t(link.label)}</span>
                    {active && (
                      <span className="absolute -bottom-px left-3 right-3 h-px bg-gradient-to-r from-transparent via-[#FBBF24] to-transparent" />
                    )}
                  </Link>
                );
              })}

              <Link
                href="/pledge"
                aria-label={t("nav.pledge")}
                className={cn(
                  "ml-1 md:ml-2 text-sm font-semibold transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-full",
                  location === "/pledge"
                    ? "bg-[#FBBF24] text-[#0F172A] glow-gold"
                    : "bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white hover:glow-blue",
                )}
              >
                <Heart className={cn("h-4 w-4", hasPledged && "fill-current")} />
                <span className="hidden sm:inline">{t("nav.pledge")}</span>
              </Link>

              <div className="ml-1 md:ml-3 h-10 w-10 rounded-full glass border border-[#FBBF24]/40 flex items-center justify-center relative group cursor-help">
                <span className="text-[10px] font-bold text-[#FBBF24]">{scorePercent}%</span>
                <div className="absolute top-full mt-2 right-0 glass-strong text-white p-3 rounded-xl text-xs w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-[60]">
                  <p className="font-bold text-[#FBBF24] mb-1">{t("score.title")}</p>
                  <p className="text-white/80">{t("score.body", { percent: scorePercent })}</p>
                </div>
              </div>

              <LanguageSwitcher />

              <AuthControl />

              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label={t("nav.menu")}
                    className="relative ml-1 md:hidden h-10 w-10 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Menu className="h-5 w-5" />
                    {incomingCount + unreadMessages > 0 && (
                      <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#FBBF24] text-[#0F172A] text-[10px] font-bold flex items-center justify-center leading-none">
                        {incomingCount + unreadMessages > 9 ? "9+" : incomingCount + unreadMessages}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="glass-strong border-l border-white/10 text-white w-[78%] max-w-sm"
                >
                  <SheetHeader>
                    <SheetTitle className="text-white font-sans">
                      Hu<span className="text-[#FBBF24]">MAN</span>ity
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 flex flex-col gap-1">
                    {NAV_LINKS.map((link) => {
                      const active = link.match(location);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMenuOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors",
                            active
                              ? "text-[#FBBF24] bg-white/5"
                              : "text-white/80 hover:text-white hover:bg-white/5",
                          )}
                        >
                          <link.icon className="h-5 w-5 shrink-0" />
                          <span className="flex-1">{t(link.label)}</span>
                          {badgeFor(link.href) > 0 && (
                            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#FBBF24] text-[#0F172A] text-xs font-bold flex items-center justify-center leading-none">
                              {badgeFor(link.href) > 9 ? "9+" : badgeFor(link.href)}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                    {isSignedIn && (
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        aria-current={location.startsWith("/profile") ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors",
                          location.startsWith("/profile")
                            ? "text-[#FBBF24] bg-white/5"
                            : "text-white/80 hover:text-white hover:bg-white/5",
                        )}
                      >
                        <User className="h-5 w-5 shrink-0" />
                        <span className="flex-1">{t("nav.profile")}</span>
                      </Link>
                    )}
                    <Link
                      href="/pledge"
                      onClick={() => setMenuOpen(false)}
                      aria-current={location === "/pledge" ? "page" : undefined}
                      className={cn(
                        "mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-full text-base font-semibold transition-all",
                        location === "/pledge"
                          ? "bg-[#FBBF24] text-[#0F172A] glow-gold"
                          : "bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white",
                      )}
                    >
                      <Heart className={cn("h-5 w-5", hasPledged && "fill-current")} />
                      {t("nav.pledge")}
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative flex-1 flex flex-col">{children}</main>

      <footer className="relative mt-auto px-3 pb-3 md:px-6 md:pb-6">
        <div className="container mx-auto glass-strong rounded-2xl">
          <div className="px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-white/70">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden border border-[#2563EB]/40">
                  <img src={logoUrl} alt="huMANity logo" className="h-full w-full object-cover" />
                </span>
                <span className="font-sans text-lg font-bold tracking-tight text-white">
                  Hu<span className="text-[#FBBF24]">MAN</span>ity
                </span>
              </div>
              <p className="max-w-xs leading-relaxed">
                {t("footer.tagline")}
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="label-eyebrow text-[#FBBF24]/80">{t("footer.navigation")}</h4>
              <div className="flex flex-col gap-2">
                <Link href="/" className="hover:text-[#FBBF24] transition-colors inline-block w-fit">{t("nav.home")}</Link>
                <Link href="/explore" className="hover:text-[#FBBF24] transition-colors inline-block w-fit">{t("nav.explore")}</Link>
                <Link href="/live-map" className="hover:text-[#FBBF24] transition-colors inline-block w-fit">{t("liveMap.title")}</Link>
                <Link href="/walk" className="hover:text-[#FBBF24] transition-colors inline-block w-fit">{t("nav.walk")}</Link>
                <Link href="/humanity-timeline" className="hover:text-[#FBBF24] transition-colors inline-block w-fit">{t("nav.timeline")}</Link>
                <Link href="/compare" className="hover:text-[#FBBF24] transition-colors inline-block w-fit">{t("nav.compare")}</Link>
                <Link href="/connections" className="hover:text-[#FBBF24] transition-colors inline-block w-fit">{t("nav.connections")}</Link>
                <Link href="/pledge" className="hover:text-[#FBBF24] transition-colors inline-block w-fit font-semibold">{t("nav.pledge")}</Link>
              </div>
            </div>
            <div className="space-y-4 md:text-right flex flex-col md:items-end">
              <h4 className="label-eyebrow text-[#FBBF24]/80">{t("footer.legal")}</h4>
              <div className="flex flex-col gap-2 md:items-end">
                <Link href="/privacy" className="hover:text-[#FBBF24] transition-colors inline-block w-fit">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-[#FBBF24] transition-colors inline-block w-fit">Terms of Service</Link>
                <Link href="/support" className="hover:text-[#FBBF24] transition-colors inline-block w-fit">Support</Link>
                <Link href="/data-deletion" className="hover:text-[#FBBF24] transition-colors inline-block w-fit">Data Deletion</Link>
                <Link href="/child-safety" className="hover:text-[#FBBF24] transition-colors inline-block w-fit">Child Safety</Link>
              </div>
              <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
              <p>{t("footer.builtFor")}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AuthControl() {
  const { isSignedIn, isLoaded } = useUser();
  const [location] = useLocation();
  const { t } = useTranslation();

  if (!isLoaded) {
    return (
      <Link
        href="/sign-in"
        aria-label={t("nav.signIn")}
        className="ml-1 md:ml-2 text-sm font-semibold transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-white/80 hover:text-white hover:bg-white/5"
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">{t("nav.signIn")}</span>
      </Link>
    );
  }

  if (isSignedIn) {
    return (
      <div className="ml-1 md:ml-2 flex items-center gap-1">
        <Link
          href="/profile"
          aria-label={t("nav.profile")}
          aria-current={location.startsWith("/profile") ? "page" : undefined}
          className={cn(
            "text-sm font-medium transition-all duration-300 hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg",
            location.startsWith("/profile")
              ? "text-[#FBBF24] bg-white/5"
              : "text-white/70 hover:text-white hover:bg-white/5",
          )}
        >
          <span>{t("nav.profile")}</span>
        </Link>
        <UserButton
          appearance={{ elements: { avatarBox: "h-9 w-9" } }}
          userProfileProps={{ appearance: { baseTheme: undefined } }}
        />
      </div>
    );
  }

  return (
    <Link
      href="/sign-in"
      aria-label={t("nav.signIn")}
      className="ml-1 md:ml-2 text-sm font-semibold transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-white/80 hover:text-white hover:bg-white/5"
    >
      <LogIn className="h-4 w-4" />
      <span className="hidden sm:inline">{t("nav.signIn")}</span>
    </Link>
  );
}
