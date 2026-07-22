import client from "./client";

export const listNotifications = () => client.get("/notifications").then((r) => r.data.notifications);
export const getPreferences = () => client.get("/notifications/preferences").then((r) => r.data);
export const updatePreferences = (payload) =>
  client.put("/notifications/preferences", payload).then((r) => r.data);
