"use client";

import { useEffect, useState } from "react";

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    setIsClient(true);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          setRegistration(reg);

          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    setUpdateAvailable(true);
                  }
                }
              };
            }
          };
        })
        .catch(() => {
          // Silent fail in production
        });

      // Check for updates on focus
      const checkForUpdates = () => {
        if (registration) {
          registration.update();
        }
      };

      window.addEventListener("focus", checkForUpdates);
      return () => window.removeEventListener("focus", checkForUpdates);
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  };

  return (
    <>
      {children}
      {isClient && updateAvailable && (
        <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-900 shadow-lg rounded-lg p-4 border border-gray-200 dark:border-gray-700 animate-fade-in">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            🎉 Versi baru tersedia!
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors"
            >
              Update Sekarang
            </button>
            <button
              onClick={() => setUpdateAvailable(false)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Nanti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
