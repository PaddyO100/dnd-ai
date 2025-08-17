'use client';

import OnboardingWizard from '@/app/components/OnboardingWizard';
import GameView from '@/app/components/GameView';
import CampaignSelection from '@/app/components/CampaignSelection';
import { useGameStore } from '@/lib/state/gameStore';

export default function Page() {
  const step = useGameStore((s) => s.step);
  
  switch (step) {
    case 'onboarding':
      return <OnboardingWizard />;
    case 'campaignSelection':
      return <CampaignSelection />;
    case 'inGame':
      return <GameView />;
    default:
      return <OnboardingWizard />;
  }
}
