import { z } from 'zod'

export const Scenario = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  mapIdea: z.string(),
})

export type Scenario = z.infer<typeof Scenario>
