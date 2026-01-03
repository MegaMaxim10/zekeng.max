import fs from "fs";
import path from "path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { globSync } from "glob";

const SCHEMA_PATH = "./schemas/page.schema.json";
const CONTENT_GLOB = "./content/**/*.json";

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf-8"));

const ajv = new Ajv2020({
  allErrors: true,
  strict: true
});

addFormats(ajv);

const validate = ajv.compile(schema);

const files = globSync(CONTENT_GLOB);

let hasErrors = false;

files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));
  const valid = validate(data);

  if (!valid) {
    hasErrors = true;
    console.error(`❌ Validation failed: ${file}`);
    console.error(validate.errors);
  } else {
    console.log(`✅ Valid: ${file}`);
  }
});

if (hasErrors) {
  console.error("\n❌ Content validation failed.");
  process.exit(1);
} else {
  console.log("\n✅ All content files are valid.");
}
