/* eslint-disable no-console */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { buildOpenApiDocument } from '../src/openapi/openapi.document';

/**
 * Writes the OpenAPI 3 spec to `openapi.json`. Consumed by SDK generators
 * (orval, openapi-generator) and by API documentation tooling in CI.
 */
const url = process.env.API_URL ?? 'http://localhost:4000';
const outPath = resolve(process.cwd(), 'openapi.json');
writeFileSync(outPath, `${JSON.stringify(buildOpenApiDocument(url), null, 2)}\n`);
console.log(`Wrote OpenAPI spec → ${outPath}`);
