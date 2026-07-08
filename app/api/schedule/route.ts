import { generateText, Output } from 'ai'
import { z } from 'zod'

export const maxDuration = 60

const blockSchema = z.object({
  blockTypeId: z.string().describe('The block type ID from the available blocks list'),
  label: z.string().describe('A short custom label for this block instance'),
  startTime: z.string().describe('Start time in HH:MM 24-hour format'),
  endTime: z.string().describe('End time in HH:MM 24-hour format'),
  subtitle: z.string().describe('A brief description of what happens in this block'),
})

const scheduleSchema = z.object({
  weekday: z.array(blockSchema).describe('Blocks for a typical weekday, ordered chronologically'),
  weekend: z.array(blockSchema).describe('Blocks for a typical weekend day, ordered chronologically'),
})

const AVAILABLE_BLOCKS = `
Available block types (use these exact IDs):
- morning-routine: Wake up ritual (sleep log, coffee, intentions)
- bedtime-routine: Wind down for sleep (no screens, skincare, reading)
- work: Focused work session (day job, meetings, deliverables)
- deep-work: Distraction-free focus (no meetings, pure output)
- study: Courses, textbooks, skill development
- fitness: Workout session (pulls from user's configured routine)
- walk: Walking — solo or with someone, 20-60 min
- water: Water tracker (all-day, tracks 8 glasses)
- supplements: Supplement tracking (morning/midday/evening)
- stretching: Flexibility, foam rolling, yoga, mobility
- meditation: Breathwork, guided meditation, mindfulness
- meals: Meal tracking (breakfast, lunch, dinner with calories)
- journaling: Gratitude, morning pages, reflection, free writing
- reading: Books, articles, long-form content
- creative: Music, art, writing, side projects, creative pursuits
- screen-free: Phones and screens away, be present
- family-time: Dedicated time with family, log activities
- social: Friends, calls, coffee catch-ups, community
- commute: Travel time (podcasts, audiobooks, decompress)
- chores: Cleaning, laundry, dishes, tidying
- errands: Groceries, appointments, things outside the house
- meal-prep: Batch cooking, prep lunches, plan food
- pet-care: Feed, walk, play with pets
- hard-stop: Firm boundary marker (work ends, eating window closes)
- break: Step away, walk, snack, stretch, reset focus
- nap: 20-minute power nap
- wind-down: Evening leisure (TV, games, music, low-key time)
- custom: Generic block with notes and checklist
`

const SYSTEM_PROMPT = `You are an expert daily routine architect. The user will describe their typical day, lifestyle, goals, and priorities. Your job is to convert that into a structured daily schedule using ONLY the available block types.

${AVAILABLE_BLOCKS}

Rules:
1. Use ONLY the block type IDs listed above. Never invent new ones.
2. Order blocks chronologically by start time.
3. Use realistic time durations — don't overschedule. Leave breathing room.
4. If the user mentions something that doesn't map to a specific block, use "custom" with an appropriate label.
5. The "water" and "supplements" blocks are all-day trackers — give them wide time ranges (e.g. 06:30-21:00).
6. The "meals" block is also all-day — it tracks breakfast/lunch/dinner across the eating window.
7. "hard-stop" is a marker, not a duration — startTime and endTime should be the same.
8. Create BOTH a weekday and weekend schedule. The weekend should be more relaxed.
9. Be practical. A typical day has 6-12 blocks, not 25.
10. Match the user's tone and priorities. If they emphasize fitness, give it prominent placement. If they value family, make sure that's well-represented.
11. Times should be in 24-hour HH:MM format.
12. Keep labels short (2-4 words) and subtitles to one sentence.`

export async function POST(req: Request) {
  const { description } = (await req.json()) as { description?: string }

  if (!description || !description.trim()) {
    return Response.json({ error: 'Description is required' }, { status: 400 })
  }

  try {
    const { output } = await generateText({
      model: 'openai/gpt-5.4-mini',
      output: Output.object({ schema: scheduleSchema }),
      system: SYSTEM_PROMPT,
      prompt: `Here's what the user said about their day:\n\n"${description}"\n\nBuild their optimal daily schedule.`,
    })

    return Response.json(output)
  } catch (err) {
    console.log('[schedule] AI parse error:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Could not build schedule' }, { status: 500 })
  }
}
