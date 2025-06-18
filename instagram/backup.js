import { exec } from "child_process";
import * as dotenv from "dotenv";
dotenv.config();

const dbUrl = process.env.SUPABASE_DB_URL;
const filePath = process.env.BACKUP_PATH || "./supabase_backup.sql";

const command = `supabase db dump --db-url "${dbUrl}" --file "${filePath}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error("❌ Błąd podczas backupu:", error.message);
    return;
  }
  if (stderr) {
    console.warn("⚠️ stderr:", stderr);
  }
  console.log("✅ Backup zakończony:", stdout);
});
