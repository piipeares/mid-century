import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

interface ContactBody {
  name: string;
  productionType: "photo" | "video" | "event";
  dates?: string;
  message: string;
}

const SUBMISSIONS_DIR = path.join(process.cwd(), "data");

export async function POST(request: NextRequest) {
  try {
    const body: ContactBody = await request.json();

    // ── Server-side validation ─────────────────────────────
    const errors: string[] = [];

    if (!body.name || body.name.trim().length < 2) {
      errors.push("El nombre o agencia debe tener al menos 2 caracteres.");
    }

    if (!["photo", "video", "event"].includes(body.productionType)) {
      errors.push("Tipo de producción inválido.");
    }

    if (!body.message || body.message.trim().length < 10) {
      errors.push("El mensaje debe tener al menos 10 caracteres.");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { ok: false, errors },
        { status: 400 }
      );
    }

    // ── Persist submission ─────────────────────────────────
    await fs.mkdir(SUBMISSIONS_DIR, { recursive: true });

    const submission = {
      ...body,
      receivedAt: new Date().toISOString(),
    };

    const filename = `contact-${Date.now()}.json`;
    await fs.writeFile(
      path.join(SUBMISSIONS_DIR, filename),
      JSON.stringify(submission, null, 2),
      "utf-8"
    );

    return NextResponse.json(
      { ok: true, message: "Gracias por tu interés. Te contactaremos pronto." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { ok: false, errors: ["Ocurrió un error al procesar tu solicitud."] },
      { status: 500 }
    );
  }
}
