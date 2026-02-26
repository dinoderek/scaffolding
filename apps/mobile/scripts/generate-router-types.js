#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const appRoot = path.join(projectRoot, 'app');
  const outputDir = path.join(projectRoot, '.expo', 'types');
  const outputFile = path.join(outputDir, 'router.d.ts');

  const requireContextPonyfill = require('expo-router/build/testing-library/require-context-ponyfill').default;
  const { EXPO_ROUTER_CTX_IGNORE } = require('expo-router/_ctx-shared');
  const { getTypedRoutesDeclarationFile } = require('expo-router/build/typed-routes/generate');

  const ctx = requireContextPonyfill(appRoot, true, EXPO_ROUTER_CTX_IGNORE);
  const declaration = getTypedRoutesDeclarationFile(ctx, {});

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, declaration);

  console.log(`[router-types] wrote ${path.relative(projectRoot, outputFile)}`);
}

main();
