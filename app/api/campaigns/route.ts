import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod'
import { 
  getAllCampaigns, 
  getCampaignsByDifficulty, 
  getCampaignsByPlayerCount, 
  searchCampaigns 
} from '@/lib/data/campaigns'
import { generalRateLimit } from '@/lib/middleware/rateLimit'
import { handleApiError, CommonErrors } from '@/lib/middleware/errorHandler'

const CampaignsQuery = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  playerCount: z.coerce.number().min(1).max(10).optional(),
  search: z.string().min(1).optional(),
  tags: z.string().optional(), // comma-separated
  sortBy: z.enum(['title', 'difficulty', 'estimatedHours', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const rateCheck = generalRateLimit(req)
    if (!rateCheck.success) {
      throw CommonErrors.TooManyRequests(rateCheck.reset)
    }

    // Add rate limit headers
    const response = await handleGetCampaigns(req)
    response.headers.set('X-RateLimit-Limit', rateCheck.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateCheck.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateCheck.reset.toString())
    
    return response
  } catch (error) {
    return handleApiError(error)
  }
}

async function handleGetCampaigns(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  
  // Parse query parameters
  const queryResult = CampaignsQuery.safeParse({
    difficulty: searchParams.get('difficulty'),
    playerCount: searchParams.get('playerCount'),
    search: searchParams.get('search'),
    tags: searchParams.get('tags'),
    sortBy: searchParams.get('sortBy'),
    sortOrder: searchParams.get('sortOrder'),
  })

  if (!queryResult.success) {
    throw CommonErrors.ValidationError('Invalid query parameters')
  }

  const { difficulty, playerCount, search, tags, sortBy, sortOrder } = queryResult.data

  // Get campaigns based on filters
  let campaigns = getAllCampaigns()

  // Apply filters
  if (difficulty) {
    campaigns = getCampaignsByDifficulty(difficulty)
  }

  if (playerCount) {
    campaigns = getCampaignsByPlayerCount(playerCount)
  }

  if (search) {
    campaigns = searchCampaigns(search)
  }

  if (tags) {
    const tagList = tags.split(',').map(tag => tag.trim().toLowerCase())
    campaigns = campaigns.filter(campaign =>
      tagList.some(tag => 
        campaign.tags.some(campaignTag => 
          campaignTag.toLowerCase().includes(tag)
        )
      )
    )
  }

  // Sort campaigns
  campaigns.sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'difficulty':
        const difficultyOrder = ['beginner', 'intermediate', 'advanced', 'expert']
        comparison = difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty)
        break
      case 'estimatedHours':
        comparison = a.estimatedHours - b.estimatedHours
        break
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
    }
    
    return sortOrder === 'desc' ? -comparison : comparison
  })

  return NextResponse.json({
    data: campaigns,
    meta: {
      total: campaigns.length,
      filters: {
        difficulty,
        playerCount,
        search,
        tags: tags?.split(',').map(t => t.trim()),
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    },
  })
}