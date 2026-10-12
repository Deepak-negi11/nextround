// Set a new password for an existing account, e.g. to replace the seeded demo passwords
// (admin123 etc.) before the site goes public.
//
//   bun run user:password admin@college.edu
//
// The password is typed at a masked prompt (one "*" per character) — it never appears on screen
// or in shell history.
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { MIN_PASSWORD_LENGTH } from "../src/lib/validation";

// Reads a line without echoing it, printing one "*" per character so it's clear typing works.
// Input is handled character by character, so a pasted password (with or without Enter) works too.
function askHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const { stdin, stdout } = process;
    if (!stdin.isTTY) return reject(new Error("Run this in an interactive terminal."));
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const finish = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.off("data", onData);
      stdout.write("\n");
      resolve(value);
    };
    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n" || ch === "\u0004") return finish(); // Enter or Ctrl-D
        if (ch === "\u0003") {
          stdout.write("\n");
          process.exit(130); // Ctrl-C
        }
        if (ch === "\u007f" || ch === "\b") {
          if (value.length > 0) {
            value = value.slice(0, -1);
            stdout.write("\b \b");
          }
        } else if (ch >= " ") {
          value += ch;
          stdout.write("*");
        }
      }
    };
    stdin.on("data", onData);
  });
}

// Asks for a valid password, giving a few tries before giving up.
async function askNewPassword(email: string, role: string): Promise<string | null> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const password = await askHidden(`New password for ${email} (${role}): `);
    if (password.length < MIN_PASSWORD_LENGTH) {
      console.error(`  That was ${password.length} character(s); it needs at least ${MIN_PASSWORD_LENGTH}. Try again.`);
      continue;
    }
    if (new TextEncoder().encode(password).length > 72) {
      console.error("  That's too long (max 72 bytes). Try again.");
      continue;
    }
    if ((await askHidden("Type it again to confirm: ")) !== password) {
      console.error("  The two entries didn't match. Try again.");
      continue;
    }
    return password;
  }
  return null;
}

async function main() {
  const email = (process.argv[2] ?? "").trim().toLowerCase();
  if (!email) {
    console.error("Usage: bun run user:password <email>");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
    if (!user) {
      console.error(`No account with email ${email}.`);
      process.exit(1);
    }

    const password = await askNewPassword(email, user.role);
    if (!password) {
      console.error("No password set — nothing changed.");
      process.exit(1);
    }

    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(password, 10) } });
    console.log(`Password updated for ${email}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
