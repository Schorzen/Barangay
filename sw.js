// Barangay Talisay service worker (v3: phone notifications)
// It does NOT store any pages or data (resident records must never be cached on the device).
// It only makes the site installable and shows notifications.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});

// Notification sent from the server, even while the app is closed (Web Push)
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    // If the app is open on screen, it already plays its own alert sound, so show this one quietly
    const onScreen = list.some(c => c.visibilityState === "visible" && c.focused);
    return self.registration.showNotification(d.title || "Barangay Talisay", {
      body: d.body || "",
      icon: "icon-192.png",
      badge: "icon-192.png",
      tag: d.tag || "talisay",
      renotify: true,
      requireInteraction: true,
      silent: onScreen,
      vibrate: [300, 100, 300, 100, 300, 100, 300],
      data: d
    });
  }));
});

// Tapping a notification opens the app on the right page
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const tab = (e.notification.data && e.notification.data.tab) || "";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) { if ("focus" in c) { c.postMessage({ type: "alert-open", tab }); return c.focus(); } }
    return self.clients.openWindow(self.registration.scope);
  }));
});
