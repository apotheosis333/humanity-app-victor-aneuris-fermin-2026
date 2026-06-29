import { Component, type ErrorInfo, type ReactNode, useEffect, useRef } from "react";
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk } from "@clerk/react";
import { dark } from "@clerk/themes";
import { Capacitor } from "@capacitor/core";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Explore from "@/pages/explore";
import CountryDetail from "@/pages/country/detail";
import CountryTimeline from "@/pages/country/timeline";
import CountryCulture from "@/pages/country/culture";
import CountryStories from "@/pages/country/stories";
import Walk from "@/pages/walk";
import HumanityTimeline from "@/pages/humanity-timeline";
import WorldNews from "@/pages/world-news";
import LiveMap from "@/pages/live-map";
import Pledge from "@/pages/pledge";
import Compare from "@/pages/compare";
import DinnerTable from "@/pages/dinner-table";
import MyProfile from "@/pages/profile";
import ProfileEdit from "@/pages/profile-edit";
import ProfileView from "@/pages/profile-view";
import Connections from "@/pages/connections";
import Messages from "@/pages/messages";
import { LegalPage } from "@/pages/legal";
import { Layout } from "@/components/layout";
import { configureApiAuthTokenGetter } from "@/lib/api-config";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();

const isNativeMobile = Capacitor.isNativePlatform();
const clerkProxyUrl = isNativeMobile
  ? undefined
  : import.meta.env.VITE_CLERK_PROXY_URL?.trim() || undefined;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: dark,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: "bottom" as const,
  },
  variables: {
    colorPrimary: "#2563EB",
    colorForeground: "#F1F5F9",
    colorMutedForeground: "#94A3B8",
    colorDanger: "#EF4444",
    colorBackground: "#0F172A",
    colorInput: "#1E293B",
    colorInputForeground: "#F1F5F9",
    colorNeutral: "#334155",
    fontFamily: "'Space Grotesk', sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox:
      "bg-[#0F172A]/95 border border-white/10 rounded-2xl w-[440px] max-w-full overflow-hidden shadow-2xl backdrop-blur-xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white text-2xl font-bold",
    headerSubtitle: "text-white/60",
    socialButtonsBlockButtonText: "text-white",
    formFieldLabel: "text-white/80",
    footerActionLink: "text-[#FBBF24] hover:text-[#FBBF24]/80",
    footerActionText: "text-white/60",
    dividerText: "text-white/50",
    identityPreviewEditButton: "text-[#FBBF24]",
    formFieldSuccessText: "text-emerald-400",
    alertText: "text-white",
    logoBox: "justify-center",
    logoImage: "h-9 w-auto",
    socialButtonsBlockButton: "border-white/15 hover:bg-white/5 text-white",
    formButtonPrimary:
      "bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] hover:opacity-90 text-white",
    formFieldInput: "bg-[#1E293B] border-white/10 text-white",
    dividerLine: "bg-white/10",
  },
};

const queryClient = new QueryClient();

function AppSetupFallback() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#020617] px-4 py-10 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
        <img src={`${basePath}/logo.svg`} alt="HuMANity" className="mb-6 h-10 w-auto" />
        <h1 className="text-2xl font-bold">HuMANity needs mobile app configuration</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          This build is missing a client-safe Clerk publishable key. Add
          {" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-amber-200">
            VITE_CLERK_PUBLISHABLE_KEY
          </code>
          {" "}
          in a local ignored environment file before running the Android smoke test.
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Real keys and backend URLs must stay out of source control.
        </p>
        <nav className="mt-6 flex flex-wrap gap-3 text-sm">
          <a className="text-amber-300 underline-offset-4 hover:underline" href={`${basePath}/privacy`}>
            Privacy
          </a>
          <a className="text-amber-300 underline-offset-4 hover:underline" href={`${basePath}/terms`}>
            Terms
          </a>
          <a className="text-amber-300 underline-offset-4 hover:underline" href={`${basePath}/support`}>
            Support
          </a>
        </nav>
      </section>
    </main>
  );
}

function PublicConfigRoutes() {
  return (
    <Switch>
      <Route path="/privacy">{() => <LegalPage kind="privacy" />}</Route>
      <Route path="/terms">{() => <LegalPage kind="terms" />}</Route>
      <Route path="/support">{() => <LegalPage kind="support" />}</Route>
      <Route component={AppSetupFallback} />
    </Switch>
  );
}

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("HuMANity app render error", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="flex min-h-[100dvh] items-center justify-center bg-[#020617] px-4 py-10 text-white">
          <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
            <img src={`${basePath}/logo.svg`} alt="HuMANity" className="mb-6 h-10 w-auto" />
            <h1 className="text-2xl font-bold">HuMANity could not finish loading</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              A startup error occurred. Check the Android WebView console or browser console for details.
            </p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#020617] px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#020617] px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ApiAuthTokenBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    configureApiAuthTokenGetter(() => getToken());
    return () => configureApiAuthTokenGetter(null);
  }, [getToken]);

  return null;
}

function AppRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/explore" component={Explore} />
        <Route path="/country/:code" component={CountryDetail} />
        <Route path="/country/:code/timeline">{(params) => <CountryTimeline code={params.code} />}</Route>
        <Route path="/country/:code/culture">{(params) => <CountryCulture code={params.code} />}</Route>
        <Route path="/country/:code/stories">{(params) => <CountryStories code={params.code} />}</Route>
        <Route path="/walk" component={Walk} />
        <Route path="/humanity-timeline" component={HumanityTimeline} />
        <Route path="/world-news" component={WorldNews} />
        <Route path="/live-map" component={LiveMap} />
        <Route path="/pledge" component={Pledge} />
        <Route path="/compare" component={Compare} />
        <Route path="/dinner-table" component={DinnerTable} />
        <Route path="/connections" component={Connections} />
        <Route path="/messages">{() => <Messages />}</Route>
        <Route path="/messages/:userId">{(params) => <Messages userId={params.userId} />}</Route>
        <Route path="/profile" component={MyProfile} />
        <Route path="/profile/edit" component={ProfileEdit} />
        <Route path="/profile/:userId">{(params) => <ProfileView userId={params.userId} />}</Route>
        <Route path="/privacy">{() => <LegalPage kind="privacy" />}</Route>
        <Route path="/terms">{() => <LegalPage kind="terms" />}</Route>
        <Route path="/support">{() => <LegalPage kind="support" />}</Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ApiAuthTokenBridge />
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route>
              <AppRoutes />
            </Route>
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  if (!clerkPubKey) {
    return (
      <WouterRouter base={basePath}>
        <PublicConfigRoutes />
      </WouterRouter>
    );
  }

  return (
    <AppErrorBoundary>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
    </AppErrorBoundary>
  );
}

export default App;
