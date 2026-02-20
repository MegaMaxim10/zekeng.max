/**
 * Block Pre-processors
 * Handles async preprocessing of blocks that need data fetching or external API calls
 * This keeps the build process generic while allowing blocks to define their own async needs
 */

import { fetchOrcidData } from "./utils/orcid-fetch.js";

/**
 * Map of block types to their async preprocessor functions
 * Each preprocessor should update the block.data in place
 */
const blockProcessors = {
  orcid: async (block) => {
    if (!block.data?.orcidId) {
      return;
    }

    try {
      console.log(`  OK Fetching ORCID data for ${block.data.orcidId}...`);
      const orcidData = await fetchOrcidData(
        block.data.orcidId,
        block.data.sections || [],
        block.data.filters || {}
      );
      block.data.cachedData = orcidData;
    } catch (error) {
      console.warn(`  WARN Failed to fetch ORCID data for ${block.data.orcidId}: ${error.message}`);
      block.data.cachedData = { sections: {} };
    }
  }
};

/**
 * Preprocess a single block if a processor exists for its type
 */
async function preprocessBlock(block) {
  const processor = blockProcessors[block.type];
  if (processor && typeof processor === "function") {
    await processor(block);
  }
}

/**
 * Preprocess all blocks in a page before rendering
 */
async function preprocessPage(page) {
  if (!page.json.body || !Array.isArray(page.json.body)) {
    return;
  }

  for (const block of page.json.body) {
    await preprocessBlock(block);
  }
}

export { preprocessPage, preprocessBlock, blockProcessors };

