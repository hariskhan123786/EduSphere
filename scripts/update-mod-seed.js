import fs from "fs";

let code = fs.readFileSync("desktop/src-tauri/src/db/mod.rs", "utf-8");
const marker = '"Beaconhouse Margalla Campus",';
if (code.includes(marker)) {
  const parts = code.split(marker);
  const before = parts[0];
  const after = parts[1].replace(/"org-pk-1"/g, '"01000000-0000-0000-0000-000000000001"');
  fs.writeFileSync("desktop/src-tauri/src/db/mod.rs", before + marker + after, "utf-8");
  console.log("Successfully updated SQLite mod.rs organization IDs to IMHS Quetta");
} else {
  console.log("Marker not found, check mod.rs");
}
