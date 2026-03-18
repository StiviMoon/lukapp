"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api/client";

type Permission = "default" | "granted" | "denied";

export function usePushNotifications() {
  const [permission, setPermission] = useState<Permission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [subscribed, setSubscribed] = useState(false);

  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!supported) return false;

    // Request permission
    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== "granted") return false;

    try {
      // Get VAPID public key
      const keyRes = await apiClient.get<{ key: string | null }>("/push/vapid-key");
      if (!keyRes.success || !keyRes.data?.key) return false;

      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyRes.data.key) as unknown as ArrayBuffer,
      });

      const json = sub.toJSON();
      await apiClient.post("/push/subscribe", {
        endpoint: sub.endpoint,
        p256dh: (json.keys as Record<string, string>)?.p256dh,
        auth: (json.keys as Record<string, string>)?.auth,
      });

      setSubscribed(true);
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      return false;
    }
  }, [supported]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await apiClient.delete(`/push/subscribe`);
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
    }
  }, [supported]);

  return { supported, permission, subscribed, subscribe, unsubscribe };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
