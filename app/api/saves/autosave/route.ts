import { NextResponse } from 'next/server'
import { z } from 'zod'
import { saveManager } from '../../../../lib/saves/saveManager'

// Auto-save endpoint for background save operations (dedicated auto-save slot)
const AutoSaveSchema = z.object({
  gameState: z.any()
})

// GET /api/saves/autosave - Load latest auto-save
export async function GET() {
  try {
    const saved = await saveManager.loadAutoSave()
    if (!saved) {
      return NextResponse.json({ success: false, error: 'No auto-save found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, save: saved })
  } catch (error) {
    console.error('Failed to load auto-save:', error)
    return NextResponse.json({ error: 'Failed to load auto-save' }, { status: 500 })
  }
}

// POST /api/saves/autosave - Automatic background save
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { gameState } = AutoSaveSchema.parse(body)

    const metadata = await saveManager.autoSave(gameState)
    if (!metadata) {
      return NextResponse.json({ success: false, error: 'Auto-save failed' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Auto-save completed',
      metadata
    })

  } catch (error) {
    console.error('Auto-save failed:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid auto-save data', details: error.errors }, 
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Auto-save failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
