import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  Sparkles,
  ShieldCheck,
  Heart,
  ArrowRight,
  Users,
  Package,
  Star,
} from "lucide-react";
import { useLanguage } from "../../context/useLanguage";

export default function About() {
  const { t } = useLanguage();

  const values = [
    {
      icon: Leaf,
      title: t("about_val_sourced_title"),
      text: t("about_val_sourced_desc"),
    },
    {
      icon: ShieldCheck,
      title: t("about_val_quality_title"),
      text: t("about_val_quality_desc"),
    },
    {
      icon: Heart,
      title: t("about_val_conscious_title"),
      text: t("about_val_conscious_desc"),
    },
    {
      icon: Sparkles,
      title: t("about_val_recommendations_title"),
      text: t("about_val_recommendations_desc"),
    },
  ];

  const stats = [
    { icon: Package, value: "500+", label: t("about_stat_curated") },
    { icon: Users, value: "10k+", label: t("about_stat_customers") },
    { icon: Star, value: "4.8", label: t("about_stat_rating") },
  ];

  return (
    <div className="overflow-hidden bg-paper text-ink">
      <style>{`
        @keyframes about-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .about-reveal {
          opacity: 0;
        }
        .about-reveal.is-visible {
          animation: about-fade-up .7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes about-pulse {
          0%, 100% { transform: scale(1); opacity: .5; }
          50% { transform: scale(1.1); opacity: .8; }
        }
        .about-pulse {
          animation: about-pulse 5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .about-reveal { opacity: 1 !important; animation: none !important; }
          .about-pulse { animation: none !important; }
        }
      `}</style>


      <section className="relative px-6 pt-20 pb-24 text-center">
        <div className="about-pulse pointer-events-none absolute left-1/2 top-10 z-0 h-72 w-72 -translate-x-1/2 rounded-full bg-moss/[0.07] blur-3xl" />

        <Reveal>
          <p className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-moss mb-3">
            {t("about_story_badge")}
          </p>

          <h1 className="mx-auto max-w-2xl font-display text-[38px] sm:text-[48px] font-medium leading-[1.08] tracking-[-0.02em] text-ink">
            {t("about_hero_title")}
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-stone">
            {t("about_hero_desc")}
          </p>
        </Reveal>
      </section>


      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 100}>
              <div className="rounded-2xl border border-hairline bg-surface p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(33,31,27,0.06)]">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-moss-tint">
                  <stat.icon
                    size={18}
                    className="text-moss"
                    strokeWidth={1.75}
                  />
                </div>

                <p className="font-display text-[26px] font-medium text-ink">
                  {stat.value}
                </p>

                <p className="mt-1 text-[12.5px] text-stone">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 border-y border-hairline bg-surface">
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-linear-to-br from-moss/90 to-moss-deep">
              <div className="absolute inset-0 flex items-center justify-center opacity-25">
                <Leaf size={120} strokeWidth={0.75} className="text-white" />
              </div>

              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            </div>
          </Reveal>

          <Reveal delay={150}>
            <p className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-moss mb-2">
              {t("about_why_badge")}
            </p>

            <h2 className="font-display text-[28px] sm:text-[32px] font-medium leading-tight text-ink mb-4">
              {t("about_why_title")}
            </h2>

            <p className="text-[14px] leading-[1.8] text-stone mb-4">
              {t("about_why_p1")}
            </p>

            <p className="text-[14px] leading-[1.8] text-stone">
              {t("about_why_p2")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* =====================================================
          VALUES
      ===================================================== */}
      <section className="px-6 py-24">
        <Reveal>
          <div className="mx-auto max-w-xl text-center mb-14">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-moss mb-2">
              {t("about_values_badge")}
            </p>

            <h2 className="font-display text-[30px] sm:text-[34px] font-medium text-ink">
              {t("about_values_title")}
            </h2>
          </div>
        </Reveal>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2">
          {values.map((value, index) => (
            <Reveal key={value.title} delay={index * 100}>
              <div className="group flex gap-4 rounded-2xl border border-hairline bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-moss/30 hover:shadow-[0_16px_32px_rgba(33,31,27,0.06)]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-moss-tint transition-all duration-300 group-hover:scale-105 group-hover:bg-moss">
                  <value.icon
                    size={19}
                    strokeWidth={1.5}
                    className="text-moss transition-colors duration-300 group-hover:text-white"
                  />
                </span>

                <div>
                  <h3 className="text-[15px] font-medium text-ink mb-1.5">
                    {value.title}
                  </h3>

                  <p className="text-[13px] leading-relaxed text-stone">
                    {value.text}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24">
        <Reveal>
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-moss px-8 py-14 text-center sm:px-16">
            <div className="about-pulse pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="about-pulse pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

            <h2 className="relative font-display text-[26px] sm:text-[32px] font-medium leading-tight text-white">
              {t("about_cta_title")}
            </h2>

            <p className="relative mt-3 text-[14px] text-white/80 max-w-md mx-auto">
              {t("about_cta_desc")}
            </p>

            <Link
              to="/products"
              className="relative mt-7 inline-flex items-center gap-2 rounded-xl bg-surface border border-hairline/20 px-6 py-3 text-[13.5px] font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-paper hover:text-ink hover:shadow-[0_14px_30px_rgba(0,0,0,0.2)]"
            >
              {t("about_cta_btn")}
              <ArrowRight
                size={15}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

/* =========================================================
   SCROLL REVEAL WRAPPER
========================================================= */

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`about-reveal ${visible ? "is-visible" : ""}`}
      style={{ animationDelay: visible ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}
