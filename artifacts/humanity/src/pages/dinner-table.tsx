import { useState } from "react";
import { Link } from "wouter";
import { useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { Utensils, Globe2, Send, Loader2, LogIn, Check, MessageCircleHeart } from "lucide-react";
import {
  useGetCurrentDinner,
  useListDinnerQuestions,
  useSubmitDinnerAnswer,
  getGetCurrentDinnerQueryKey,
  getListDinnerQuestionsQueryKey,
} from "@workspace/api-client-react";
import type { DinnerAnswer } from "@workspace/api-client-react";

function AnswerCard({ answer }: { answer: DinnerAnswer }) {
  const { author } = answer;
  return (
    <div className="glass-panel rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href={`/profile/${author.userId}`}
          className="h-11 w-11 rounded-xl glass border border-[#FBBF24]/30 overflow-hidden flex items-center justify-center shrink-0"
        >
          {author.photoUrl ? (
            <img src={author.photoUrl} alt={author.displayName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-[#FBBF24]">
              {author.displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </Link>
        <div className="min-w-0">
          <Link href={`/profile/${author.userId}`} className="text-white font-medium hover:text-[#FBBF24] transition-colors">
            {author.displayName}
          </Link>
          <div className="flex items-center gap-2 text-sm text-white/60">
            {author.countryFlagUrl ? (
              <img src={author.countryFlagUrl} alt="" className="h-3.5 w-5 rounded-sm object-cover" />
            ) : (
              <Globe2 className="h-3.5 w-3.5 text-[#60A5FA]" />
            )}
            <span>{author.countryName ?? "Somewhere on Earth"}</span>
          </div>
        </div>
      </div>
      <p className="text-white/85 leading-relaxed whitespace-pre-wrap">{answer.answer}</p>
    </div>
  );
}

export default function DinnerTable() {
  const { isSignedIn } = useUser();
  const qc = useQueryClient();
  const [answer, setAnswer] = useState("");

  const { data, isLoading } = useGetCurrentDinner();
  const { data: history } = useListDinnerQuestions();
  const submit = useSubmitDinnerAnswer();

  const question = data?.question ?? null;
  const answers = data?.answers ?? [];
  const hasAnswered = data?.hasAnswered ?? false;

  const handleSubmit = async () => {
    if (!question || !answer.trim()) return;
    await submit.mutateAsync({ id: question.id, data: { answer: answer.trim() } });
    setAnswer("");
    await Promise.all([
      qc.invalidateQueries({ queryKey: getGetCurrentDinnerQueryKey() }),
      qc.invalidateQueries({ queryKey: getListDinnerQuestionsQueryKey() }),
    ]);
  };

  const pastQuestions = (history ?? []).filter((q) => question && q.id !== question.id);

  return (
    <div className="w-full">
      <section className="w-full relative flex flex-col items-center text-center px-4 pt-20 pb-14 md:pt-28 md:pb-16">
        <span className="inline-flex items-center gap-2 label-eyebrow text-[#FBBF24]/80 animate-fade-up">
          <Utensils className="h-3.5 w-3.5" />
          The World Dinner Table
        </span>
        {isLoading ? (
          <Loader2 className="h-8 w-8 text-[#60A5FA] animate-spin mt-10" />
        ) : question ? (
          <>
            {question.theme && (
              <p className="text-[#60A5FA] mt-4 font-medium tracking-wide animate-fade-up delay-100">
                This week · {question.theme}
              </p>
            )}
            <h1 className="text-3xl md:text-6xl font-serif text-white mt-3 max-w-4xl leading-tight animate-fade-up delay-100">
              {question.question}
            </h1>
            <p className="text-white/60 mt-6 max-w-2xl animate-fade-up delay-200">
              One question. Every nation. Pull up a chair and share your answer — then listen to voices
              from across the world.
            </p>
            <p className="text-sm text-white/40 mt-4 animate-fade-up delay-200">
              {data?.totalAnswers ?? 0} {data?.totalAnswers === 1 ? "voice" : "voices"} at the table
            </p>
          </>
        ) : (
          <h1 className="text-3xl md:text-5xl font-serif text-white mt-8">The table is being set</h1>
        )}
      </section>

      {question && (
        <section className="w-full px-4 sm:px-6 max-w-3xl mx-auto">
          {isSignedIn ? (
            hasAnswered ? (
              <div className="glass-panel rounded-2xl p-6 flex items-center gap-3 text-white/80">
                <span className="h-9 w-9 rounded-full bg-[#FBBF24] text-[#0F172A] flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4" />
                </span>
                You've shared your answer this week. Thank you for being part of the conversation.
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-6 space-y-4">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  maxLength={2000}
                  placeholder="Take your time. Speak honestly. There are no wrong answers here."
                  className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/30 border border-white/10 focus:border-[#60A5FA]/60 focus:outline-none min-h-[120px] resize-y"
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-white/40">{answer.length}/2000</span>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submit.isPending || !answer.trim()}
                    className="inline-flex min-h-11 items-center justify-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white rounded-full px-6 py-2.5 font-semibold hover:glow-blue transition-all disabled:opacity-50"
                  >
                    {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Share at the table
                  </button>
                </div>
                {submit.isError && (
                  <p className="text-sm text-red-400">Couldn't share your answer. Please try again.</p>
                )}
              </div>
            )
          ) : (
            <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <p className="text-white/80">Sign in to pull up a chair and share your answer.</p>
              <Link
                href="/sign-in"
                className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#FBBF24] text-[#0F172A] rounded-full px-6 py-2.5 font-semibold hover:glow-gold transition-all shrink-0"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            </div>
          )}
        </section>
      )}

      <section className="w-full px-4 sm:px-6 max-w-3xl mx-auto mt-14 space-y-6">
        <div className="flex items-center gap-3">
          <MessageCircleHeart className="h-5 w-5 text-[#FBBF24]" />
          <h2 className="text-2xl font-serif text-white">Voices at the table</h2>
        </div>
        {answers.length === 0 ? (
          <p className="text-white/50">Be the first to answer this week's question.</p>
        ) : (
          <div className="space-y-5">
            {answers.map((a) => (
              <AnswerCard key={a.id} answer={a} />
            ))}
          </div>
        )}
      </section>

      {pastQuestions.length > 0 && (
        <section className="w-full px-4 sm:px-6 max-w-3xl mx-auto mt-16 mb-8 space-y-6">
          <div className="accent-rule" />
          <h2 className="text-2xl font-serif text-white">Past questions</h2>
          <div className="space-y-3">
            {pastQuestions.map((q) => (
              <div key={q.id} className="glass rounded-2xl p-5 flex flex-col gap-4 border border-white/5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {q.theme && <p className="label-eyebrow text-[#60A5FA]/80 mb-1">{q.theme}</p>}
                  <p className="text-white/85">{q.question}</p>
                </div>
                <span className="text-sm text-white/40 shrink-0">
                  {q.answerCount} {q.answerCount === 1 ? "voice" : "voices"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
