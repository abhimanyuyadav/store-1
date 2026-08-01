import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  appData: defineTable({
    key: v.string(),
    value: v.any(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
  accounts: defineTable({
    email: v.string(),
    name: v.string(),
    phone: v.string(),
    address: v.string(),
    city: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("customer"), v.literal("admin")),
    createdAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_role", ["role"]),
  sessions: defineTable({
    tokenHash: v.string(),
    accountId: v.id("accounts"),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_tokenHash", ["tokenHash"])
    .index("by_accountId", ["accountId"]),
});
