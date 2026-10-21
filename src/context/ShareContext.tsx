import React, { createContext, useContext, useState, useCallback } from 'react';
import { ShareModal, ShareData } from '../components/ShareModal';

interface ShareContextValue {
  share: (data: ShareData) => void;
  closeShare: () => void;
}

const ShareContext = createContext<ShareContextValue | null>(null);

export function ShareProvider({ children }: { children: React.ReactNode }) {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const share = useCallback((data: ShareData) => {
    setShareData(data);
    setIsOpen(true);
  }, []);

  const closeShare = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ShareContext.Provider value={{ share, closeShare }}>
      {children}
      <ShareModal
        isOpen={isOpen}
        onClose={closeShare}
        data={shareData}
      />
    </ShareContext.Provider>
  );
}

export function useShare() {
  const context = useContext(ShareContext);
  if (!context) {
    throw new Error('useShare must be used within a ShareProvider');
  }
  return context;
}
