import { generateText, Output } from 'ai'
import { z } from 'zod'

export const maxDuration = 60

const exerciseSchema = z.object({
  name: z.string().describe('Exercise name — use common gym names'),
  sets: z.string().describe('Sets and reps in format like "3×10", "4×8", "3×12 each", "30 sec"'),
})

const routineSchema = z.object({
  name: z.string().describe('Short routine name like "Push Day", "Upper Body", "HIIT Circuit"'),
  days: z.array(z.number()).describe('Days of the week this runs (0=Sunday, 1=Monday, ..., 6=Saturday)'),
  exercises: z.array(exerciseSchema).describe('Ordered list of exercises for this routine'),
})

const workoutProgramSchema = z.object({
  routines: z.array(routineSchema).describe('All routines in the program'),
})

const SYSTEM_PROMPT = `You are an elite personal trainer and program designer. The user will describe their fitness goals, available equipment, experience level, and schedule. Your job is to create a structured workout program with specific routines assigned to specific days.

Rules:
1. Each routine should have 5-8 exercises with appropriate sets/reps.
2. Use REAL exercise names that are standard in fitness (e.g. "Dumbbell Bench Press" not "Push exercise").
3. Sets format: "3×10", "4×8", "3×12 each" (for unilateral), "3×30 sec" (for timed), "5×5" (for strength).
4. Assign days logically — don't put two heavy routines back to back if possible.
5. Days are 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday.
6. Match equipment constraints STRICTLY. If they say "dumbbells only", do NOT include barbell or machine exercises.
7. Match experience level — beginners get simpler movements, advanced get compound supersets.
8. Include warm-up movements or compound lifts first, isolation exercises last.
9. Be specific with exercise names (e.g. "Incline Dumbbell Press" not just "Chest press").
10. Create multiple routines if the user wants different workouts on different days.
11. Keep it practical and achievable — don't program 2-hour sessions unless asked.
12. If the user mentions a time constraint (e.g. "20 minutes"), keep exercise count appropriate.`

export async function POST(req: Request) {
  const { description, currentProgram } = (await req.json()) as {
    description?: string
    currentProgram?: { routines: { name: string; days: number[]; exercises: { name: string; sets: string }[] }[] }
  }

  if (!description || !description.trim()) {
    return Response.json({ error: 'Description is required' }, { status: 400 })
  }

  let contextPrompt: string
  if (currentProgram && currentProgram.routines.length > 0) {
    const programSummary = currentProgram.routines.map((r) =>
      `- ${r.name} (${r.days.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}): ${r.exercises.map(e => `${e.name} ${e.sets}`).join(', ')}`
    ).join('\n')

    contextPrompt = `The user has an existing program:\n\n${programSummary}\n\nThey want to modify it. Here's their request:\n\n"${description}"\n\nKeep what works, change what they asked for. Return the full updated program.`
  } else {
    contextPrompt = `Here's what the user wants for their workout program:\n\n"${description}"\n\nDesign their optimal training program.`
  }

  try {
    const { output } = await generateText({
      model: 'openai/gpt-5.4-mini',
      output: Output.object({ schema: workoutProgramSchema }),
      system: SYSTEM_PROMPT,
      prompt: contextPrompt,
    })

    return Response.json(output)
  } catch (err) {
    console.log('[workout] AI parse error:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Could not build workout program' }, { status: 500 })
  }
}
