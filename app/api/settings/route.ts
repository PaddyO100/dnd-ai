import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';

const SettingsSchema = z.object({
  language: z.enum(['DE', 'EN']),
  autosaveInterval: z.number().min(0).max(60),
  enableSoundEffects: z.boolean(),
  enableVisualDice: z.boolean(),
  difficulty: z.enum(['easy', 'normal', 'hard']),
  theme: z.enum(['light', 'dark', 'auto', 'aethel', 'mystic', 'dragon']),
});

export async function GET() {
  // For now, return default settings since we store in localStorage
  const defaultSettings = {
    language: 'DE',
    autosaveInterval: 5,
    enableSoundEffects: true,
    enableVisualDice: true,
    difficulty: 'normal',
  theme: 'auto',
  };

  return NextResponse.json({ success: true, data: defaultSettings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SettingsSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid settings data',
          details: parsed.error.issues 
        },
        { status: 400 }
      );
    }

    // Settings are stored client-side, so we just validate and return success
    return NextResponse.json({ 
      success: true, 
      data: parsed.data,
      message: 'Settings validated successfully' 
    });
  } catch {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process settings' 
      },
      { status: 500 }
    );
  }
}