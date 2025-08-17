'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/state/gameStore';
import { predefinedCampaigns } from '@/data/campaigns';
import type { PredefinedCampaign } from '@/lib/state/gameStore';

export default function CampaignSelection() {
  const { setSelections } = useGameStore();
  const [selectedCampaign, setSelectedCampaign] = useState<PredefinedCampaign | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const handleCampaignSelect = (campaign: PredefinedCampaign) => {
    setSelectedCampaign(campaign);
    setSelections({ campaign });
    
    // If it's a custom sandbox, go to regular onboarding
    if (campaign.id === 'custom-sandbox') {
      useGameStore.getState().reset();
      return;
    }
    
    // For predefined campaigns, start directly with AI-generated scenarios
    // based on the campaign context
    useGameStore.setState({ step: 'onboarding' });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Anfänger';
      case 'intermediate': return 'Fortgeschritten';
      case 'advanced': return 'Experte';
      default: return difficulty;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="container-page space-y-8 py-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
            Wähle dein Abenteuer
          </h1>
          <p className="text-lg text-amber-800 max-w-2xl mx-auto">
            Beginne mit einer vorgefertigten Kampagne oder erschaffe deine eigene Welt
          </p>
        </div>

        {/* Campaign Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predefinedCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className={`card-fantasy p-6 cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
                  selectedCampaign?.id === campaign.id 
                    ? 'ring-2 ring-amber-400 bg-gradient-to-br from-amber-50 to-orange-50' 
                    : 'hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50'
                }`}
                onClick={() => setSelectedCampaign(campaign)}
              >
                {/* Campaign Header */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg text-amber-900 leading-tight">
                      {campaign.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(campaign.difficulty)}`}>
                      {getDifficultyText(campaign.difficulty)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-amber-700 leading-relaxed">
                    {campaign.description}
                  </p>
                </div>

                {/* Campaign Info */}
                <div className="space-y-2 text-xs text-amber-600 mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Dauer: {campaign.estimatedDuration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Spieler: {campaign.playerCount.min}-{campaign.playerCount.max}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <span>Thema: {campaign.theme}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {campaign.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {campaign.tags.length > 3 && (
                    <span className="text-xs text-amber-600">
                      +{campaign.tags.length - 3} mehr
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetails(showDetails === campaign.id ? null : campaign.id);
                    }}
                    className="flex-1 text-xs bg-amber-100 text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-200 transition-colors"
                  >
                    {showDetails === campaign.id ? 'Weniger' : 'Details'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCampaignSelect(campaign);
                    }}
                    className="flex-1 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors font-medium"
                  >
                    Wählen
                  </button>
                </div>

                {/* Expanded Details */}
                {showDetails === campaign.id && (
                  <div className="mt-4 pt-4 border-t border-amber-200 space-y-3 text-xs">
                    <div>
                      <div className="font-semibold text-amber-800 mb-1">Setting:</div>
                      <p className="text-amber-700">{campaign.preview.setting}</p>
                    </div>
                    <div>
                      <div className="font-semibold text-amber-800 mb-1">Hook:</div>
                      <p className="text-amber-700 italic">{campaign.preview.hook}</p>
                    </div>
                    <div>
                      <div className="font-semibold text-amber-800 mb-1">Features:</div>
                      <ul className="list-disc list-inside text-amber-700 space-y-1">
                        {campaign.preview.features.map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="text-center space-y-4">
          <div className="text-sm text-amber-600">
            Oder erstelle deine eigene Welt mit dem World Builder
          </div>
          <button
            onClick={() => useGameStore.getState().reset()}
            className="btn-secondary flex items-center gap-2 mx-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            World Builder verwenden
          </button>
        </div>
      </div>
    </div>
  );
}