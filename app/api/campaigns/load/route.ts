import { NextResponse, NextRequest } from 'next/server'
import { getCampaignById } from '@/lib/data/campaigns'
import { generalRateLimit } from '@/lib/middleware/rateLimit'
import { handleApiError, CommonErrors } from '@/lib/middleware/errorHandler'
import { LoadCampaignRequest, Campaign } from '@/schemas/api'
import type { GameState } from '@/lib/state/gameStore'
import type { Character } from '@/schemas/character'

// Generate default characters for campaign
function generateDefaultCharacters(campaign: Campaign): Character[] {
  if (campaign.presetCharacters) {
    return campaign.presetCharacters.map((preset, index) => ({
      id: `preset-${index}`,
      name: preset.name,
      cls: preset.class,
      hp: 20 + (preset.level - 1) * 6, // Simple HP calculation
      maxHp: 20 + (preset.level - 1) * 6,
      mp: 10 + (preset.level - 1) * 4, // Simple MP calculation
      maxMp: 10 + (preset.level - 1) * 4,
      stats: {
        strength: 12 + Math.floor(Math.random() * 6),
        dexterity: 12 + Math.floor(Math.random() * 6),
        constitution: 12 + Math.floor(Math.random() * 6),
        intelligence: 12 + Math.floor(Math.random() * 6),
        wisdom: 12 + Math.floor(Math.random() * 6),
        charisma: 12 + Math.floor(Math.random() * 6),
      },
      level: preset.level,
      experience: (preset.level - 1) * 1000,
      portraitSeed: Math.floor(Math.random() * 1e9),
  skills: [] as Character['skills'],
  spells: [] as Character['spells'],
  traits: [] as Character['traits'],
  inventory: [] as Character['inventory'],
  conditions: [] as Character['conditions'],
  // Required defaulted progression/social fields
  skillPoints: 0,
  featPoints: 0,
  reputation: 0,
  wealth: 0,
      backstory: {
        personality: preset.description,
  bonds: [],
  ideals: [],
  fears: [],
  generated: false,
      },
    }))
  }

  // Generate basic characters if no presets
  const classes = ['Fighter', 'Wizard', 'Rogue', 'Cleric']
  return classes.slice(0, campaign.playerCount.min).map((cls, index) => ({
    id: `char-${index}`,
    name: `${cls} ${index + 1}`,
    cls,
    hp: 20,
    maxHp: 20,
    mp: 10,
    maxMp: 10,
    stats: {
      strength: 12,
      dexterity: 12,
      constitution: 12,
      intelligence: 12,
      wisdom: 12,
      charisma: 12,
    },
    level: 1,
    experience: 0,
    portraitSeed: Math.floor(Math.random() * 1e9),
  skills: [] as Character['skills'],
  spells: [] as Character['spells'],
  traits: [] as Character['traits'],
  inventory: [] as Character['inventory'],
  conditions: [] as Character['conditions'],
  // Required defaulted progression/social fields
  skillPoints: 0,
  featPoints: 0,
  reputation: 0,
  wealth: 0,
  }))
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateCheck = generalRateLimit(req)
    if (!rateCheck.success) {
      throw CommonErrors.TooManyRequests(rateCheck.reset)
    }

    const body = await req.json()
    const parsed = LoadCampaignRequest.safeParse(body)
    
    if (!parsed.success) {
      throw CommonErrors.ValidationError('Invalid campaign load request')
    }

    const { campaignId, startFromScenario = 0, usePresetCharacters = false } = parsed.data

    // Get campaign data
    const campaign = getCampaignById(campaignId)
    if (!campaign) {
      throw CommonErrors.NotFound('Campaign')
    }

    // Validate scenario index
    if (startFromScenario >= campaign.scenarios.length) {
      throw CommonErrors.ValidationError('Invalid scenario index')
    }

    // Get the starting scenario
    const startingScenario = campaign.scenarios[startFromScenario]

    // Generate game state
    const gameState: Partial<GameState> = {
      step: 'inGame',
      selections: {
        genre: campaign.worldInfo.setting,
        world: {
          magic: campaign.worldInfo.magicLevel,
          tech: campaign.worldInfo.techLevel,
          climate: 'temperate', // Default
        },
        players: campaign.playerCount.min,
        classes: [],
        startingWeapons: [],
        scenario: {
          id: startingScenario.id,
          title: startingScenario.title,
          summary: startingScenario.summary,
          mapIdea: startingScenario.mapIdea,
        },
      },
      party: usePresetCharacters ? generateDefaultCharacters(campaign) : [],
      history: [
        {
          role: 'dm',
          content: `Welcome to "${campaign.title}"! ${startingScenario.summary}`,
        },
      ],
      inventory: [],
      quests: [],
      rngSeed: Math.floor(Math.random() * 1e9),
      map: { seed: Math.floor(Math.random() * 1e9) },
    }

    // Set selected player if characters exist
    if (gameState.party && gameState.party.length > 0) {
      gameState.selectedPlayerId = gameState.party[0].id
    }

    const response = NextResponse.json({
      success: true,
      data: {
        campaign: {
          id: campaign.id,
          title: campaign.title,
          description: campaign.description,
          currentScenario: startingScenario,
          totalScenarios: campaign.scenarios.length,
          worldInfo: campaign.worldInfo,
        },
        gameState,
        nextScenarios: campaign.scenarios.slice(startFromScenario + 1),
      },
    })

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateCheck.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateCheck.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateCheck.reset.toString())

    return response
  } catch (error) {
    return handleApiError(error)
  }
}