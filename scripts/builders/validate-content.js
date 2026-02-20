import * as fs from 'node:fs';
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { globSync } from "glob";
import { readPortfolioConfig } from "./portfolio-config.js";
import { resolveContentConfigReferences } from "./content-resolver.js";

const SCHEMA_PATH = "./schemas/page.schema.json";
const CONTENT_GLOB = "./src/content/**/*.json";

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf-8"));

const ajv = new Ajv2020({
  allErrors: true,
  strict: true
});

addFormats(ajv);

const validate = ajv.compile(schema);

const files = globSync(CONTENT_GLOB);
const portfolioConfig = readPortfolioConfig();

let hasErrors = false;

files.forEach(file => {
  const data = resolveContentConfigReferences(
    JSON.parse(fs.readFileSync(file, "utf-8")),
    portfolioConfig
  );
  const valid = validate(data);

  if (valid) {
    console.log(`Valid: ${file}`);
  } else {
    hasErrors = true;
    console.error(`Validation failed: ${file}`);
    console.error(validate.errors);
  }
});

if (hasErrors) {
  console.error("\nContent validation failed.");
  process.exit(1);
} else {
  console.log("\nAll content files are valid.");
}
