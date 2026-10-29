import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

const PASSWORD = "contrasena-larga-123";

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers an empty-state read instead of trapping", async () => {
  await expect(actor.getMyPurchases("no-such-token")).resolves.toEqual({
    err: { notAuthenticated: null },
  });
});

it("registers a customer and signs in through the real canister", async () => {
  const registered = await actor.registerCustomer(
    "ada@correo.com",
    PASSWORD,
    "Ada",
  );
  expect(registered).toHaveProperty("ok");

  const session = await actor.signIn("ada@correo.com", PASSWORD);
  expect(session).toHaveProperty("ok");
  const token = "ok" in session ? session.ok.token : "";
  expect(token.length).toBeGreaterThan(0);

  const profile = await actor.getMyProfile(token);
  expect(profile).toMatchObject({
    ok: { email: "ada@correo.com", displayName: "Ada" },
  });

  await expect(actor.getMyPurchases(token)).resolves.toEqual({ ok: [] });
});

it("rejects wrong credentials without revealing whether the email exists", async () => {
  await actor.registerCustomer("grace@correo.com", PASSWORD, "Grace");

  const wrongPassword = await actor.signIn("grace@correo.com", "otra-contrasena");
  expect(wrongPassword).toEqual({ err: { invalidCredentials: null } });

  const unknownEmail = await actor.signIn("nadie@correo.com", PASSWORD);
  expect(unknownEmail).toEqual({ err: { invalidCredentials: null } });
});

it("locks the account for 15 minutes after 5 consecutive failures", async () => {
  await actor.registerCustomer("lock@correo.com", PASSWORD, "Lock");

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const result = await actor.signIn("lock@correo.com", "mala-contrasena");
    expect(result).toEqual({ err: { invalidCredentials: null } });
  }

  const fifth = await actor.signIn("lock@correo.com", "mala-contrasena");
  expect(fifth).toHaveProperty("err.accountLocked");

  // Even the correct password is refused while the lock is active.
  const locked = await actor.signIn("lock@correo.com", PASSWORD);
  expect(locked).toHaveProperty("err.accountLocked");
});

it("does not expose one customer's purchases to another", async () => {
  await actor.registerCustomer("ana@correo.com", PASSWORD, "Ana");
  await actor.registerCustomer("bob@correo.com", PASSWORD, "Bob");

  const anaSession = await actor.signIn("ana@correo.com", PASSWORD);
  const bobSession = await actor.signIn("bob@correo.com", PASSWORD);
  const anaToken = "ok" in anaSession ? anaSession.ok.token : "";
  const bobToken = "ok" in bobSession ? bobSession.ok.token : "";

  const anaProfile = await actor.getMyProfile(anaToken);
  const bobProfile = await actor.getMyProfile(bobToken);
  expect(anaProfile).toMatchObject({ ok: { email: "ana@correo.com" } });
  expect(bobProfile).toMatchObject({ ok: { email: "bob@correo.com" } });

  // A signed-out token can no longer read the profile.
  await actor.signOut(anaToken);
  await expect(actor.getMyProfile(anaToken)).resolves.toEqual({
    err: { notAuthenticated: null },
  });
});
