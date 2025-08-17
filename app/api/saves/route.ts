import { NextResponse } from 'next/server'
import { z } from 'zod'
import { saveManager } from '../../../lib/saves/saveManager'

// Enhanced Save/Load API for game states with comprehensive metadata and thumbnail support

const SaveGameSchema = z.object({
  name: z.string().min(1).max(100),
  slotNumber: z.number().min(1).max(6).optional(),
  autoSave: z.boolean().optional(),
  gameState: z.object({
    step: z.string(),
    selections: z.any().optional(),
    party: z.array(z.any()).optional(),
    history: z.array(z.any()).optional(),
    inventory: z.array(z.string()).optional(),
    quests: z.array(z.any()).optional(),
    map: z.object({
      seed: z.number().optional(),
      imageUrl: z.string().optional()
    }).optional(),
    rngSeed: z.number().optional(),
    settings: z.any().optional(),
    selectedPlayerId: z.string().optional()
  }),
  metadata: z.object({
    timestamp: z.number(),
    version: z.string().optional(),
    playTime: z.number().optional(),
    lastLocation: z.string().optional(),
    partyLevel: z.number().optional(),
    campaignProgress: z.number().optional(),
    thumbnailUrl: z.string().optional(),
    checksum: z.string().optional()
  }).optional()
})

const SlotQuerySchema = z.object({
  slot: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(6)).optional(),
  includeThumbnails: z.string().transform(val => val === 'true').optional()
})

// GET /api/saves - List all saved games with slot information
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const query = SlotQuerySchema.parse(Object.fromEntries(url.searchParams))
    
    // Get all save slots
    const slots = saveManager.getAllSlots()
    
    // If specific slot requested
    if (query.slot) {
      const slot = slots.find(s => s.id === query.slot)
      if (!slot) {
        return NextResponse.json(
          { error: 'Save slot not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ slot })
    }
    
    // Return all slots with metadata
    const slotsWithMetadata = slots.map(slot => ({
      id: slot.id,
      name: slot.name,
      isEmpty: slot.isEmpty,
      metadata: slot.save?.metadata ? {
        timestamp: slot.save.metadata.timestamp,
        playTime: slot.save.metadata.playTime,
        lastLocation: slot.save.metadata.lastLocation,
        partyLevel: slot.save.metadata.partyLevel,
        campaignProgress: slot.save.metadata.campaignProgress,
        version: slot.save.metadata.version,
        autoSave: slot.save.metadata.autoSave,
        ...(query.includeThumbnails && slot.save.thumbnail ? { thumbnail: slot.save.thumbnail } : {})
      } : null
    }))
    
    // Get save statistics
    const statistics = saveManager.getSaveStatistics()
    
    // Get auto-save info
    const autoSave = await saveManager.loadAutoSave()
    
    return NextResponse.json({ 
      slots: slotsWithMetadata,
      statistics,
      autoSave: autoSave ? {
        timestamp: autoSave.metadata.timestamp,
        playTime: autoSave.metadata.playTime,
        lastLocation: autoSave.metadata.lastLocation
      } : null
    })
  } catch (error) {
    console.error('Error fetching saves:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved games' },
      { status: 500 }
    )
  }
}

// POST /api/saves - Create a new save with enhanced metadata and thumbnail support
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = SaveGameSchema.parse(body)
    
    // Determine slot number
    let slotNumber = validatedData.slotNumber
    if (!slotNumber) {
      // Find first available slot
      const slots = saveManager.getAllSlots()
      const emptySlot = slots.find(slot => slot.isEmpty)
      if (!emptySlot) {
        return NextResponse.json(
          { error: 'No available save slots. Please delete a save first.' },
          { status: 400 }
        )
      }
      slotNumber = emptySlot.id
    }
    
    // Save to slot with comprehensive metadata
    const metadata = await saveManager.saveToSlot(
      validatedData.gameState as unknown as import('@/lib/state/gameStore').GameState,
      slotNumber,
      validatedData.name,
      validatedData.autoSave || false
    )

    return NextResponse.json({ 
      success: true, 
      saveId: metadata.id,
      slotNumber,
      message: 'Game saved successfully',
      metadata: {
        timestamp: metadata.timestamp,
        playTime: metadata.playTime,
        lastLocation: metadata.lastLocation,
        partyLevel: metadata.partyLevel,
        campaignProgress: metadata.campaignProgress,
        version: metadata.version,
        checksum: metadata.checksum
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid save data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error saving game:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save game' },
      { status: 500 }
    )
  }
}

// DELETE /api/saves - Delete a save by slot number
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const slotParam = url.searchParams.get('slot')
    
    if (!slotParam) {
      return NextResponse.json(
        { error: 'Slot number is required' },
        { status: 400 }
      )
    }
    
    const slotNumber = parseInt(slotParam)
    if (isNaN(slotNumber) || slotNumber < 1 || slotNumber > 6) {
      return NextResponse.json(
        { error: 'Invalid slot number. Must be between 1 and 6.' },
        { status: 400 }
      )
    }

    // Delete from slot
    await saveManager.deleteSlot(slotNumber)

    return NextResponse.json({ 
      success: true, 
      message: `Save in slot ${slotNumber} deleted successfully`,
      slotNumber
    })
  } catch (error) {
    console.error('Error deleting save:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete save' },
      { status: 500 }
    )
  }
}