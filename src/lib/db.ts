import { neon } from "@neondatabase/serverless";

// DATABASE_URL is injected by Neon integration at runtime.
// Fall back to a dummy string at build time so the module loads without crashing.
// Real queries will throw naturally if called without a valid URL.
const sql = neon(process.env.DATABASE_URL ?? "postgresql://localhost/placeholder");

export default sql;
