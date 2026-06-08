import { useState } from 'react';

import { useProfileContext } from '../../../lib/supabase';
import GenreScreen from './GenreScreen';
import NickNameScreen from './NickNameScreen';

type OnboardingStep = 'nickname' | 'genre';

function OnboardingFlow() {
  const { profile } = useProfileContext();
  const [step, setStep] = useState<OnboardingStep>(
    profile?.nickname?.trim() ? 'genre' : 'nickname',
  );

  if (step === 'genre') {
    return <GenreScreen />;
  }

  return (
    <NickNameScreen onNicknameSaved={() => setStep('genre')} />
  );
}

export default OnboardingFlow;
