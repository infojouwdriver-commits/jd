"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import SiteAIAgent from "@/components/ai/SiteAIAgent";

export default function GlobalClientEffects() {
  const pathname = usePathname();

  const isDriverPortal =
    pathname === "/driver-login" ||
    (pathname?.startsWith("/driver/") ?? false);

  useEffect(() => {
    localStorage.removeItem("active_trip");
    localStorage.removeItem("offline_trips");
    const documentElement = document.documentElement;
    const body = document.body;

    documentElement.style.overflowY = "auto";
    documentElement.style.overflowX = "hidden";
    documentElement.style.touchAction = "manipulation";
    body.style.overflowY = "auto";
    body.style.overflowX = "hidden";
    body.style.touchAction = "manipulation";
    body.style.minHeight = "100%";

    let serviceWorkerMessageHandler: ((event: MessageEvent) => void) | null =
      null;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          void 0;
        })
        .catch((error) => {
          void 0;
        });

      serviceWorkerMessageHandler = (event: MessageEvent) => {
        if (event.data?.type !== "SYNC_OFFLINE_TRIPS") {
          return;
        }

        try {
          const offlineTrips = JSON.parse(
            sessionStorage.getItem("offline_trips") || "[]"
          );

          if (Array.isArray(offlineTrips) && offlineTrips.length > 0) {
            void 0;
          }
        } catch (error) {
          void 0;
        }
      };

      navigator.serviceWorker.addEventListener(
        "message",
        serviceWorkerMessageHandler
      );
    }

    return () => {
      if (
        serviceWorkerMessageHandler &&
        "serviceWorker" in navigator
      ) {
        navigator.serviceWorker.removeEventListener(
          "message",
          serviceWorkerMessageHandler
        );
      }
    };
  }, []);

  if (isDriverPortal) {
    return null;
  }

  return null;
}
