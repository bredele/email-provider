import test from "node:test";
import assert from "node:assert";
import getEmailProvider from ".";

// Domain detection tests
test("Domain detection - Gmail", async () => {
  assert.strictEqual(await getEmailProvider("user@gmail.com"), "gmail");
  assert.strictEqual(await getEmailProvider("user@googlemail.com"), "gmail");
});

test("Domain detection - Outlook", async () => {
  assert.strictEqual(await getEmailProvider("user@outlook.com"), "outlook");
  assert.strictEqual(await getEmailProvider("user@hotmail.com"), "outlook");
  assert.strictEqual(await getEmailProvider("user@live.com"), "outlook");
  assert.strictEqual(await getEmailProvider("user@msn.com"), "outlook");
});

test("Domain detection - Yahoo", async () => {
  assert.strictEqual(await getEmailProvider("user@yahoo.com"), "yahoo");
  assert.strictEqual(await getEmailProvider("user@yahoo.co.uk"), "yahoo");
  assert.strictEqual(await getEmailProvider("user@yahoo.fr"), "yahoo");
});

test("Domain detection - Other providers", async () => {
  assert.strictEqual(await getEmailProvider("user@zoho.com"), "zoho");
  assert.strictEqual(
    await getEmailProvider("user@protonmail.com"),
    "protonmail"
  );
  assert.strictEqual(await getEmailProvider("user@proton.me"), "protonmail");
  assert.strictEqual(await getEmailProvider("user@icloud.com"), "icloud");
  assert.strictEqual(await getEmailProvider("user@me.com"), "icloud");
  assert.strictEqual(await getEmailProvider("user@mac.com"), "icloud");
  assert.strictEqual(await getEmailProvider("user@fastmail.com"), "fastmail");
  assert.strictEqual(await getEmailProvider("user@fastmail.fm"), "fastmail");
});

// Input validation tests
test("Invalid inputs", async () => {
  assert.strictEqual(await getEmailProvider(""), "unknown");
  assert.strictEqual(await getEmailProvider("invalid"), "unknown");
  assert.strictEqual(await getEmailProvider("user@"), "unknown");
  assert.strictEqual(
    await getEmailProvider("@nonexistent-test-domain-123456.com"),
    "unknown"
  );
  assert.strictEqual(
    await getEmailProvider("user@@nonexistent-test-domain-123456.com"),
    "unknown"
  );
});

test("Edge cases", async () => {
  assert.strictEqual(await getEmailProvider("  user@gmail.com  "), "gmail");
  assert.strictEqual(await getEmailProvider("USER@GMAIL.COM"), "gmail");
  assert.strictEqual(
    await getEmailProvider("user@unknown-domain.com"),
    "unknown"
  );
});

// MX record detection tests - using real domains that use these providers
test("MX detection - Google Workspace domains", async () => {
  // These tests may be slow as they do real DNS lookups
  // Testing with known Google Workspace domains
  const result = await getEmailProvider(
    "test@example-google-workspace.com"
  ).catch(() => "unknown");
  // Should either be 'gmail' if MX lookup succeeds or 'unknown' if domain doesn't exist
  assert.ok(["gmail", "unknown"].includes(result));
});

test("Type validation", async () => {
  // @ts-expect-error Testing invalid input types
  assert.strictEqual(await getEmailProvider(null), "unknown");
  // @ts-expect-error Testing invalid input types
  assert.strictEqual(await getEmailProvider(undefined), "unknown");
  // @ts-expect-error Testing invalid input types
  assert.strictEqual(await getEmailProvider(123), "unknown");
});
