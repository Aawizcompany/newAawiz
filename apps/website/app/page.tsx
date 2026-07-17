"use client";

import { useState } from "react";
import { translations, type Locale } from "./i18n";

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const t = translations[locale];

  return (
    <div className="min-h-screen bg-white">
      <Navbar t={t} locale={locale} setLocale={setLocale} />
      <Hero t={t} />
      <Stats t={t} />
      <Features t={t} />
      <HowItWorks t={t} />
      <ForOrgs t={t} />
      <Privacy t={t} />
      <CTA t={t} />
      <Footer t={t} locale={locale} />
    </div>
  );
}

/* ── Navbar ── */
function Navbar({ t, locale, setLocale }: { t: typeof translations.en; locale: Locale; setLocale: (l: Locale) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <span className="text-lg font-bold text-gray-900">Aawiz</span>
        </a>

        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-gray-600 hover:text-[#6366F1] transition-colors">{t.nav.features}</a>
          <a href="#how" className="text-sm text-gray-600 hover:text-[#6366F1] transition-colors">{t.nav.howItWorks}</a>
          <a href="#orgs" className="text-sm text-gray-600 hover:text-[#6366F1] transition-colors">{t.nav.forOrgs}</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
            <button onClick={() => setLocale("en")} className={`px-2.5 py-1.5 transition-colors ${locale === "en" ? "bg-[#6366F1] text-white" : "text-gray-500 hover:bg-gray-50"}`}>EN</button>
            <button onClick={() => setLocale("nl")} className={`px-2.5 py-1.5 transition-colors ${locale === "nl" ? "bg-[#6366F1] text-white" : "text-gray-500 hover:bg-gray-50"}`}>NL</button>
          </div>
          <a href="http://localhost:3000" className="text-sm text-gray-600 hover:text-gray-900">{t.nav.login}</a>
          <a href="http://localhost:3000/register" className="px-4 py-2 bg-[#6366F1] text-white text-sm font-medium rounded-lg hover:bg-[#4F46E5] transition-colors">{t.nav.getStarted}</a>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
            <button onClick={() => setLocale("en")} className={`px-2 py-1 transition-colors ${locale === "en" ? "bg-[#6366F1] text-white" : "text-gray-500"}`}>EN</button>
            <button onClick={() => setLocale("nl")} className={`px-2 py-1 transition-colors ${locale === "nl" ? "bg-[#6366F1] text-white" : "text-gray-500"}`}>NL</button>
          </div>
          <button onClick={() => setOpen(!open)} className="p-2">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {open ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          {[["#features", t.nav.features], ["#how", t.nav.howItWorks], ["#orgs", t.nav.forOrgs]].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="block text-sm text-gray-700 py-1">{label}</a>
          ))}
          <a href="http://localhost:3000/register" className="block w-full text-center px-4 py-2.5 bg-[#6366F1] text-white text-sm font-medium rounded-lg mt-2">{t.nav.getStarted}</a>
        </div>
      )}
    </nav>
  );
}

