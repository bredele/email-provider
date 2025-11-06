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
  // Note: @domain.com extracts domain and triggers DNS lookup which throws ENOTFOUND
  // This case is now covered in ENOTFOUND error tests
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

test("ENOTFOUND error is thrown for non-existent domain", async () => {
  await assert.rejects(
    async () => {
      await getEmailProvider(
        "test@this-domain-absolutely-does-not-exist-12345.xyz"
      );
    },
    (error: any) => {
      assert.strictEqual(error.code, "ENOTFOUND");
      return true;
    }
  );
});
