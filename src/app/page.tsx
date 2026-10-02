"use client";

import { useEffect, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const subjects = [
  "همه دروس",
  "ریاضی",
  "علوم",
  "فارسی",
  "انگلیسی",
  "مطالعات",
  "عربی",
];

export default function Home() {
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [subject, setSubject] = useState("همه دروس");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem("hamrah-name");

    if (savedName) {
      setName(savedName);
    }
  }, []);

  function saveName() {
    const cleanName = nameInput.trim();

    if (!cleanName) return;

    localStorage.setItem("hamrah-name", cleanName);
    setName(cleanName);
  }

  function logout() {
    localStorage.removeItem("hamrah-name");
    setName("");
    setNameInput("");
  }

  async function sendMessage(text?: string) {
    const question = (text ?? input).trim();

    if (!question || loading) return;

    setInput("");

    setMessages((old) => [
      ...old,
      {
        role: "user",
        content: question,
      },
    ]);

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question,
          subject,
          name,
        }),
      });

      const data = await response.json();

      setMessages((old) => [
        ...old,
        {
          role: "assistant",
          content:
            data.answer ||
            data.error ||
            "پاسخی دریافت نشد.",
        },
      ]);
    } catch {
      setMessages((old) => [
        ...old,
        {
          role: "assistant",
          content: "❌ ارتباط با سرور برقرار نشد.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function startVoiceInput() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "مرورگر شما قابلیت تشخیص صدا را پشتیبانی نمی‌کند."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "fa-IR";
    recognition.interimResults = true;
    recognition.continuous = false;

    setListening(true);

    recognition.onresult = (event: any) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript +=
          event.results[i][0].transcript;
      }

      setInput(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  }

  function readText(text: string) {
    if (!("speechSynthesis" in window)) {
      alert(
        "مرورگر شما قابلیت خواندن متن را پشتیبانی نمی‌کند."
      );
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = "fa-IR";
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  }

  function stopReading() {
    window.speechSynthesis.cancel();
  }

  if (!name) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#07110d] px-6 text-white"
      >
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl">
          <div className="mb-6 text-6xl">
            🧠
          </div>

          <h1 className="text-4xl font-black">
            همراه{" "}
            <span className="text-emerald-400">
              دروس
            </span>
          </h1>

          <p className="mt-4 leading-7 text-slate-400">
            سلام! قبل از شروع، اسمت چیه؟
          </p>

          <input
            value={nameInput}
            onChange={(e) =>
              setNameInput(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                saveName();
              }
            }}
            placeholder="مثلاً رهام"
            className="mt-8 w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-right outline-none placeholder:text-slate-600 focus:border-emerald-400"
          />

          <button
            onClick={saveName}
            disabled={!nameInput.trim()}
            className="mt-4 w-full rounded-2xl bg-emerald-500 px-6 py-4 font-black text-black transition hover:bg-emerald-400 disabled:opacity-30"
          >
            شروع کنیم 🚀
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#07110d] text-white"
    >
      <header className="border-b border-white/10 bg-[#08150f]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-black">
              همراه{" "}
              <span className="text-emerald-400">
                دروس
              </span>
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              سلام {name} 👋
            </p>
          </div>

          <button
            onClick={logout}
            className="text-sm text-slate-500 hover:text-white"
          >
            تغییر نام
          </button>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-90px)] max-w-6xl md:grid-cols-[230px_1fr]">
        <aside className="border-l border-white/10 p-5">
          <p className="mb-4 text-sm font-bold text-slate-400">
            انتخاب درس
          </p>

          <div className="space-y-2">
            {subjects.map((item) => (
              <button
                key={item}
                onClick={() => setSubject(item)}
                className={`w-full rounded-xl px-4 py-3 text-right text-sm transition ${
                  subject === item
                    ? "bg-emerald-500 font-bold text-black"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[calc(100vh-90px)] flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="flex h-full min-h-[500px] flex-col items-center justify-center text-center">
                <div className="mb-5 text-6xl">
                  👋
                </div>

                <h2 className="text-4xl font-black">
                  سلام {name}!
                </h2>

                <p className="mt-4 max-w-xl leading-8 text-slate-500">
                  من همراه دروس هستم. سؤال درسی‌ات را
                  بنویس یا با صدایت بگو.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {[
                    "یک مسئله ریاضی را حل کن",
                    "فتوسنتز را توضیح بده",
                    "یک متن انگلیسی را بررسی کن",
                    "درس امروز را خلاصه کن",
                  ].map((text) => (
                    <button
                      key={text}
                      onClick={() => setInput(text)}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-slate-300 transition hover:border-emerald-400/30 hover:bg-emerald-400/5"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-5">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user"
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                        message.role === "user"
                          ? "bg-emerald-500 text-black"
                          : "border border-white/10 bg-white/[0.05] text-slate-200"
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-8">
                        {message.content}
                      </div>

                      {message.role === "assistant" && (
                        <div className="mt-3 flex gap-2 border-t border-white/10 pt-3">
                          <button
                            onClick={() =>
                              readText(message.content)
                            }
                            className="rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-300 hover:bg-white/10"
                          >
                            🔊 خواندن
                          </button>

                          <button
                            onClick={stopReading}
                            className="rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-300 hover:bg-white/10"
                          >
                            ⏹ توقف
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-end">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-emerald-300">
                      <span className="animate-pulse">
                        در حال فکر کردن...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-5">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 focus-within:border-emerald-400/40">
                <textarea
                  value={input}
                  onChange={(e) =>
                    setInput(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={`سؤال خود را درباره ${subject} بنویس...`}
                  className="h-20 w-full resize-none bg-transparent p-2 text-right outline-none placeholder:text-slate-600"
                />

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={startVoiceInput}
                      disabled={listening}
                      className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                        listening
                          ? "bg-red-500 text-white"
                          : "bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {listening
                        ? "🎙️ در حال شنیدن..."
                        : "🎙️ صحبت"}
                    </button>

                    <button
                      onClick={() => readText(input)}
                      disabled={!input.trim()}
                      className="rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-300 hover:bg-white/10 disabled:opacity-30"
                    >
                      🔊 خواندن
                    </button>
                  </div>

                  <button
                    onClick={() => sendMessage()}
                    disabled={
                      loading || !input.trim()
                    }
                    className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-black transition hover:bg-emerald-400 disabled:opacity-30"
                  >
                    {loading ? "..." : "ارسال ⚡"}
                  </button>
                </div>
              </div>

              <p className="mt-3 text-center text-xs text-slate-700">
                🎙️ صدا توسط مرورگر پردازش می‌شود تا برنامه سبک بماند.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
