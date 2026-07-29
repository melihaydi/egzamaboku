import React, { useState } from 'react';
import { useApp } from '../../context/useApp';
import { AppLockScreen } from './AppLockScreen';

export const AppLockGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pinLockEnabled } = useApp();
  // Yalnızca uygulama açılışında (mount anında) PIN aktifse kilitli başlar;
  // oturum sırasında yeni bir PIN oluşturmak mevcut oturumu kilitlemez —
  // kilit bir sonraki açılışta devreye girer.
  const [unlocked, setUnlocked] = useState(() => !pinLockEnabled);

  if (!unlocked) {
    return <AppLockScreen onUnlock={() => setUnlocked(true)} />;
  }

  return <>{children}</>;
};
