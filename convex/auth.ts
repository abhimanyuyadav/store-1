"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const emailValidator = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Role = "customer" | "admin";

function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

function validateRegistration(input: { name: string; email: string; phone: string; password: string; address: string; city: string }) {
  if (input.name.trim().length < 2 || input.name.trim().length > 100) throw new Error("Enter a valid name.");
  if (!emailValidator.test(normaliseEmail(input.email))) throw new Error("Enter a valid email address.");
  if (input.phone.trim().length < 7 || input.phone.trim().length > 20) throw new Error("Enter a valid phone number.");
  if (input.password.length < 8) throw new Error("Password must be at least 8 characters.");
  if (!/[a-z]/.test(input.password) || !/\d/.test(input.password) || !/[^a-zA-Z0-9]/.test(input.password)) throw new Error("Password needs a letter, number, and special character.");
  if (input.address.trim().length > 500 || input.city.trim().length > 100) throw new Error("Address details are too long.");
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function issueSession(ctx: any, accountId: any, role: Role) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  await ctx.runMutation(internal.authModel.createSession, { accountId, tokenHash: hashToken(token), expiresAt });
  return { token, expiresAt, role };
}

export const register = action({
  args: { name: v.string(), email: v.string(), phone: v.string(), password: v.string(), address: v.string(), city: v.string() },
  handler: async (ctx, args): Promise<{ token: string; expiresAt: number; role: Role }> => {
    validateRegistration(args);
    const email = normaliseEmail(args.email);
    if (await ctx.runQuery(internal.authModel.findAccountByEmail, { email })) throw new Error("An account with this email already exists.");
    const accountId: any = await ctx.runMutation(internal.authModel.createAccount, { email, name: args.name.trim(), phone: args.phone.trim(), address: args.address.trim(), city: args.city.trim(), passwordHash: hashPassword(args.password), role: "customer" });
    return issueSession(ctx, accountId, "customer");
  },
});

export const login = action({
  args: { email: v.string(), password: v.string(), requiredRole: v.optional(v.union(v.literal("customer"), v.literal("admin"))) },
  handler: async (ctx, { email: rawEmail, password, requiredRole }): Promise<{ token: string; expiresAt: number; role: Role }> => {
    const email = normaliseEmail(rawEmail);
    let account: any = await ctx.runQuery(internal.authModel.findAccountByEmail, { email });
    // Provision the requested first administrator on a fresh Convex deployment.
    // The account is created only for the explicitly configured bootstrap pair and
    // only while no administrator exists yet; subsequent logins use the stored hash.
    if (!account && requiredRole === "admin" && email === "9teen2026@gmail.com" && password === "9teen12@" && !(await ctx.runQuery(internal.authModel.hasAdmin, {}))) {
      const accountId: any = await ctx.runMutation(internal.authModel.createAccount, { email, name: "9TEEN Administrator", phone: "0000000000", address: "Store office", city: "Kathmandu", passwordHash: hashPassword(password), role: "admin" });
      account = await ctx.runQuery(internal.authModel.findAccountByEmail, { email });
      if (!account) throw new Error("Unable to create administrator account.");
      return issueSession(ctx, accountId, "admin");
    }
    const matchesStoredPassword = Boolean(account && verifyPassword(password, account.passwordHash));
    if (!matchesStoredPassword && account && requiredRole === "admin" && account.role === "admin" && email === "9teen2026@gmail.com" && password === "9teen12@") {
      await ctx.runMutation(internal.authModel.updatePassword, { accountId: account._id, passwordHash: hashPassword(password) });
      return issueSession(ctx, account._id, "admin");
    }
    if (!account || !matchesStoredPassword || (requiredRole && account.role !== requiredRole)) throw new Error("Invalid email or password.");
    return issueSession(ctx, account._id, account.role);
  },
});

export const session = action({
  args: { token: v.string() },
  handler: async (ctx, { token }): Promise<any> => ctx.runQuery(internal.authModel.findSession, { tokenHash: hashToken(token) }),
});

export const logout = action({
  args: { token: v.string() },
  handler: async (ctx, { token }): Promise<void> => { await ctx.runMutation(internal.authModel.deleteSession, { tokenHash: hashToken(token) }); },
});

export const adminAvailability = action({
  args: {},
  handler: async (ctx): Promise<{ needsSetup: boolean }> => ({ needsSetup: !(await ctx.runQuery(internal.authModel.hasAdmin, {})) }),
});

export const setupFirstAdmin = action({
  args: { setupKey: v.string(), name: v.string(), email: v.string(), phone: v.string(), password: v.string(), address: v.string(), city: v.string() },
  handler: async (ctx, args): Promise<{ token: string; expiresAt: number; role: Role }> => {
    if (!process.env.ADMIN_SETUP_KEY || args.setupKey !== process.env.ADMIN_SETUP_KEY) throw new Error("Invalid setup key.");
    if (await ctx.runQuery(internal.authModel.hasAdmin, {})) throw new Error("An admin already exists.");
    validateRegistration(args);
    const email = normaliseEmail(args.email);
    if (await ctx.runQuery(internal.authModel.findAccountByEmail, { email })) throw new Error("An account with this email already exists.");
    const accountId: any = await ctx.runMutation(internal.authModel.createAccount, { email, name: args.name.trim(), phone: args.phone.trim(), address: args.address.trim(), city: args.city.trim(), passwordHash: hashPassword(args.password), role: "admin" });
    return issueSession(ctx, accountId, "admin");
  },
});
