import { useEffect, useRef } from "react";
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { dark } from "@clerk/themes";
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
import { Layout } from "@/components/layout";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
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
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
