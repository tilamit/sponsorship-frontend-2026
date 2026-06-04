// deploy-to-puter.mjs
// Route 2: programmatic Angular -> Puter static-site deploy.
// Uploads the built browser/ folder into Puter's filesystem, then points
// the sponsorship-app subdomain at it. Auth via PUTER_AUTH_TOKEN env var.

import { init } from "@heyputer/puter.js/src/init.cjs";
import fs from "node:fs";
import path from "node:path";

const TOKEN = process.env.PUTER_AUTH_TOKEN;
const SUBDOMAIN = "sponsorship-app";
const LOCAL_DIR = process.argv[2];

if (!TOKEN) {
  console.error("❌ PUTER_AUTH_TOKEN is not set");
  process.exit(1);
}
if (!LOCAL_DIR || !fs.existsSync(LOCAL_DIR)) {
  console.error(`❌ Local build dir not found: ${LOCAL_DIR}`);
  process.exit(1);
}

const puter = init(TOKEN);

// A fresh remote directory in your Puter filesystem to hold this build
const remoteDir = `sponsorship-deploy/${Date.now()}`;

async function uploadDir(localPath, remotePath) {
  await puter.fs.mkdir(remotePath, { createMissingParents: true });
  for (const entry of fs.readdirSync(localPath, { withFileTypes: true })) {
    const lp = path.join(localPath, entry.name);
    const rp = `${remotePath}/${entry.name}`;
    if (entry.isDirectory()) {
      await uploadDir(lp, rp);
    } else {
      const data = fs.readFileSync(lp);
      // Puter's fs.write expects web-style file data; wrap the Buffer in a Blob.
      await puter.fs.write(rp, new Blob([data]), {
        overwrite: true,
        createMissingParents: true,
      });
      console.log(`  uploaded ${rp}`);
    }
  }
}

async function main() {
  console.log(`✅ Uploading ${LOCAL_DIR} -> Puter:${remoteDir}`);
  await uploadDir(LOCAL_DIR, remoteDir);

  console.log(`✅ Pointing ${SUBDOMAIN}.puter.site at ${remoteDir}`);
  try {
    // Subdomain already exists, so update it to serve the new directory
    await puter.hosting.update(SUBDOMAIN, remoteDir);
    console.log("✅ Updated existing site");
  } catch (e) {
    console.log(`update() failed (${e?.message || e}); trying create()...`);
    await puter.hosting.create(SUBDOMAIN, remoteDir);
    console.log("✅ Created site");
  }

  console.log(`🎉 Live at https://${SUBDOMAIN}.puter.site`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Deploy failed:", err);
  process.exit(1);
});
