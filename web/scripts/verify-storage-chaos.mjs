#!/usr/bin/env node
// Runtime regression check for browsers where localStorage exists but throws.
// Plain node + playwright. Usage: node scripts/verify-storage-chaos.mjs [url]

import { chromium } from "playwright";

const baseUrl = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const viewport = { width: 1280, height: 800 };
const results = [];

function record(check, ok, detail) {
  results.push({ check, ok, detail });
}

async function installStorageChaos(context) {
  await context.addInitScript(() => {
    const fail = (method) => {
      throw new Error(`Storage.${method} blocked by chaos verifier`);
    };
    for (const method of ["getItem", "setItem", "removeItem", "clear", "key"]) {
      const original = Storage.prototype[method];
      Object.defineProperty(Storage.prototype, method, {
        configurable: true,
        value(...args) {
          if (this === window.localStorage) fail(method);
          return Reflect.apply(original, this, args);
        },
      });
    }
  });
}

async function selfTestErrorCollector(page, pageErrors) {
  const sentinel = "storage-chaos-collector-self-test";
  await page.evaluate((message) => {
    queueMicrotask(() => {
      throw new Error(message);
    });
  }, sentinel);
  await page.waitForFunction(() => true);
  const found = pageErrors.some((error) => error.includes(sentinel));
  record("page-error collector self-test", found, found ? undefined : "sentinel error was not collected");
  pageErrors.length = 0;
}

async function expectVisible(page, selector, check) {
  try {
    await page.locator(selector).first().waitFor({ state: "visible", timeout: 15000 });
    record(check, true);
  } catch (error) {
    record(check, false, error.message);
  }
}

async function verifyRoute(page, pageErrors, route) {
  const prefix = `[${route}]`;
  pageErrors.length = 0;
  await page.goto(`${baseUrl}${route}`, { waitUntil: "load" });

  if (route === "/") {
    await expectVisible(page, "header", `${prefix} app rendered`);
    await expectVisible(page, ".leaflet-container", `${prefix} map rendered`);
    await expectVisible(page, 'button[aria-label="Watch this spot"]', `${prefix} list rendered`);
  } else {
    await expectVisible(page, "#spot-sheet-title", `${prefix} spot rendered`);
    await expectVisible(page, 'section[aria-label="Live water conditions"]', `${prefix} conditions rendered`);
  }

  const paddleNowCount = await page.getByText("Want to paddle today?", { exact: true }).count();
  record(
    `${prefix} PaddleNow absent`,
    paddleNowCount === 0,
    paddleNowCount === 0 ? undefined : `found ${paddleNowCount}`,
  );

  await page.waitForTimeout(250);
  record(
    `${prefix} zero page errors`,
    pageErrors.length === 0,
    pageErrors.length === 0 ? undefined : pageErrors.join(" | "),
  );
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport });
  const pageErrors = [];
  try {
    await installStorageChaos(context);
    const page = await context.newPage();
    page.on("pageerror", (error) => pageErrors.push(error.stack || error.message));
    await selfTestErrorCollector(page, pageErrors);
    await verifyRoute(page, pageErrors, "/");
    await verifyRoute(page, pageErrors, "/spot/1");
  } finally {
    await context.close();
    await browser.close();
  }

  let allPassed = true;
  for (const { check, ok, detail } of results) {
    if (!ok) allPassed = false;
    console.log(`${ok ? "PASS" : "FAIL"}  ${check}${detail ? `: ${detail}` : ""}`);
  }

  console.log(
    allPassed
      ? `\nAll storage chaos checks passed against ${baseUrl}.`
      : `\nOne or more storage chaos checks failed against ${baseUrl}.`,
  );
  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error("verify-storage-chaos.mjs crashed:", error);
  process.exit(1);
});
