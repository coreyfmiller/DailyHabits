import Link from 'next/link'
import {
  ArrowRight, Brain, CheckCircle2, Dumbbell, Droplets, Flame,
  LineChart, Moon, Sparkles, Timer, Trophy, Utensils, Zap
} from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <img src="/darklogo.png" alt="RoutinePro.ai" className="h-5 dark:hidden" />
        <img src="/lighttextlogo.png" alt="RoutinePro.ai" className="h-5 hidden dark:block" />
        <Link
          href="/app"
          className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Open App
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-4 pb-24 pt-16 sm:px-6 sm:pt-28">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="relative flex flex-col items-center text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3" />
            AI-Powered Daily Optimization
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Design your perfect day.
            <br />
            <span className="text-primary">Then live it.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Tell AI about your life. Get a structured daily routine in seconds.
            Track meals, workouts, hydration, fasting, and habits — all in one beautiful app
            that adapts to how you actually live.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/app/setup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              Build Your Routine
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              View Demo
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free. No account required. Works on any device.
          </p>
        </div>
      </section>

      {/* Social proof numbers */}
      <section className="border-y border-border/40 bg-secondary/20 py-8">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-4 sm:grid-cols-4 sm:px-6">
          <Stat number="60s" label="to build a full schedule" />
          <Stat number="10+" label="pro workout templates" />
          <Stat number="70+" label="exercises in library" />
          <Stat number="100%" label="free, no account needed" />
        </div>
      </section>

      {/* Core features */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-foreground sm:text-4xl">
              One app for your entire day
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Not another habit tracker. A complete daily operating system that understands
              how nutrition, fitness, work, and rest connect.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Sparkles className="size-5" />}
              title="AI Schedule Builder"
              description="Describe your day in plain English. AI creates a structured time-blocked schedule you can edit and refine."
              accent="primary"
            />
            <FeatureCard
              icon={<Utensils className="size-5" />}
              title="Smart Nutrition"
              description="Log meals with AI. Track calories, fasting windows, and diet goals. One unified food log — no more tab switching."
              accent="primary"
            />
            <FeatureCard
              icon={<Dumbbell className="size-5" />}
              title="AI Workout Programs"
              description="Tell AI your goals and equipment. Get a custom program. Refine it with conversation. Start workouts with guided mode."
              accent="primary"
            />
            <FeatureCard
              icon={<Timer className="size-5" />}
              title="Intermittent Fasting"
              description="Built-in IF support with 16:8, 18:6, 20:4, or custom windows. Live status shows if your eating window is open."
              accent="primary"
            />
            <FeatureCard
              icon={<Droplets className="size-5" />}
              title="Water & Supplements"
              description="Track hydration and supplements with time-of-day awareness. Morning, midday, and evening — never miss a dose."
              accent="primary"
            />
            <FeatureCard
              icon={<Flame className="size-5" />}
              title="Streaks & Heatmap"
              description="Daily progress ring, streak counter, and 28-day activity heatmap. See your consistency at a glance."
              accent="primary"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/40 bg-secondary/20 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
            From zero to optimized in 3 steps
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            <Step
              number="1"
              icon={<Brain className="size-5 text-primary" />}
              title="Tell AI about your life"
              description="Wake time, work schedule, fitness goals, family commitments. The AI builds your full weekday and weekend schedule."
            />
            <Step
              number="2"
              icon={<Zap className="size-5 text-primary" />}
              title="Live your optimized day"
              description="Blocks highlight as the day progresses. One-tap completions. Smart reminders. Everything tracked automatically."
            />
            <Step
              number="3"
              icon={<LineChart className="size-5 text-primary" />}
              title="See your consistency"
              description="Weekly heatmaps, streak counters, progress rings, and AI insights show you where you're winning and where to improve."
            />
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
            What makes this different
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <DiffCard
              title="AI that builds, not just tracks"
              description="Other apps make you manually configure everything. RoutinePro builds your entire schedule from a conversation, then lets you refine it."
            />
            <DiffCard
              title="Nutrition meets routine"
              description="Fasting windows, calorie targets, and meal logging aren't separate apps — they're part of your day's structure."
            />
            <DiffCard
              title="Works offline as a PWA"
              description="Install it on your phone's home screen. No app store needed. Works without internet. Your data stays on your device."
            />
            <DiffCard
              title="Zero lock-in"
              description="No account required. Export your data anytime. Everything runs in your browser. Switch devices by importing a JSON backup."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/40 bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <Trophy className="mx-auto size-10 text-primary mb-4" />
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Ready to take control of your day?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join thousands building better routines with AI. Free forever for personal use.
          </p>
          <Link
            href="/app/setup"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl"
          >
            Build My Routine — Free
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto max-w-4xl px-4 flex flex-col items-center gap-3 text-center sm:px-6">
          <img src="/darklogo.png" alt="RoutinePro.ai" className="h-4 dark:hidden" />
          <img src="/lighttextlogo.png" alt="RoutinePro.ai" className="h-4 hidden dark:block" />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RoutinePro.ai. Built for people who want more from their day.
          </p>
        </div>
      </footer>
    </main>
  )
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-foreground">{number}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function FeatureCard({ icon, title, description, accent }: { icon: React.ReactNode; title: string; description: string; accent: string }) {
  return (
    <div className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
      <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function Step({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10">
        {icon}
      </div>
      <div className="mt-1 text-xs font-medium text-primary">Step {number}</div>
      <h3 className="mt-2 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function DiffCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
