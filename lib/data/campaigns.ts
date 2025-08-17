import type { Campaign, CampaignSummary } from '@/schemas/api'

// Predefined campaigns data
export const OFFICIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'starter-dungeon',
    title: 'The Goblin Caves',
    description: 'A perfect introduction to D&D for new players. Explore mysterious caves, face goblins, and discover ancient treasures.',
    difficulty: 'beginner',
    estimatedHours: 4,
    playerCount: { min: 2, max: 5 },
    tags: ['beginner-friendly', 'dungeon-crawl', 'exploration', 'combat'],
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    scenarios: [
      {
        id: 'gc-1',
        title: 'The Village of Millbrook',
        summary: 'A peaceful farming village is troubled by goblin raids. The party must investigate and help the villagers.',
        mapIdea: 'A quaint village with wooden houses, a marketplace, and fields surrounding it',
        order: 1,
      },
      {
        id: 'gc-2',
        title: 'Into the Caves',
        summary: 'Following goblin tracks, the party discovers the entrance to a cave system. Dark passages await exploration.',
        mapIdea: 'A cave entrance with multiple winding tunnels and chambers',
        order: 2,
      },
      {
        id: 'gc-3',
        title: 'The Goblin King',
        summary: 'Deep in the caves, the party faces the goblin leader and uncovers the reason behind the raids.',
        mapIdea: 'A large underground throne room with crude goblin decorations and treasure piles',
        order: 3,
      },
    ],
    presetCharacters: [
      {
        name: 'Thorin Ironshield',
        class: 'Fighter',
        level: 1,
        description: 'A brave dwarf warrior with a strong sense of justice',
      },
      {
        name: 'Luna Starweaver',
        class: 'Wizard',
        level: 1,
        description: 'A curious elf mage eager to learn ancient secrets',
      },
      {
        name: 'Pip Lightfoot',
        class: 'Rogue',
        level: 1,
        description: 'A nimble halfling scout with excellent stealth skills',
      },
    ],
    worldInfo: {
      setting: 'Traditional Fantasy',
      theme: 'Heroic Adventure',
      magicLevel: 'medium',
      techLevel: 'medieval',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'urban-mystery',
    title: 'Shadows of Waterdeep',
    description: 'A noir-style mystery in the great city. Investigate crimes, navigate politics, and uncover a conspiracy.',
    difficulty: 'intermediate',
    estimatedHours: 8,
    playerCount: { min: 3, max: 6 },
    tags: ['mystery', 'urban', 'investigation', 'roleplay'],
    thumbnail: 'https://images.unsplash.com/photo-1519817950559-4edd40e27c17?w=400',
    scenarios: [
      {
        id: 'sw-1',
        title: 'Murder in the Market',
        summary: 'A wealthy merchant is found dead in the marketplace. The city watch needs help solving the case.',
        mapIdea: 'A bustling medieval marketplace with stalls, crowds, and narrow alleys',
        order: 1,
      },
      {
        id: 'sw-2',
        title: 'The Noble District',
        summary: 'Investigation leads to the upper class area of the city, where secrets and lies abound.',
        mapIdea: 'Elegant mansions, manicured gardens, and wide tree-lined streets',
        order: 2,
      },
      {
        id: 'sw-3',
        title: 'The Underground',
        summary: 'The trail leads to the criminal underworld beneath the city streets.',
        mapIdea: 'Dark sewers and hidden tunnels with makeshift criminal hideouts',
        order: 3,
      },
    ],
    worldInfo: {
      setting: 'Urban Fantasy',
      theme: 'Mystery & Intrigue',
      magicLevel: 'medium',
      techLevel: 'medieval',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'wilderness-survival',
    title: 'Lost in the Wilds',
    description: 'Survive in an untamed wilderness. Hunt for food, face natural dangers, and discover ancient ruins.',
    difficulty: 'advanced',
    estimatedHours: 12,
    playerCount: { min: 2, max: 4 },
    tags: ['survival', 'exploration', 'nature', 'challenging'],
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    scenarios: [
      {
        id: 'lw-1',
        title: 'The Crash',
        summary: 'The party\'s airship crashes in unknown wilderness. Survival is the first priority.',
        mapIdea: 'Dense forest with the wreckage of an airship in a clearing',
        order: 1,
      },
      {
        id: 'lw-2',
        title: 'Following the River',
        summary: 'Following a river downstream in hopes of finding civilization or a way out.',
        mapIdea: 'A winding river through varied terrain with rapids and calm pools',
        order: 2,
      },
      {
        id: 'lw-3',
        title: 'The Ancient Ruins',
        summary: 'Discovery of mysterious ruins that may hold the key to escape or great danger.',
        mapIdea: 'Overgrown stone ruins partially reclaimed by nature',
        order: 3,
      },
    ],
    worldInfo: {
      setting: 'Wilderness Fantasy',
      theme: 'Survival & Discovery',
      magicLevel: 'low',
      techLevel: 'medieval',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'planar-adventure',
    title: 'Rifts Between Worlds',
    description: 'Travel between different planes of existence. Face otherworldly creatures and reality-bending challenges.',
    difficulty: 'expert',
    estimatedHours: 16,
    playerCount: { min: 4, max: 6 },
    tags: ['planar', 'high-magic', 'otherworldly', 'epic'],
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    scenarios: [
      {
        id: 'rw-1',
        title: 'The Shattered Mirror',
        summary: 'Reality begins to fracture around the party, opening portals to other dimensions.',
        mapIdea: 'A crystalline chamber with floating mirror shards showing different worlds',
        order: 1,
      },
      {
        id: 'rw-2',
        title: 'The Feywild',
        summary: 'Journey through the magical realm of the fey, where logic and reality work differently.',
        mapIdea: 'An enchanted forest with impossible colors and floating islands',
        order: 2,
      },
      {
        id: 'rw-3',
        title: 'The Shadowfell',
        summary: 'Navigate the dark reflection of the material plane to find a way to seal the rifts.',
        mapIdea: 'A twisted, dark version of familiar locations drained of color and hope',
        order: 3,
      },
    ],
    worldInfo: {
      setting: 'Multiverse Fantasy',
      theme: 'Epic Planar Adventure',
      magicLevel: 'high',
      techLevel: 'medieval',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

export function getAllCampaigns(): CampaignSummary[] {
  return OFFICIAL_CAMPAIGNS.map(campaign => ({
    id: campaign.id,
    title: campaign.title,
    description: campaign.description,
    difficulty: campaign.difficulty,
    estimatedHours: campaign.estimatedHours,
    playerCount: campaign.playerCount,
    tags: campaign.tags,
    thumbnail: campaign.thumbnail,
    worldInfo: campaign.worldInfo,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    scenarioCount: campaign.scenarios.length,
    isOfficial: true,
  }))
}

export function getCampaignById(id: string): Campaign | null {
  return OFFICIAL_CAMPAIGNS.find(campaign => campaign.id === id) || null
}

export function getCampaignsByDifficulty(difficulty: Campaign['difficulty']): CampaignSummary[] {
  return getAllCampaigns().filter(campaign => campaign.difficulty === difficulty)
}

export function getCampaignsByPlayerCount(playerCount: number): CampaignSummary[] {
  return getAllCampaigns().filter(campaign => 
    playerCount >= campaign.playerCount.min && playerCount <= campaign.playerCount.max
  )
}

export function searchCampaigns(query: string): CampaignSummary[] {
  const lowercaseQuery = query.toLowerCase()
  return getAllCampaigns().filter(campaign =>
    campaign.title.toLowerCase().includes(lowercaseQuery) ||
    campaign.description.toLowerCase().includes(lowercaseQuery) ||
    campaign.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}