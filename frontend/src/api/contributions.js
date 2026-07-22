import client from "./client";

export const createContribution = (payload) => client.post("/contributions", payload).then((r) => r.data);
export const myContributions = () => client.get("/contributions/mine").then((r) => r.data.contributions);
export const groupContributions = (groupId) =>
  client.get(`/contributions/group/${groupId}`).then((r) => r.data.contributions);
export const updateContribution = (id, payload) =>
  client.put(`/contributions/${id}`, payload).then((r) => r.data.contribution);
export const deleteContribution = (id) => client.delete(`/contributions/${id}`).then((r) => r.data);
export const checkContributionStatus = (id) => client.get(`/contributions/${id}/status`).then((r) => r.data);
