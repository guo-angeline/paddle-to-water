// Metro config: lets the native app import the pure shared modules from ../web
// (single source of truth for spot data, conditions logic, search, types).
//
// The `@/` alias here MUST mirror web/tsconfig.json ("@/*" -> web root): shared
// modules like web/lib/conditions.ts import "@/lib/types" and
// "@/data/gridpoints.json" internally, so the alias belongs to web. Native's own
// code uses relative imports only.
//
// web/node_modules is blocked so nothing (React above all) ever resolves from
// the web package: shared modules are dependency-free pure TS by contract
// (see CLAUDE.md "Repo layout").
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");
const webRoot = path.join(workspaceRoot, "web");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [...(config.watchFolders ?? []), webRoot];

config.resolver.blockList = [
  /\/web\/node_modules\/.*/,
  /\/web\/\.next\/.*/,
];

// Force every bare-module import to resolve from native/node_modules only.
config.resolver.nodeModulesPaths = [path.join(projectRoot, "node_modules")];

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("@/")) {
    const target = path.join(webRoot, moduleName.slice(2));
    return context.resolveRequest(context, target, platform);
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
