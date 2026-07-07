import { Wordmark } from "@/components/marketing/wordmark"
import { PunkButton } from "@/components/marketing/punk-button"
import { HardShadowCard } from "@/components/marketing/hard-shadow-card"
import { SectionHeading } from "@/components/marketing/section-heading"
import { StarRating } from "@/components/marketing/star-rating"
import { StatTile } from "@/components/marketing/stat-tile"
import { AlbumSwatch } from "@/components/marketing/album-swatch"
import { ActivityCard } from "@/components/marketing/activity-card"
import { MiniFeedRow } from "@/components/marketing/mini-feed-row"
import type { Accent } from "@/components/marketing/types"

const HERO_SWATCHES: { accent: Accent; shadowAccent: Accent; offset: "none" | "up" | "down" }[] = [
  { accent: "red", shadowAccent: "blue", offset: "none" },
  { accent: "yellow", shadowAccent: "red", offset: "down" },
  { accent: "blue", shadowAccent: "yellow", offset: "none" },
  { accent: "cyan", shadowAccent: "yellow", offset: "up" },
  { accent: "red", shadowAccent: "cyan", offset: "none" },
  { accent: "yellow", shadowAccent: "blue", offset: "down" },
]

const STATS = [
  { value: "2.4M", label: "ALBUMS LOGGED" },
  { value: "340K", label: "LISTENERS" },
  { value: "890K", label: "REVIEWS WRITTEN" },
]

const FEATURES: { icon: string; title: string; description: string; accent: Accent }[] = [
  {
    icon: "★",
    title: "RATE EVERY SPIN",
    description:
      "Half-star ratings for the album and every track. Build a diary of everything you've heard.",
    accent: "red",
  },
  {
    icon: "◈",
    title: "FOLLOW YOUR PEOPLE",
    description: "See what your friends and favorite critics are spinning the second they log it.",
    accent: "blue",
  },
  {
    icon: "✎",
    title: "WRITE THE REVIEW",
    description: "Full reviews, track-by-track notes, spoiler tags. Say exactly what you thought.",
    accent: "yellow",
  },
]

const ACTIVITY = [
  {
    username: "sol_ay",
    timestampLabel: "4h ago",
    albumTitle: "BRAT",
    artist: "Charli xcx",
    rating: 4.5,
    accent: "red" as Accent,
    avatarColor: "#2ee6c8",
  },
  {
    username: "deuce",
    timestampLabel: "9h ago",
    albumTitle: "BRIGHT FUTURE",
    artist: "Adrianne Lenker",
    rating: 5,
    accent: "blue" as Accent,
    avatarColor: "#ff6a3d",
  },
  {
    username: "maya",
    timestampLabel: "18h ago",
    albumTitle: "THE OVERLOAD",
    artist: "Yard Act",
    rating: 4.5,
    accent: "yellow" as Accent,
    avatarColor: "#7a5cff",
  },
]

const STEPS: { num: number; bg: string; textColor: string; rotate: number; lead: string; rest: string }[] = [
  {
    num: 1,
    bg: "#ffe000",
    textColor: "#0a0a0a",
    rotate: -4,
    lead: "Log the spin.",
    rest: "Album, EP, one-off single — timestamp it the second you hit play.",
  },
  {
    num: 2,
    bg: "#ff2b2b",
    textColor: "#fff",
    rotate: 3,
    lead: "Rate it out of five.",
    rest: "Half-stars allowed. No fence-sitting past that.",
  },
  {
    num: 3,
    bg: "#2ee6ff",
    textColor: "#0a0a0a",
    rotate: -3,
    lead: "Watch the feed light up.",
    rest: "Everyone you follow, in one running tape.",
  },
]

const MINI_FEED = [
  {
    username: "MAYA",
    timestampLabel: "2H AGO",
    albumTitle: "THE OVERLOAD",
    rating: 4.5,
    thumbnailAccent: "red" as Accent,
    shadowAccent: "blue" as Accent,
  },
  {
    username: "DEUCE",
    timestampLabel: "5H AGO",
    albumTitle: "BRIGHT FUTURE",
    rating: 5,
    thumbnailAccent: "cyan" as Accent,
    shadowAccent: "yellow" as Accent,
  },
  {
    username: "SOL_AY",
    timestampLabel: "1D AGO",
    albumTitle: "BRAT",
    rating: 4.5,
    thumbnailAccent: "yellow" as Accent,
    shadowAccent: "red" as Accent,
  },
]

