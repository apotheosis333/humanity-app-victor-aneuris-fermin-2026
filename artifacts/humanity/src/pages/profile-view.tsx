import { Loader2 } from "lucide-react";
import { useGetProfile, getGetProfileQueryKey, ApiError } from "@workspace/api-client-react";
import { ProfileCard } from "@/components/profile-card";
import { ConnectButton } from "@/components/connect-button";

export default function ProfileView({ userId }: { userId: string }) {
  const { data: profile, isLoading, error } = useGetProfile(userId, {
    query: { retry: false, queryKey: getGetProfileQueryKey(userId) },
  });

  if (isLoading) {
    return (
      <section className="w-full max-w-3xl mx-auto px-6 py-24 flex justify-center">
        <Loader2 className="h-8 w-8 text-[#60A5FA] animate-spin" />
      </section>
    );
  }

  const notFound = error instanceof ApiError && error.status === 404;

  if (error && !notFound) {
    return (
      <section className="w-full max-w-3xl mx-auto px-6 py-24 text-center space-y-4">
        <h1 className="text-3xl font-serif text-white">Something went wrong</h1>
        <p className="text-white/70">We couldn't load this profile right now. Please try again.</p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="w-full max-w-3xl mx-auto px-6 py-24 text-center space-y-4">
        <h1 className="text-3xl font-serif text-white">Profile not found</h1>
        <p className="text-white/70">This explorer hasn't shared their story yet.</p>
      </section>
    );
  }

  return (
    <section className="w-full px-6 py-12 md:py-16">
      <ProfileCard profile={profile} action={<ConnectButton userId={userId} />} />
    </section>
  );
}
