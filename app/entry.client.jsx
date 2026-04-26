import React, { useState } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { CacheProvider } from '@emotion/react';
import { HydratedRouter } from 'react-router/dom';

import { ClientStyleContext } from './context';
import createEmotionCache from './createEmotionCache';

function ClientCacheProvider({ children }) {
  const [cache, setCache] = useState(createEmotionCache());

  function reset() {
    setCache(createEmotionCache());
  }
  
  return (
    <ClientStyleContext.Provider value={{ reset }}>
      <CacheProvider value={cache}>{children}</CacheProvider>
    </ClientStyleContext.Provider>
  );
}

hydrateRoot(
  document,
  <ClientCacheProvider>
    <HydratedRouter />
  </ClientCacheProvider>
);