const TESTIMONIALS: { rating: number; quote: string; handle: string; accent: Accent; rotate: number }[] = [
  {
    rating: 5,
    quote: "Replaced my group chat. Now everyone just fights about ratings instead.",
    handle: "@toneflight",
    accent: "red",
    rotate: -1,
  },
  {
    rating: 4.5,
    quote: "Finally a diary for my listening habit that doesn't feel like a spreadsheet.",
    handle: "@b_sides",
    accent: "blue",
    rotate: 1,
  },
  {
    rating: 5,
    quote: "Found three of my favorite albums this year just from people I follow logging them.",
    handle: "@wax_and_wane",
    accent: "yellow",
    rotate: -0.5,
  },
]

const FOOTER_COLUMNS = [
  { title: "PRODUCT", links: ["Explore", "Lists", "Pro"] },
  { title: "COMPANY", links: ["About", "Careers", "Press"] },
  { title: "SUPPORT", links: ["Help", "Contact", "Guidelines"] },
]

export function MarketingLanding() {
  return (
    <div className="font-[family-name:var(--font-archivo)] bg-[#0a0a0a] text-[#f2f2f2] relative">
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,.045) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      {/* nav */}
      <div className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-6 border-b-[3px] border-[#f2f2f2]">
        <Wordmark />
        <div className="flex gap-3.5 items-center">
          <PunkButton href="/login" variant="ghost" size="sm">
            LOG IN
          </PunkButton>
          <PunkButton href="/login" variant="solid" size="sm" accent="red" rotate={-1}>
            SIGN UP
          </PunkButton>
        </div>
      </div>

      {/* hero */}
      <div className="relative z-10 px-6 sm:px-12 pt-[70px] pb-[60px] grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center max-w-[1280px] mx-auto">
        <div>
          <h1
            className="font-[family-name:var(--font-bungee)] inline-block m-0"
            style={{
              fontSize: 56,
              lineHeight: 1.08,
              color: "#ffe000",
              textShadow: "4px 4px 0 #ff2b2b",
              rotate: "-1deg",
            }}
          >
            TRACK THE
            <br />
            TUNES YOU
            <br />
            SPIN.
          </h1>
          <p className="font-[family-name:var(--font-space-mono)] text-[14.5px] leading-[1.7] text-[#d8d8d8] max-w-[440px] mt-6 bg-black/40 border-l-[3px] border-[#2b6bff] px-3.5 py-2.5">
            Log every album, rate every track, and follow the ears you trust. Deepcutz is where your
            listening habit becomes your diary.
          </p>
          <div className="flex gap-4 flex-wrap mt-8">
            <PunkButton href="/login" variant="solid" accent="red" rotate={-0.6}>
              ▶ GET STARTED — IT&apos;S FREE
            </PunkButton>
            <PunkButton href="#features" variant="outline-dark" accent="blue">
              SEE DEMO
            </PunkButton>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3" style={{ rotate: "2deg" }}>
          {HERO_SWATCHES.map((swatch, i) => (
            <AlbumSwatch key={i} {...swatch} />
          ))}
        </div>
      </div>

      {/* stats strip */}
      <div className="relative z-10 bg-[#f2f2f2] text-[#0a0a0a] border-y-[3px] border-black py-7 px-6 sm:px-12 flex justify-center gap-16 flex-wrap">
        {STATS.map((stat) => (
          <StatTile key={stat.label} {...stat} />
        ))}
      </div>

      {/* features */}
      <div id="features" className="relative z-10 max-w-[1280px] mx-auto px-6 sm:px-12 py-[70px] scroll-mt-6">
        <div className="mb-10">
          <SectionHeading accent="yellow" rotate={-1}>
            WHAT YOU GET
          </SectionHeading>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px]">
          {FEATURES.map((feature) => (
            <HardShadowCard key={feature.title} tone="light" accent={feature.accent} className="p-[26px]">
              <div className="text-3xl mb-3" aria-hidden="true">
                {feature.icon}
              </div>
              <h3 className="font-[family-name:var(--font-bungee)] text-base mb-2">{feature.title}</h3>
              <p className="font-[family-name:var(--font-archivo)] text-[13px] leading-[1.55] text-[#2a2a2a] m-0">
                {feature.description}
              </p>
            </HardShadowCard>
          ))}
        </div>
      </div>

      {/* activity ticker */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 sm:px-12 pb-[70px]">
        <div className="mb-8">
          <SectionHeading accent="cyan" rotate={1}>
            RIGHT NOW ON DEEPCUTZ
          </SectionHeading>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
          {ACTIVITY.map((entry) => (
            <ActivityCard key={entry.username} {...entry} />
          ))}
        </div>
      </div>

      {/* app showcase */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 sm:px-12 pt-2.5 pb-20">
        <div className="mb-9">
          <SectionHeading accent="blue" rotate={1}>
            YOUR FEED, YOUR RULES
          </SectionHeading>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-11 items-center">
          <div>
            <p className="font-[family-name:var(--font-space-mono)] text-[14.5px] leading-[1.75] text-[#d8d8d8] max-w-[420px] mb-6.5">
              A wall of what your friends spun last night. Every review, every half-star, every
              &quot;wait you HAVE to hear this&quot; — all in one scroll.
            </p>
            <div className="flex flex-col gap-4 max-w-[420px]">
              {STEPS.map((step) => (
                <div key={step.num} className="flex gap-3.5 items-start">
                  <span
                    aria-hidden="true"
                    className="flex-none w-[30px] h-[30px] border-2 border-black flex items-center justify-center font-[family-name:var(--font-bungee)] text-[13px]"
                    style={{ backgroundColor: step.bg, color: step.textColor, rotate: `${step.rotate}deg` }}
                  >
                    {step.num}
                  </span>
                  <div className="font-[family-name:var(--font-archivo)] text-[13.5px] leading-[1.5] text-[#e6e6e6]">
                    <b className="text-white">{step.lead}</b> {step.rest}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <HardShadowCard tone="dark" accent="red" shadow={8} rotate={1} className="p-4">
            <div className="flex items-center gap-1.5 mb-3" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff2b2b]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffe000]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#2ee6ff]" />
            </div>
            <div className="flex flex-col gap-2.5">
              {MINI_FEED.map((row) => (
                <MiniFeedRow key={row.username} {...row} />
              ))}
            </div>
          </HardShadowCard>
        </div>
      </div>

      {/* testimonials */}
      <div className="relative z-10 bg-[#f2f2f2] border-y-[3px] border-black py-16 px-6 sm:px-12">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-[34px]">
            <SectionHeading rotate={-1}>WHAT LISTENERS SAY</SectionHeading>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px]">
            {TESTIMONIALS.map((t) => (
              <HardShadowCard
                key={t.handle}
                tone="white"
                accent={t.accent}
                shadow={5}
                rotate={t.rotate}
                className="p-[22px]"
              >
                <StarRating rating={t.rating} />
                <p className="italic font-[family-name:var(--font-archivo)] text-[13.5px] leading-[1.55] text-[#1a1a1a] my-2.5 mb-3.5">
                  &quot;{t.quote}&quot;
                </p>
                <div className="font-[family-name:var(--font-space-mono)] text-[11px] text-[#555]">
                  — {t.handle}
                </div>
              </HardShadowCard>
            ))}
          </div>
        </div>
      </div>

      {/* final CTA */}
      <div className="relative z-10 text-center px-6 sm:px-12 pt-[70px] pb-[90px]">
        <div className="mb-[26px]">
          <SectionHeading size="lg" accent="yellow" rotate={-1}>
            READY TO PRESS PLAY?
          </SectionHeading>
        </div>
        <div>
          <PunkButton href="/login" variant="solid" size="lg" accent="blue">
            ＋ CREATE YOUR ACCOUNT
          </PunkButton>
        </div>
      </div>

      {/* footer */}
      <div className="relative z-10 border-t-[3px] border-[#f2f2f2] px-6 sm:px-12 py-10 flex justify-between items-start flex-wrap gap-8">
        <Wordmark size="sm" />
        <div className="flex gap-10 flex-wrap font-[family-name:var(--font-space-mono)] text-xs text-[#9a9a9a]">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-2.5">
              <b className="text-[#f2f2f2] font-[family-name:var(--font-archivo)]">{column.title}</b>
              {column.links.map((link) => (
                <a key={link} href="#" className="hover:text-[#ffe000]">
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="font-[family-name:var(--font-space-mono)] text-[11px] text-[#666]">
          © 2026 DEEPCUTZ. ALL SPINS RESERVED.
        </div>
      </div>
    </div>
  )
}
