"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CircleHelp, LockKeyhole, LogOut, Plus, Save, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import ExpandableText from "@/components/ExpandableText";
import TextStats from "@/components/TextStats";

const PAGE_SIZE = 8;
const PIN_USERS = {
  "3773": "Efsa",
  "1453": "Enes"
};

const USERS = ["Enes", "Efsa"];

function getUserClasses(user) {
  if (user === "Efsa") {
    return {
      badge: "border-[#ff8aaa]/35 bg-[#ff8aaa]/12 text-[#ffb3c7]",
      panel: "border-[#ff8aaa]/24 bg-[#ff8aaa]/[0.055]"
    };
  }

  return {
    badge: "border-white/10 bg-black/60 text-gray-100",
    panel: "border-white/10 bg-black/25"
  };
}

function mergeUniqueItems(current, nextItems) {
  const existingIds = new Set(current.map((item) => item.id));
  return [...current, ...nextItems.filter((item) => !existingIds.has(item.id))];
}

export default function QuestionsPage() {
  const [pin, setPin] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [message, setMessage] = useState("");
  const sentinelRef = useRef(null);
  const pageRef = useRef(0);
  const loadingRef = useRef(false);

  const answersByQuestion = useMemo(() => {
    const map = new Map();
    answers.forEach((answer) => {
      if (!map.has(answer.question_id)) map.set(answer.question_id, {});
      map.get(answer.question_id)[answer.author] = answer;
    });
    return map;
  }, [answers]);

  const unlocked = Boolean(currentUser);

  const fetchQuestions = async ({ reset = false } = {}) => {
    if (!supabase) {
      setInitialLoaded(true);
      setHasMore(false);
      setMessage("Supabase ortam değişkenleri tanımlı değil.");
      return;
    }

    if (loadingRef.current) return;
    loadingRef.current = true;

    const nextPage = reset ? 0 : pageRef.current;
    const from = nextPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    setLoading(true);
    const questionsResult = await supabase
      .from("couple_questions")
      .select("id, question, sort_order, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .range(from, to);

    loadingRef.current = false;
    setLoading(false);
    setInitialLoaded(true);

    if (questionsResult.error) {
      setMessage(questionsResult.error.message);
      return;
    }

    const nextItems = questionsResult.data || [];
    const nextQuestions = reset ? nextItems : mergeUniqueItems(questions, nextItems);
    setQuestions(nextQuestions);
    pageRef.current = nextPage + 1;
    setHasMore(nextItems.length === PAGE_SIZE);
    setMessage("");

    const questionIds = nextQuestions.map((question) => question.id);
    if (!questionIds.length) {
      setAnswers([]);
      return;
    }

    const answersResult = await supabase
      .from("couple_answers")
      .select("id, question_id, author, answer, updated_at")
      .in("question_id", questionIds)
      .order("updated_at", { ascending: false });

    if (answersResult.error) {
      setMessage(answersResult.error.message);
      return;
    }

    setAnswers(answersResult.data || []);
  };

  useEffect(() => {
    const savedUser = window.localStorage.getItem("questions-user");
    if (savedUser === "Enes" || savedUser === "Efsa") setCurrentUser(savedUser);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    pageRef.current = 0;
    setHasMore(true);
    fetchQuestions({ reset: true });
  }, [unlocked]);

  useEffect(() => {
    if (!unlocked || !supabase) return;

    const channel = supabase
      .channel("couple-questions")
      .on("postgres_changes", { event: "*", schema: "public", table: "couple_questions" }, () => {
        pageRef.current = 0;
        setHasMore(true);
        fetchQuestions({ reset: true });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "couple_answers" }, () => {
        pageRef.current = 0;
        setHasMore(true);
        fetchQuestions({ reset: true });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [unlocked]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || !initialLoaded || !unlocked) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchQuestions();
      },
      { rootMargin: "520px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, initialLoaded, unlocked, questions]);

  function unlock(event) {
    event.preventDefault();
    const user = PIN_USERS[pin];

    if (!user) {
      setMessage("Şifre yanlış.");
      return;
    }

    setCurrentUser(user);
    window.localStorage.setItem("questions-user", user);
    setPin("");
    setMessage("");
  }

  function logout() {
    setCurrentUser("");
    setPin("");
    setQuestions([]);
    setAnswers([]);
    setInitialLoaded(false);
    setHasMore(true);
    window.localStorage.removeItem("questions-user");
  }

  function updateDraft(questionId, value) {
    setDrafts((current) => ({
      ...current,
      [questionId]: value
    }));
  }

  async function saveAnswer(questionId) {
    if (!currentUser || !supabase) return;
    const value = drafts[questionId]?.trim();

    if (!value) {
      setMessage("Cevap boş olamaz.");
      return;
    }

    setSavingId(questionId);
    setMessage("");

    const { error } = await supabase.from("couple_answers").insert({
      question_id: questionId,
      author: currentUser,
      answer: value,
      updated_at: new Date().toISOString()
    });

    setSavingId("");

    if (error) {
      setMessage("Bu soruya daha önce cevap verilmiş. Cevaplar sonradan değiştirilemez.");
      return;
    }

    setDrafts((current) => ({
      ...current,
      [questionId]: ""
    }));
    pageRef.current = 0;
    setHasMore(true);
    fetchQuestions({ reset: true });
  }

  if (!unlocked) {
    return (
      <section className="page-shell flex min-h-[calc(100vh-6rem)] max-w-xl items-center justify-center">
        <form onSubmit={unlock} className="page-panel w-full p-6 sm:p-7">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-roseSoft/20 bg-roseSoft/10 text-roseSoft">
            <LockKeyhole size={22} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-50">Sorular</h1>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Kendi cevaplarını yazmak ve karşı tarafın cevaplarını görmek için PIN gir.
          </p>
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            type="password"
            inputMode="numeric"
            placeholder="PIN"
            className="focus-ring mt-6 h-12 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 text-center text-lg tracking-[0.45em] text-gray-50 placeholder:text-gray-600"
          />
          {message && <p className="mt-3 break-words text-sm text-roseSoft [overflow-wrap:anywhere]">{message}</p>}
          <button className="primary-action focus-ring mt-5 w-full">Aç</button>
        </form>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="page-surface overflow-hidden">
        <div className="border-b border-white/10 px-5 py-6 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="page-kicker">
                <CircleHelp size={15} className="text-roseDeep" />
                Sorular
              </div>
              <h1 className="mt-5 text-3xl font-semibold text-gray-50 sm:text-4xl">
                Kişisel alan
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                Her soruya bir kez cevap verilir; cevaplar sonradan değişmez.
              </p>
            </div>

            <div className="grid gap-2 sm:flex">
              <Link href="/sorular/yeni" className="primary-action focus-ring">
                <Plus size={17} />
                Yeni Soru
              </Link>
              <button type="button" onClick={logout} className="ghost-action focus-ring">
                <LogOut size={16} />
                Çıkış
              </button>
            </div>
          </div>
        </div>

        <div className="px-3 py-5 sm:px-8 lg:px-10">
          {message && <p className="mb-5 break-words text-sm text-roseSoft [overflow-wrap:anywhere]">{message}</p>}

          {!initialLoaded && (
            <div className="space-y-4">
              {[0, 1, 2].map((item) => (
                <div key={item} className="soft-card h-64 animate-pulse" />
              ))}
            </div>
          )}

          {initialLoaded && questions.length === 0 && !message && (
            <div className="page-panel p-7 text-center text-gray-400">
              Henüz soru yok.
            </div>
          )}

          <div className="space-y-4">
            {questions.map((question, index) => {
              const answerGroup = answersByQuestion.get(question.id) || {};
              const currentAnswer = answerGroup[currentUser]?.answer || "";
              const draft = drafts[question.id] ?? "";

              return (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  answerGroup={answerGroup}
                  draft={draft}
                  currentUser={currentUser}
                  saving={savingId === question.id}
                  onDraftChange={(value) => updateDraft(question.id, value)}
                  onSave={() => saveAnswer(question.id)}
                />
              );
            })}
          </div>

          <div ref={sentinelRef} className="h-8" />

          {loading && initialLoaded && (
            <p className="mt-5 text-center text-sm text-gray-500">Sorular yükleniyor...</p>
          )}

          {!hasMore && questions.length > 0 && (
            <p className="mt-5 text-center text-sm text-gray-600">Tüm sorular yüklendi.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function QuestionCard({
  question,
  index,
  answerGroup,
  draft,
  currentUser,
  saving,
  onDraftChange,
  onSave
}) {
  const answeredCount = USERS.filter((user) => answerGroup[user]?.answer).length;

  return (
    <article className="feed-card content-visibility-auto p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-lg border border-roseSoft/25 bg-roseSoft/10 px-3 py-1 text-xs font-medium text-roseSoft">
          Soru {index + 1}
        </span>
        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-500">
          {answeredCount}/2 cevaplandı
        </span>
      </div>

      <h2 className="mt-4 break-words text-[1.35rem] font-semibold leading-tight text-gray-50 [overflow-wrap:anywhere] sm:text-2xl">
        {question.question}
      </h2>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {USERS.map((user) => {
          const styles = getUserClasses(user);
          const answer = answerGroup[user]?.answer;
          const canAnswerHere = user === currentUser && !answer;

          return (
            <section key={user} className={`rounded-lg border p-4 ${styles.panel}`}>
              <div className={`mb-3 inline-flex items-center rounded-lg border px-3 py-1 text-xs ${styles.badge}`}>
                <UserRound size={12} className="mr-1" />
                {user}
              </div>

              {answer ? (
                <ExpandableText text={answer} limit={240} className="leading-7 text-gray-200" />
              ) : canAnswerHere ? (
                <div>
                  <textarea
                    value={draft}
                    onChange={(event) => onDraftChange(event.target.value)}
                    rows={4}
                    placeholder="Cevabını yaz..."
                    className="focus-ring w-full resize-y rounded-lg border border-white/10 bg-[#0d0f15] p-3 leading-7 text-gray-100 placeholder:text-gray-600"
                  />
                  <TextStats value={draft} label="Cevap" />
                  <button
                    type="button"
                    onClick={onSave}
                    disabled={saving || !draft.trim()}
                    className="primary-action focus-ring mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    <Save size={17} />
                    {saving ? "Kaydediliyor" : "Cevabı Kaydet"}
                  </button>
                </div>
              ) : (
                <p className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm leading-6 text-gray-600">
                  Henüz cevap yok.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </article>
  );
}
