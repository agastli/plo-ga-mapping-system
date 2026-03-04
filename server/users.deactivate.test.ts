import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(userId = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "password",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("users.toggleActive", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deactivates a user account when isActive=false is passed", async () => {
    const toggleSpy = vi.spyOn(db, "toggleUserActive").mockResolvedValue(undefined);
    vi.spyOn(db, "logAudit").mockResolvedValue(undefined as never);

    const ctx = createAdminContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.users.toggleActive({ userId: 2, isActive: false });

    expect(result).toEqual({ success: true });
    expect(toggleSpy).toHaveBeenCalledWith(2, false);
  });

  it("activates a user account when isActive=true is passed", async () => {
    const toggleSpy = vi.spyOn(db, "toggleUserActive").mockResolvedValue(undefined);
    vi.spyOn(db, "logAudit").mockResolvedValue(undefined as never);

    const ctx = createAdminContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.users.toggleActive({ userId: 3, isActive: true });

    expect(result).toEqual({ success: true });
    expect(toggleSpy).toHaveBeenCalledWith(3, true);
  });

  it("throws FORBIDDEN when admin tries to deactivate their own account", async () => {
    vi.spyOn(db, "toggleUserActive").mockResolvedValue(undefined);
    vi.spyOn(db, "logAudit").mockResolvedValue(undefined as never);

    const ctx = createAdminContext(1); // admin id = 1
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.users.toggleActive({ userId: 1, isActive: false }) // same as admin id
    ).rejects.toThrow("You cannot deactivate your own account.");
  });

  it("throws UNAUTHORIZED when called by non-admin user", async () => {
    const user: AuthenticatedUser = {
      id: 5,
      openId: "viewer-user",
      email: "viewer@example.com",
      name: "Viewer User",
      loginMethod: "password",
      role: "viewer",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const ctx: TrpcContext = {
      user,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.users.toggleActive({ userId: 2, isActive: false })
    ).rejects.toThrow();
  });
});
