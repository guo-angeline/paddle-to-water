import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

type StorageViolation = {
  file: string;
  line: number;
  column: number;
  access: string;
};

function isStorageObjectReference(node: ts.Node): boolean {
  if (ts.isIdentifier(node) && node.text === "localStorage") {
    return !(
      ts.isPropertyAccessExpression(node.parent) &&
      node.parent.name === node
    );
  }

  if (ts.isPropertyAccessExpression(node)) {
    return (
      ts.isIdentifier(node.expression) &&
      (node.expression.text === "window" || node.expression.text === "globalThis") &&
      node.name.text === "localStorage"
    );
  }

  return (
    ts.isElementAccessExpression(node) &&
    ts.isIdentifier(node.expression) &&
    (node.expression.text === "window" || node.expression.text === "globalThis") &&
    ts.isStringLiteral(node.argumentExpression) &&
    node.argumentExpression.text === "localStorage"
  );
}

function isInsideCaughtTryBlock(node: ts.Node): boolean {
  let child = node;
  for (let parent = node.parent; parent; child = parent, parent = parent.parent) {
    if (ts.isFunctionLike(parent)) return false;
    if (
      ts.isTryStatement(parent) &&
      parent.catchClause !== undefined &&
      child === parent.tryBlock
    ) {
      return true;
    }
  }
  return false;
}

function storageViolations(source: string, file = "fixture.ts"): StorageViolation[] {
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const violations: StorageViolation[] = [];

  function visit(node: ts.Node) {
    if (isStorageObjectReference(node) && !isInsideCaughtTryBlock(node)) {
      const location = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      violations.push({
        file,
        line: location.line + 1,
        column: location.character + 1,
        access: node.getText(sourceFile),
      });
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

function productionTypeScriptFiles(root: string): string[] {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) return productionTypeScriptFiles(target);
    if (!entry.isFile() || !/\.tsx?$/.test(entry.name) || /\.(?:test|spec)\.tsx?$/.test(entry.name)) {
      return [];
    }
    return [target];
  });
}

describe("localStorage resilience guard", () => {
  it("reports unsafe direct access with exact file, line, and column", () => {
    const fixture = [
      "const first = localStorage.getItem('first');",
      "window.localStorage.setItem('second', '2');",
    ].join("\n");

    expect(storageViolations(fixture, "unsafe.ts")).toEqual([
      { file: "unsafe.ts", line: 1, column: 15, access: "localStorage" },
      { file: "unsafe.ts", line: 2, column: 1, access: "window.localStorage" },
    ]);
  });

  it("allows direct access only inside a try block with a catch", () => {
    const fixture = [
      "try {",
      "  localStorage.getItem('safe');",
      "} catch {}",
      "try {",
      "  window.localStorage.clear();",
      "} finally {}",
      "try {",
      "  throw new Error('nope');",
      "} catch {",
      "  localStorage.removeItem('unsafe');",
      "}",
    ].join("\n");

    expect(storageViolations(fixture, "mixed.ts")).toEqual([
      { file: "mixed.ts", line: 5, column: 3, access: "window.localStorage" },
      { file: "mixed.ts", line: 10, column: 3, access: "localStorage" },
    ]);
  });

  it("allows access nested within an outer caught try block", () => {
    const fixture = [
      "try {",
      "  try {",
      "    localStorage.getItem('safe');",
      "  } finally {}",
      "} catch {}",
    ].join("\n");

    expect(storageViolations(fixture, "nested.ts")).toEqual([]);
  });

  it("does not let an outer try protect a deferred callback body", () => {
    const fixture = [
      "try {",
      "  const read = () => localStorage.getItem('later');",
      "} catch {}",
      "read();",
    ].join("\n");

    expect(storageViolations(fixture, "deferred.ts")).toEqual([
      { file: "deferred.ts", line: 2, column: 22, access: "localStorage" },
    ]);
  });

  it("reports computed, global, and destructured storage references", () => {
    const fixture = [
      "localStorage['getItem']('first');",
      "window['localStorage'].getItem('second');",
      "globalThis.localStorage.getItem('third');",
      "const { getItem } = localStorage;",
    ].join("\n");

    expect(storageViolations(fixture, "references.ts")).toEqual([
      { file: "references.ts", line: 1, column: 1, access: "localStorage" },
      { file: "references.ts", line: 2, column: 1, access: "window['localStorage']" },
      { file: "references.ts", line: 3, column: 1, access: "globalThis.localStorage" },
      { file: "references.ts", line: 4, column: 21, access: "localStorage" },
    ]);
  });

  it("finds no unguarded direct access in production TypeScript", () => {
    const webRoot = path.resolve(import.meta.dirname, "..");
    const files = ["app", "components", "lib"].flatMap((directory) =>
      productionTypeScriptFiles(path.join(webRoot, directory)),
    );
    const violations = files.flatMap((file) =>
      storageViolations(fs.readFileSync(file, "utf8"), path.relative(webRoot, file)),
    );

    expect(violations).toEqual([]);
  });

  it("exposes the storage chaos verifier through the package script", () => {
    const webRoot = path.resolve(import.meta.dirname, "..");
    const packageJson = JSON.parse(fs.readFileSync(path.join(webRoot, "package.json"), "utf8"));
    const verifierPath = path.join(webRoot, "scripts", "verify-storage-chaos.mjs");

    expect(packageJson.scripts["verify:storage-chaos"]).toBe(
      "node scripts/verify-storage-chaos.mjs",
    );
    expect(fs.existsSync(verifierPath)).toBe(true);
  });
});
