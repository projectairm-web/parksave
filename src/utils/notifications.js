function isNative() {
  return typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.();
}

export async function scheduleExpiryNotification(spot) {
  if (!spot.expiresAt || !isNative()) return;
  const fireAt = new Date(spot.expiresAt - 10 * 60 * 1000);
  if (fireAt <= new Date()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== "granted") return;
    await LocalNotifications.schedule({
      notifications: [{
        id:    spot.notifId,
        title: "Parking timer expiring",
        body:  `${spot.name} expires in 10 minutes`,
        schedule: { at: fireAt },
      }],
    });
  } catch {}
}

export async function cancelExpiryNotification(notifId) {
  if (notifId == null || !isNative()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
  } catch {}
}
