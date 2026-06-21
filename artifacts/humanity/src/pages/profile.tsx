import { Link } from "wouter";
import { useUser } from "@clerk/react";
import { Loader2, UserPlus, LogIn } from "lucide-react";
import { useGetMyProfile, getGetMyProfileQueryKey, ApiError } from "@workspace/api-client-react";
import { ProfileCard } from "@/components/profile-card";

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full max-w-3xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-6">
      {children}
    </section>
  );
}

export default function MyProfile() {
  const { isSignedIn, isLoaded } = useUser();
  const { data: profile, isLoading, error } = useGetMyProfile({
    query: { enabled: isLoaded && isSignedIn === true, retry: false, queryKey: getGetMyProfileQueryKey() },
  });

  if (!isLoaded || (isSignedIn && isLoading)) {
    return (
      <Centered>
        <Loader2 className="h-8 w-8 text-[#60A5FA] animate-spin" />
      </Centered>
    );
  }

  if (!isSignedIn) {
    return (
      <Centered>
        <h1 className="text-3xl md:text-4xl font-serif text-white">Your story belongs here</h1>
        <p className="text-white/70 max-w-md">
          Sign in to create your profile and join people from every nation on Earth.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white rounded-full px-6 py-3 font-semibold hover:glow-blue transition-all"
        >
          <LogIn className="h-4 w-4" />
          Sign in
        </Link>
      </Centered>
    );
  }

  const notFound = !!error && error instanceof ApiError && error.status === 404;

  if (error && !notFound) {
    return (
      <Centered>
        <h1 className="text-3xl md:text-4xl font-serif text-white">Something went wrong</h1>
        <p className="text-white/70 max-w-md">
          We couldn't load your profile right now. Please try again in a moment.
        </p>
      </Centered>
    );
  }

  if (notFound || !profile) {
    return (
      <Centered>
        <h1 className="text-3xl md:text-4xl font-serif text-white">Welcome to huMANity</h1>
        <p className="text-white/70 max-w-md">
          Let's build your profile so the world can meet you. Share where you're from, the
          languages you speak, and what makes your corner of the world unique.
        </p>
        <Link
          href="/profile/edit"
          className="inline-flex items-center gap-2 bg-[#FBBF24] text-[#0F172A] rounded-full px-6 py-3 font-semibold hover:glow-gold transition-all"
        >
          <UserPlus className="h-4 w-4" />
          Create your profile
        </Link>
      </Centered>
    );
  }

  return (
    <section className="w-full px-6 py-12 md:py-16">
      <ProfileCard profile={profile} isOwn />
    </section>
  );
}
