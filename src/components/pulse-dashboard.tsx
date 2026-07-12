"use client";

import { useMemo, useState } from "react";

import type { NotificationTopic } from "@/db/schema";

type TopicCard = {
  key: NotificationTopic;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  marker: string;
};

const topicCards: TopicCard[] = [
  {
    key: "updates",
    number: "01",
    eyebrow: "BUILD TRACKER",
    title: "Патчи и обновления",
    description: "Изменения карт, оружия, Premier, движка и заметок Valve — без шума.",
    marker: "⚡",
  },
  {
    key: "news",
    number: "02",
    eyebrow: "NEWSWIRE",
    title: "Главные новости",
    description: "Анонсы Valve, инсайды с пометкой источника и то, что влияет на игру.",
    marker: "◈",
  },
  {
    key: "bugs",
    number: "03",
    eyebrow: "BUG RADAR",
    title: "Баги и фиксы",
    description: "Критичные проблемы, известные эксплойты и подтверждённые исправления.",
    marker: "◌",
  },
  {
    key: "events",
    number: "04",
    eyebrow: "ESPORTS DESK",
    title: "Турниры CS2",
    description: "Матчи, ростеры, результаты и расписание ключевых ивентов сцены.",
    marker: "✦",
  },
];

const timeline = [
  ["01", "Вы запускаете бота", "Один клик или команда /start в Telegram."],
  ["02", "Включается радар", "Бот сохраняет вашу подписку и список выбранных тем."],
  ["03", "Получаете только важное", "Короткая сводка приходит, когда появляется сигнал."],
];

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 16 16 4M7 4h9v9" />
    </svg>
  );
}

function CommandIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M7.1 3.3 3.5 10l3.6 6.7M12.9 3.3l3.6 6.7-3.6 6.7M9 15.7l2-11.4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m4 10.2 3.7 3.6L16 5.7" />
    </svg>
  );
}