/* ── Hero ── */
function Hero({ t }: { t: typeof translations.en }) {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-[#EEF2FF] rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[#EEF2FF] rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF2FF] border border-[#6366F1]/20 text-[#6366F1] text-xs font-semibold mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-pulse" />
          {t.hero.badge}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 whitespace-pre-line">
          {t.hero.title}
        </h1>

        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t.hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
          <a href="http://localhost:3000/register"
            className="px-8 py-3.5 bg-[#6366F1] text-white font-semibold rounded-xl hover:bg-[#4F46E5] transition-colors shadow-lg shadow-[#6366F1]/25">
            {t.hero.cta}
          </a>
          <a href="#how"
            className="px-8 py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-[#6366F1] hover:text-[#6366F1] transition-colors">
            {t.hero.demo} →
          </a>
        </div>

        <p className="text-xs text-gray-400 mb-8">{t.hero.trustedBy}</p>

        {/* Dashboard mockup */}
        <div className="relative max-w-3xl mx-auto">
          <div className="rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/50 overflow-hidden bg-white">
            <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-300" />
                <div className="w-3 h-3 rounded-full bg-yellow-300" />
                <div className="w-3 h-3 rounded-full bg-green-300" />
              </div>
              <div className="flex-1 mx-4 bg-white rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-400">app.aawiz.com</div>
            </div>
            <div className="p-6 bg-gray-50/50">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[["😊 4.2", "Avg. Mood"], ["🔥 7", "Day Streak"], ["✅ 5", "This Week"]].map(([val, label]) => (
                  <div key={label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-left">
                    <p className="text-lg font-bold text-gray-900">{val}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-3">
                <p className="text-xs font-semibold text-gray-500 mb-3">MOOD TREND</p>
                <svg viewBox="0 0 300 60" className="w-full">
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M10,45 L55,30 L100,35 L145,20 L190,25 L235,10 L290,15 L290,60 L10,60 Z" fill="url(#heroGrad)" />
                  <path d="M10,45 L55,30 L100,35 L145,20 L190,25 L235,10 L290,15" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  {[[10,45],[55,30],[100,35],[145,20],[190,25],[235,10],[290,15]].map(([x,y],i) => (
                    <circle key={i} cx={x} cy={y} r="3" fill="#6366F1" />
                  ))}
                </svg>
              </div>
              <div className="flex gap-2">
                {["😢 Mon","😕 Tue","😐 Wed","😊 Thu","😄 Fri"].map((d) => (
                  <div key={d} className="flex-1 bg-white rounded-lg p-2 border border-gray-100 text-center text-xs text-gray-500 shadow-sm">{d}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Stats ── */
function Stats({ t }: { t: typeof translations.en }) {
  const items = [
    { value: "120+", label: t.stats.orgs },
    { value: "8,400+", label: t.stats.employees },
    { value: "52K+", label: t.stats.checkins },
    { value: "34%", label: t.stats.improvement },
  ];
  return (
    <section className="py-14 border-y border-gray-100 bg-gray-50/60">
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {items.map((s) => (
          <div key={s.label}>
            <p className="text-3xl font-bold text-[#6366F1]">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Features ── */
const featureIcons = ["✏️", "💬", "📊", "📈", "🌐", "🔒"];

function Features({ t }: { t: typeof translations.en }) {
  return (
    <section id="features" className="py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t.features.title}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{t.features.subtitle}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.features.items.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-[#6366F1]/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-lg mb-4">
                {featureIcons[i]}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ── */
function HowItWorks({ t }: { t: typeof translations.en }) {
  return (
    <section id="how" className="py-20 px-4 sm:px-6 bg-gray-50/60">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t.howItWorks.title}</h2>
          <p className="text-gray-500">{t.howItWorks.subtitle}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {t.howItWorks.steps.map((s, i) => (
            <div key={i} className="flex gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1] flex items-center justify-center text-white font-bold text-sm shrink-0">
                {s.step}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── For Organizations ── */
function ForOrgs({ t }: { t: typeof translations.en }) {
  return (
    <section id="orgs" className="py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t.forOrgs.title}</h2>
        <p className="text-gray-500 mb-12">{t.forOrgs.subtitle}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {t.forOrgs.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm hover:border-[#6366F1]/30 hover:shadow-md transition-all">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Privacy ── */
function Privacy({ t }: { t: typeof translations.en }) {
  return (
    <section className="py-20 px-4 sm:px-6 bg-[#6366F1]">
      <div className="max-w-3xl mx-auto text-center">
        <div className="text-4xl mb-6">🔒</div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">{t.privacy.title}</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-left">
          {t.privacy.points.map((p, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/10 rounded-xl px-5 py-4">
              <svg className="w-5 h-5 text-white shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm text-white/90 leading-relaxed">{p}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ── */
function CTA({ t }: { t: typeof translations.en }) {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t.cta.title}</h2>
        <p className="text-gray-500 mb-10">{t.cta.subtitle}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="http://localhost:3000/register"
            className="px-8 py-3.5 bg-[#6366F1] text-white font-semibold rounded-xl hover:bg-[#4F46E5] transition-colors shadow-lg shadow-[#6366F1]/25">
            {t.cta.button}
          </a>
          <a href="mailto:hello@aawiz.com"
            className="px-8 py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-[#6366F1] hover:text-[#6366F1] transition-colors">
            {t.cta.secondary}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer({ t, locale }: { t: typeof translations.en; locale: Locale }) {
  return (
    <footer className="border-t border-gray-100 py-12 px-4 sm:px-6 bg-gray-50/60">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#6366F1] flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <span className="font-bold text-gray-900">Aawiz</span>
            </div>
            <p className="text-sm text-gray-500 max-w-[220px]">{t.footer.tagline}</p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">{t.footer.product}</p>
              <div className="space-y-2">
                {(["features","pricing","security"] as const).map((k) => (
                  <a key={k} href="#" className="block text-sm text-gray-500 hover:text-[#6366F1] transition-colors">
                    {t.footer.links[k]}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">{t.footer.company}</p>
              <div className="space-y-2">
                {(["about","blog","contact","privacy","terms"] as const).map((k) => (
                  <a key={k} href="#" className="block text-sm text-gray-500 hover:text-[#6366F1] transition-colors">
                    {t.footer.links[k]}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Aawiz. {t.footer.rights}</p>
          <span className="text-xs text-gray-400">{locale === "en" ? "🇬🇧 English" : "🇳🇱 Nederlands"}</span>
        </div>
      </div>
    </footer>
  );
}
