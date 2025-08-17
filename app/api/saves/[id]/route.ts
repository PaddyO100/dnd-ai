import { NextResponse } from 'next/server'
import { saveManager } from '../../../../lib/saves/saveManager'

// GET /api/saves/[id] - Load a specific save game by slot number
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const slotNumber = parseInt(id)
    
    if (isNaN(slotNumber) || slotNumber < 1 || slotNumber > 6) {
      return NextResponse.json(
        { error: 'Invalid slot number. Must be between 1 and 6.' },
        { status: 400 }
      )
    }

    // Load from slot using save manager
    const savedGame = await saveManager.loadFromSlot(slotNumber)
    
    return NextResponse.json({ 
      success: true,
      save: {
        id: savedGame.id,
        name: savedGame.name,
        gameState: savedGame.gameState,
        metadata: savedGame.metadata,
        thumbnail: savedGame.thumbnail
      }
    })
  } catch (error) {
    console.error('Error loading save:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load save game' },
      { status: 500 }
    )
  }
}

// Special endpoints for quick save/load and auto-save
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const action = id
    
    if (action === 'quicksave') {
      const body = await req.json()
      const metadata = await saveManager.quickSave(body.gameState)
      return NextResponse.json({
        success: true,
        message: 'Quick save completed',
        metadata
      })
    }
    
    if (action === 'quickload') {
      const savedGame = await saveManager.quickLoad()
      return NextResponse.json({
        success: true,
        save: savedGame
      })
    }
    
    if (action === 'autosave') {
      const body = await req.json()
      const metadata = await saveManager.autoSave(body.gameState)
      return NextResponse.json({
        success: true,
        message: 'Auto save completed',
        metadata
      })
    }
    
    if (action === 'export') {
      const body = await req.json()
      const slotNumber = body.slotNumber
      if (!slotNumber) {
        return NextResponse.json(
          { error: 'Slot number required for export' },
          { status: 400 }
        )
      }
      
      const exportData = saveManager.exportSave(slotNumber)
      return NextResponse.json({
        success: true,
        exportData,
        filename: `aethel-forge-save-slot-${slotNumber}-${Date.now()}.txt`
      })
    }
    
    if (action === 'import') {
      const body = await req.json()
      const { encodedSave, targetSlot } = body
      if (!encodedSave || !targetSlot) {
        return NextResponse.json(
          { error: 'Encoded save data and target slot required' },
          { status: 400 }
        )
      }
      
      const metadata = await saveManager.importSave(encodedSave, targetSlot)
      return NextResponse.json({
        success: true,
        message: 'Save imported successfully',
        metadata
      })
    }
    
    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in save action:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Action failed' },
      { status: 500 }
    )
  }
}

// Removed legacy mock implementation

// PUT /api/saves/[id] - Update an existing save in specific slot
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const slotNumber = parseInt(id)
    const body = await req.json()
    
    if (isNaN(slotNumber) || slotNumber < 1 || slotNumber > 6) {
      return NextResponse.json(
        { error: 'Invalid slot number. Must be between 1 and 6.' },
        { status: 400 }
      )
    }

    // Update save in slot
    const metadata = await saveManager.saveToSlot(
      body.gameState,
      slotNumber,
      body.name || `Save ${slotNumber}`,
      body.autoSave || false
    )

    return NextResponse.json({
      success: true,
      message: 'Save updated successfully',
      slotNumber,
      metadata
    })
  } catch (error) {
    console.error('Error updating save:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update save' },
      { status: 500 }
    )
  }
}

// DELETE /api/saves/[id] - Delete a specific save by slot number
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const slotNumber = parseInt(id)
    
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