export function PulseDashboard({
  activeSubscribers,
  botUsername,
}: {
  activeSubscribers: number;
  botUsername?: string;
}) {
  const [selectedTopics, setSelectedTopics] = useState<NotificationTopic[]>([
    "updates",
    "news",
    "bugs",
    "events",
  ]);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const botUrl = botUsername ? `https://t.me/${botUsername.replace(/^@/, "")}?start=pulse` : "#setup";
  const selectedLabel = useMemo(
    () => `${selectedTopics.length} из ${topicCards.length} каналов активно`,
    [selectedTopics.length],
  );

  function toggleTopic(topic: NotificationTopic) {
    setSelectedTopics((current) => {
      const next = current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic];
      setToast(next.length ? `Профиль обновлён: ${next.length} канала` : "Выберите хотя бы один канал для радара");
      window.setTimeout(() => setToast(null), 2400);
      return next;
    });
  }

  async function copyStartCommand() {
    try {
      await navigator.clipboard.writeText("/start");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setToast("Введите /start в чате с ботом");
      window.setTimeout(() => setToast(null), 2400);
    }
  }

  return (
    <main className="overflow-hidden bg-[#09090b] text-[#f5f2ea]">
      <section className="relative min-h-[780px] border-b border-white/10 px-5 pb-16 pt-5 sm:px-8 lg:px-12">
        <div className="grid-noise pointer-events-none absolute inset-0 opacity-70" />
        <div className="orange-glow pointer-events-none absolute -right-44 top-10 h-[440px] w-[440px] rounded-full blur-[115px]" />
        <div className="purple-glow pointer-events-none absolute left-[25%] top-[27rem] h-[240px] w-[360px] rounded-full blur-[130px]" />

        <nav className="relative z-10 mx-auto flex max-w-[1380px] items-center justify-between gap-5 rounded-full border border-white/10 bg-white/[0.035] px-4 py-3 backdrop-blur-md sm:px-5">
          <a href="#top" className="flex items-center gap-3" aria-label="Pulse — наверх">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#e9682d] font-black text-[#09090b]">P</span>
            <span className="font-mono text-[15px] font-bold tracking-[0.19em] text-white">PULSE</span>
          </a>
          <div className="hidden items-center gap-7 text-[11px] font-medium uppercase tracking-[0.16em] text-white/55 md:flex">
            <a className="transition hover:text-white" href="#signals">Сигналы</a>
            <a className="transition hover:text-white" href="#flow">Как это работает</a>
            <a className="transition hover:text-white" href="#setup">Подключение</a>
          </div>
          <a
            href={botUrl}
            className="inline-flex items-center gap-2 rounded-full bg-[#f3eee3] px-4 py-2 text-xs font-bold text-[#0b0b0d] transition hover:bg-white"
          >
            Открыть бот <ArrowUpRight />
          </a>
        </nav>

        <div id="top" className="relative z-10 mx-auto grid max-w-[1380px] gap-12 pb-8 pt-20 lg:grid-cols-[1.04fr_.96fr] lg:items-center lg:pt-28">
          <div>
            <div className="mb-7 flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#f19967]">
              <span className="h-2 w-2 rounded-full bg-[#e9682d] shadow-[0_0_18px_#e9682d]" />
              CS2 WATCHTOWER / ONLINE
            </div>
            <h1 className="max-w-4xl font-display text-[clamp(3.55rem,8vw,7.5rem)] font-semibold leading-[0.88] tracking-[-0.075em] text-[#f6f2e9]">
              Всё важное
              <br />
              по CS2. <span className="text-[#ed7440]">Сразу.</span>
            </h1>
            <p className="mt-8 max-w-xl text-[17px] leading-8 text-white/58 sm:text-lg">
              Твой персональный Telegram-радар: обновления, баги, новости Valve и киберспорт — только когда есть что знать.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href={botUrl}
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#e9682d] px-7 text-sm font-bold text-[#100d0b] transition hover:-translate-y-0.5 hover:bg-[#ff8653]"
              >
                Запустить радар <span className="transition-transform group-hover:translate-x-0.5"><ArrowUpRight /></span>
              </a>
              <a
                href="#signals"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/15 bg-white/[0.035] px-7 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/[0.08]"
              >
                Посмотреть сигналы <span className="text-white/60">↓</span>
              </a>
            </div>
            <div className="mt-11 flex flex-wrap gap-x-7 gap-y-4 border-t border-white/10 pt-6 text-[11px] uppercase tracking-[0.15em] text-white/42">
              <span className="flex items-center gap-2"><span className="text-[#e9682d]">●</span> Без спама</span>
              <span className="flex items-center gap-2"><span className="text-[#e9682d]">●</span> Источники в каждом посте</span>
              <span className="flex items-center gap-2"><span className="text-[#e9682d]">●</span> В Telegram</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[580px] lg:ml-auto">
            <div className="absolute -left-5 top-16 h-[70%] w-px bg-gradient-to-b from-transparent via-[#e9682d] to-transparent opacity-60" />
            <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[#121215]/95 shadow-[0_30px_90px_rgba(0,0,0,.42)]">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <div className="flex items-center gap-3">
                  <span className="relative grid h-9 w-9 place-items-center rounded-full bg-[#e9682d] text-sm font-black text-black">P<span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#121215] bg-[#9ee493]" /></span>
                  <div>
                    <p className="text-sm font-bold">PULSE / CS2</p>
                    <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[.16em] text-[#9ee493]">radar active</p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-white/34">NOW · 16:48</span>
              </div>
              <div className="space-y-4 p-5 sm:p-6">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[.17em] text-[#e7804e]">
                  <span>⚡ UPDATE / BUILD WATCH</span><span>01</span>
                </div>
                <h2 className="max-w-md text-2xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-[28px]">Valve выпустила ночной патч для CS2</h2>
                <p className="max-w-[470px] text-sm leading-6 text-white/58">В фокусе: стабильность субтика, корректировки Anubis и небольшие изменения интерфейса Premier.</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-full border border-[#e9682d]/30 bg-[#e9682d]/10 px-3 py-1 font-mono text-[10px] text-[#f3a17a]">PATCH NOTES</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] text-white/48">VALVE</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/45">
                  <span>Первоисточник прикреплён</span><ArrowUpRight />
                </div>
              </div>
              <div className="grid grid-cols-3 border-t border-white/10 bg-white/[0.025]">
                <div className="p-4"><p className="font-mono text-[9px] tracking-[.15em] text-white/35">КАНАЛЫ</p><p className="mt-1 text-lg font-semibold">04</p></div>
                <div className="border-x border-white/10 p-4"><p className="font-mono text-[9px] tracking-[.15em] text-white/35">РЕЖИМ</p><p className="mt-1 text-lg font-semibold text-[#9ee493]">LIVE</p></div>
                <div className="p-4"><p className="font-mono text-[9px] tracking-[.15em] text-white/35">ФОРМАТ</p><p className="mt-1 text-lg font-semibold">SHORT</p></div>
              </div>
            </div>
            <p className="mt-4 text-right font-mono text-[10px] uppercase tracking-[.18em] text-white/28">Пример сигнала · не скриншот</p>
          </div>
        </div>
      </section>

      <section id="signals" className="relative border-b border-white/10 px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1380px]">
          <div className="grid gap-8 border-b border-white/10 pb-9 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#e7804e]">// SELECTIVE INTELLIGENCE</p>
              <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.7rem,5vw,4.7rem)] font-semibold leading-[.93] tracking-[-.065em]">Выбирай сигнал,<br />не информационный шум.</h2>
            </div>
            <p className="max-w-xs pb-1 text-sm leading-6 text-white/50">Каждая категория — отдельный фильтр. Никаких десятков сообщений за день просто ради ленты.</p>
          </div>

          <div className="grid divide-y divide-white/10 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            {topicCards.map((topic, index) => {
              const isSelected = selectedTopics.includes(topic.key);
              return (
                <button
                  key={topic.key}
                  type="button"
                  onClick={() => toggleTopic(topic.key)}
                  className={`group relative min-h-[230px] p-7 text-left transition sm:p-9 ${index % 2 === 0 ? "lg:pl-0" : "lg:pl-10"} ${index > 1 ? "lg:pt-10" : "lg:pb-10"}`}
                >
                  <span className="absolute right-7 top-7 font-mono text-xs text-white/20 sm:right-9 sm:top-9">{topic.number}</span>
                  <span className={`grid h-11 w-11 place-items-center rounded-full border text-lg transition ${isSelected ? "border-[#e9682d]/70 bg-[#e9682d] text-black" : "border-white/14 bg-white/[.035] text-white/65 group-hover:border-white/35"}`}>{isSelected ? <CheckIcon /> : topic.marker}</span>
                  <p className="mt-8 font-mono text-[10px] tracking-[.18em] text-[#e7804e]">{topic.eyebrow}</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-.04em] text-white">{topic.title}</h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/50">{topic.description}</p>
                  <span className={`mt-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] transition ${isSelected ? "text-[#f29a6c]" : "text-white/35"}`}>{isSelected ? "В радаре" : "Добавить в радар"}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="flow" className="bg-[#f1ede4] px-5 py-24 text-[#101012] sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto grid max-w-[1380px] gap-16 lg:grid-cols-[.83fr_1.17fr]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#b3491e]">// THREE STEPS</p>
            <h2 className="mt-4 font-display text-[clamp(3rem,5vw,5.5rem)] font-semibold leading-[.88] tracking-[-.07em]">Включить.<br /><span className="text-[#ce5525]">Не отвлекаться.</span></h2>
            <p className="mt-7 max-w-sm text-[15px] leading-7 text-black/58">Бот не требует логина, почты или отдельного приложения. Всё управление остаётся в привычном Telegram.</p>
            <div className="mt-10 flex items-center gap-3 text-xs font-bold uppercase tracking-[.13em]">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#101012] text-[#f1ede4]">↘</span> Готов за минуту
            </div>
          </div>
          <ol className="border-t border-black/15">
            {timeline.map(([number, title, description]) => (
              <li key={number} className="grid gap-5 border-b border-black/15 py-7 sm:grid-cols-[52px_1fr_auto] sm:items-center">
                <span className="font-mono text-xs text-[#b3491e]">{number}</span>
                <div><h3 className="text-xl font-semibold tracking-[-.035em]">{title}</h3><p className="mt-2 text-sm leading-6 text-black/53">{description}</p></div>
                <span className="hidden text-2xl text-black/25 sm:block">↗</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="setup" className="relative px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="orange-glow pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]" />
        <div className="relative mx-auto grid max-w-[1380px] gap-8 rounded-[30px] border border-white/13 bg-white/[.035] p-6 shadow-[0_25px_70px_rgba(0,0,0,.18)] lg:grid-cols-[1.1fr_.9fr] lg:p-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#e7804e]">// CONNECT YOUR RADAR</p>
            <h2 className="mt-4 max-w-2xl font-display text-[clamp(2.7rem,5vw,5.1rem)] font-semibold leading-[.9] tracking-[-.07em]">CS2 не ждёт.<br />Твой радар — тоже.</h2>
            <p className="mt-6 max-w-xl text-[15px] leading-7 text-white/55">Открой Telegram и отправь боту одну команду. Категории, отмеченные выше, — твой предпочтительный профиль сигналов.</p>
          </div>
          <div className="rounded-2xl border border-white/12 bg-[#0c0c0e] p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="font-mono text-[10px] uppercase tracking-[.16em] text-white/45">Профиль сигналов</span>
              <span className="rounded-full bg-[#e9682d]/15 px-2.5 py-1 font-mono text-[10px] text-[#f29a6c]">{selectedLabel}</span>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.035] p-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9682d] font-black text-black">P</span>
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold">PULSE / CS2</p><p className="mt-1 truncate font-mono text-[10px] text-white/36">{botUsername ? `@${botUsername.replace(/^@/, "")}` : "telegram username required"}</p></div>
              <span className="h-2 w-2 rounded-full bg-[#9ee493] shadow-[0_0_12px_#9ee493]" />
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={copyStartCommand} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#f2eee5] px-4 font-mono text-xs font-bold text-black transition hover:bg-white">
                {copied ? <CheckIcon /> : <CommandIcon />}{copied ? "СКОПИРОВАНО" : "/START"}
              </button>
              <a href={botUrl} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e9682d] px-4 text-xs font-bold text-black transition hover:bg-[#ff8653]">Открыть <ArrowUpRight /></a>
            </div>
            {!botUsername && <p className="mt-4 text-xs leading-5 text-[#f3a17a]">Для запуска добавьте NEXT_PUBLIC_TELEGRAM_BOT_USERNAME в окружение проекта.</p>}
          </div>
        </div>

        <div className="relative mx-auto mt-8 grid max-w-[1380px] gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="font-mono text-[10px] tracking-[.16em] text-white/35">СТАТУС БОТА</p><p className="mt-3 flex items-center gap-2 text-sm font-semibold"><span className="h-2 w-2 rounded-full bg-[#9ee493]" /> ENDPOINT READY</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="font-mono text-[10px] tracking-[.16em] text-white/35">АКТИВНЫХ РАДАРОВ</p><p className="mt-3 text-xl font-semibold">{activeSubscribers.toLocaleString("ru-RU")}</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="font-mono text-[10px] tracking-[.16em] text-white/35">КОМАНДЫ</p><p className="mt-3 font-mono text-sm text-white/75">/start · /status · /stop</p></div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-7 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-4 text-[11px] uppercase tracking-[.15em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PULSE / CS2 INTELLIGENCE</p>
          <p>Не аффилирован с Valve или Counter-Strike</p>
        </div>
      </footer>

      {toast && <div className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/14 bg-[#171719] px-5 py-3 text-sm text-white shadow-2xl">{toast}</div>}
    </main>
  );
}
