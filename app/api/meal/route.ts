import { generateText, Output } from 'ai'
import { z } from 'zod'

export const maxDuration = 30

const mealSchema = z.object({
  title: z.string().describe('The full meal description as the user wrote it, just cleaned up slightly (e.g. "3 eggs" stays as "3 Eggs", "grilled chicken with rice" stays as "Grilled Chicken with Rice"). Never shorten or abbreviate.'),
  mealType: z
    .enum(['breakfast', 'lunch', 'dinner', 'snack', 'drink'])
    .describe('The most likely meal category'),
  items: z.array(z.string()).describe('Individual foods or drinks identified in the description'),
  estimatedCalories: z.number().int().describe('A rough total calorie estimate'),
  healthNote: z.string().describe('One short, friendly note about the meal'),
})

export async function POST(req: Request) {
  const { description } = (await req.json()) as { description?: string }

  if (!description || !description.trim()) {
    return Response.json({ error: 'Description is required' }, { status: 400 })
  }

  try {
    const { output } = await generateText({
      model: 'openai/gpt-5.4-mini',
      output: Output.object({ schema: mealSchema }),
      system:
        'You are a nutrition assistant that turns a free-text meal description into structured data. Be concise and realistic with calorie estimates.',
      prompt: `Parse this meal description: "${description}"`,
    })

    return Response.json(output)
  } catch (err) {
    console.log('[v0] meal parse error:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Could not analyze meal' }, { status: 500 })
  }
}
