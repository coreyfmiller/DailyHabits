import Link from 'next/link'
import { ArrowRight, CheckCircle2, Flame, Droplets, Dumbbell, Utensils, Moon } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="flex flex-col items-center text-center">
          <img
            src="/bothlogo.png"
            alt="RoutinePro.ai"
            className="h-20 sm:h-28 mb-8"
            style={{ filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.8))' }}
          />
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Your daily routine,{' '}
            <span className="text-primary">optimized.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            A time-blocked daily tracker that adapts to your life. Track meals, fitness, water, supplements, sleep, and more — all in one place.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/60 bg-secondary/30 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
            Everything you need to stay on track
          </h2>
          <p className="mt-3 text-center text-muted-foreground">
            Built for people who want structure without rigidity.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<CheckCircle2 className="size-6 text-primary" />}
              title="Time-Blocked Schedule"
              description="Your day laid out in blocks — morning routine, work, fitness, family time. See what's next at a glance."
            />
            <FeatureCard
              icon={<Utensils className="size-6 text-primary" />}
              title="AI Meal Tracking"
              description="Describe what you ate in plain English. AI extracts items, estimates calories, and logs it instantly."
            />
            <FeatureCard
              icon={<Dumbbell className="size-6 text-primary" />}
              title="Workout Routines"
              description="Rotating push/pull/legs splits with checkable exercises. Auto-switches by day of week."
            />
            <FeatureCard
              icon={<Droplets className="size-6 text-primary" />}
              title="Water & Supplements"
              description="Track glasses of water and daily supplements with time-of-day assignments."
            />
            <FeatureCard
              icon={<Moon className="size-6 text-primary" />}
              title="Sleep Logging"
              description="Log bedtime and rate sleep quality. See hours slept calculated automatically."
            />
            <FeatureCard
              icon={<Flame className="size-6 text-primary" />}
              title="Streaks & Progress"
              description="Daily completion ring, streak counter, and weekly overview keep you motivated."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
            How it works
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <Step number="1" title="Set your schedule" description="Define your time blocks — work hours, meals, fitness, family time. Weekday vs weekend." />
            <Step number="2" title="Track your day" description="Check off habits, log meals, tap through your routine. Sections highlight as the day progresses." />
            <Step number="3" title="Build consistency" description="Streaks, progress rings, and weekly reviews keep you accountable without being annoying." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-foreground">Ready to own your day?</h2>
          <p className="mt-3 text-muted-foreground">
            Free to use. No account required. Installs on your phone as a PWA.
          </p>
          <Link
            href="/app"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Launch RoutinePro.ai
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center text-xs text-muted-foreground sm:px-6">
          <img src="/logo.png" alt="RoutinePro.ai" className="mx-auto h-8 mb-3" />
          <p>© {new Date().getFullYear()} RoutinePro.ai. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="mb-3">{icon}</div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
        {number}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
