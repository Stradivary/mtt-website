/**
 * Cache Management Utilities for MTT Dashboard
 * 
 * These utilities help clear various types of caches that might
 * prevent the dashboard from showing updated data.
 */

export const clearAllCaches = async (): Promise<void> => {
  console.log('🧹 Starting comprehensive cache clearing...');
  
  try {
    // 1. Clear Service Worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log(`📦 Found ${cacheNames.length} cache(s):`, cacheNames);
      
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        console.log(`✅ Deleted cache: ${cacheName}`);
      }
    }
    
    // 2. Clear Local Storage (dashboard-related only)
    const localStorageKeys = Object.keys(localStorage);
    const dashboardKeys = localStorageKeys.filter(key => 
      key.includes('dashboard') || 
      key.includes('qurban') || 
      key.includes('supabase') ||
      key.includes('mtt')
    );
    
    console.log(`🗃️ Clearing ${dashboardKeys.length} localStorage item(s):`, dashboardKeys);
    dashboardKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`✅ Cleared localStorage: ${key}`);
    });
    
    // 3. Clear Session Storage (dashboard-related only)
    const sessionStorageKeys = Object.keys(sessionStorage);
    const dashboardSessionKeys = sessionStorageKeys.filter(key => 
      key.includes('dashboard') || 
      key.includes('qurban') || 
      key.includes('supabase') ||
      key.includes('mtt')
    );
    
    console.log(`📝 Clearing ${dashboardSessionKeys.length} sessionStorage item(s):`, dashboardSessionKeys);
    dashboardSessionKeys.forEach(key => {
      sessionStorage.removeItem(key);
      console.log(`✅ Cleared sessionStorage: ${key}`);
    });
    
    // 4. Clear browser's HTTP cache (if possible)
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('✅ Unregistered service worker');
      }
    }
    
    console.log('✅ Cache clearing completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cache clearing:', error);
    throw error;
  }
};

export const clearBrowserCache = (): void => {
  console.log('🔄 Attempting to clear browser cache...');
  
  // Method 1: Try to reload with cache bypass
  if (window.location) {
    window.location.reload();
  }
};

export const forceBrowserRefresh = (): void => {
  console.log('💪 Forcing hard browser refresh...');
  
  // Add cache-busting parameter to URL
  const url = new URL(window.location.href);
  url.searchParams.set('cacheBust', Date.now().toString());
  window.location.href = url.toString();
};

export const getCacheStatus = (): {
  localStorage: number;
  sessionStorage: number;
  cacheAPI: Promise<number>;
  lastCleared: string | null;
} => {
  const localStorageCount = Object.keys(localStorage).filter(key => 
    key.includes('dashboard') || key.includes('qurban')
  ).length;
  
  const sessionStorageCount = Object.keys(sessionStorage).filter(key => 
    key.includes('dashboard') || key.includes('qurban')
  ).length;
  
  const cacheAPICount = 'caches' in window 
    ? caches.keys().then(names => names.length)
    : Promise.resolve(0);
  
  const lastCleared = localStorage.getItem('lastCacheCleared');
  
  return {
    localStorage: localStorageCount,
    sessionStorage: sessionStorageCount,
    cacheAPI: cacheAPICount,
    lastCleared
  };
};

export const markCacheCleared = (): void => {
  localStorage.setItem('lastCacheCleared', new Date().toISOString());
};

// Console helper for users
export const debugDashboard = () => {
  console.log(`
🐛 MTT Dashboard Debug Tools
=============================

Available commands:
- clearAllCaches()     : Clear all dashboard-related caches
- clearBrowserCache()  : Force browser cache clear
- forceBrowserRefresh(): Hard refresh with cache busting
- getCacheStatus()     : Check current cache status

Example usage:
> await clearAllCaches()
> console.log(await getCacheStatus())

Copy and paste these commands in the browser console.
  `);
  
  // Make functions available globally for console use
  (window as any).clearAllCaches = clearAllCaches;
  (window as any).clearBrowserCache = clearBrowserCache;
  (window as any).forceBrowserRefresh = forceBrowserRefresh;
  (window as any).getCacheStatus = getCacheStatus;
  (window as any).debugDashboard = debugDashboard;
};

// Automatically expose debug tools in development
if (import.meta.env.DEV) {
  debugDashboard();
  console.log('🐛 Debug tools loaded! Type debugDashboard() for help.');
} 