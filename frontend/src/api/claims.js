import client from "./client";

export const fileClaim = (payload) => client.post("/claims", payload).then((r) => r.data.claim);
export const myClaims = () => client.get("/claims/mine").then((r) => r.data.claims);
export const groupClaims = (groupId) => client.get(`/claims/group/${groupId}`).then((r) => r.data.claims);
export const reviewClaim = (id, status) => client.put(`/claims/${id}`, { status }).then((r) => r.data.claim);
export const withdrawClaim = (id) => client.delete(`/claims/${id}`).then((r) => r.data);
