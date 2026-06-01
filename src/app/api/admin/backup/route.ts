import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return NextResponse.json({ success: false, error: "Neautorizat" }, { status: error === "forbidden" ? 403 : 401 });

    const backupDir = path.join(process.cwd(), "backups");
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup_${timestamp}.sql.gz`;
    const filepath = path.join(backupDir, filename);

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json(
        { success: false, error: "DATABASE_URL not configured" },
        { status: 500 }
      );
    }

    // Run backup using pg_dump via child_process
    // Format: postgresql://user:pass@host:port/dbname
    const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!match) {
      return NextResponse.json(
        { success: false, error: "Invalid DATABASE_URL format" },
        { status: 500 }
      );
    }

    const [, user, pass, host, port, dbname] = match;
    const cmd = `pg_dump -h "${host}" -p "${port}" -U "${user}" -d "${dbname}" -Fc 2>/dev/null | gzip -9 > "${filepath}"`;

    try {
      execSync(cmd, { env: { ...process.env, PGPASSWORD: pass }, stdio: "pipe" });
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "pg_dump failed. Is pg_dump installed and in PATH?" },
        { status: 500 }
      );
    }

    if (!existsSync(filepath)) {
      return NextResponse.json(
        { success: false, error: "Backup file was not created" },
        { status: 500 }
      );
    }

    // Prune backups older than 7 days
    try {
      execSync(
        `find "${backupDir}" -name "backup_*.sql.gz" -mtime +7 -delete`,
        { stdio: "pipe" }
      );
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      success: true,
      filename,
      path: `/admin/backups/${filename}`,
      message: "Backup created successfully",
    });
  } catch (err) {
    console.error("Backup error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}