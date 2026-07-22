import client from "./client";

export const listPublicGroups = () => client.get("/groups").then((r) => r.data.groups);
export const listMyGroups = () => client.get("/groups/mine").then((r) => r.data.groups);
export const createGroup = (payload) => client.post("/groups", payload).then((r) => r.data.group);
export const getGroup = (id) => client.get(`/groups/${id}`).then((r) => r.data.group);
export const getPublicGroupBySlug = (slug) => client.get(`/groups/public/${slug}`).then((r) => r.data.group);
export const updateGroup = (id, payload) => client.put(`/groups/${id}`, payload).then((r) => r.data.group);
export const deleteGroup = (id) => client.delete(`/groups/${id}`).then((r) => r.data);
export const joinGroup = (id) => client.post(`/groups/${id}/join`).then((r) => r.data.membership);
export const listMembers = (id) => client.get(`/groups/${id}/members`).then((r) => r.data.members);
