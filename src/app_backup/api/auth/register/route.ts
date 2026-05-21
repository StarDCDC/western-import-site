import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { sanitizeInput, validateEmail, validatePassword } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";
import { sendEmail, welcomeEmailHtml } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    // Rate limit
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`register:${ip}`, { maxRequests: 5, windowMs: 60000 }).allowed) {
      return NextResponse.json({ error: "Prea multe încercări. Încearcă mai târziu." }, { status: 429 });
    }

    const body = await req.json() as Record<string, string>;
    const name = sanitizeInput(body.name || "") as string;
    const email = (sanitizeInput(body.email || "") as string).toLowerCase();
    const phone = sanitizeInput(body.phone || "") as string;
    const password = body.password || "";

    // Validation
    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Numele trebuie să aibă minim 2 caractere" }, { status: 400 });
    }
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Email invalid" }, { status: 400 });
    }
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.errors.join(". ") }, { status: 400 });
    }

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Acest email este deja înregistrat" }, { status: 409 });
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

    // Send welcome email (non-blocking)
    sendEmail({
      to: user.email!,
      subject: 'Bun venit la Western Import! 🎉',
      html: welcomeEmailHtml(user.name || 'Client'),
    }).catch(() => {});

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Eroare la înregistrare" }, { status: 500 });
  }
}
