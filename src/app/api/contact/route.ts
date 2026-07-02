import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "vsarinelli@gmail.com";

interface ContactBody {
  name: string;
  contactMethod: "email" | "phone";
  contactValue: string;
  productionType: "photo" | "video" | "event" | "other";
  otherDescription?: string;
  dates?: string;
  message: string;
}

function formatProductionType(type: ContactBody["productionType"]): string {
  const labels: Record<ContactBody["productionType"], string> = {
    photo: "Fotografía",
    video: "Video",
    event: "Evento",
    other: "Otros",
  };
  return labels[type];
}

function buildEmailHtml(body: ContactBody): string {
  const productionLabel = formatProductionType(body.productionType);
  const contactLabel = body.contactMethod === "email" ? "Email" : "Teléfono";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; background: #fafaf9; padding: 40px 20px;">
  <table style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
    <tr>
      <td style="padding: 32px; background: linear-gradient(135deg, #d97706, #f59e0b); text-align: center;">
        <h1 style="color: white; font-size: 24px; margin: 0; letter-spacing: 0.3em;">MIDCENTURY</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Nuevo contacto desde el lookbook</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4; color: #a8a29e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Nombre / Agencia</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4; color: #1c1917; font-size: 15px; text-align: right;">${body.name}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4; color: #a8a29e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">${contactLabel}</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4; color: #1c1917; font-size: 15px; text-align: right;">${body.contactValue}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4; color: #a8a29e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Tipo de Producción</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4; color: #1c1917; font-size: 15px; text-align: right;">${productionLabel}${body.productionType === "other" && body.otherDescription ? ` — ${body.otherDescription}` : ""}</td>
          </tr>
          ${body.dates ? `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4; color: #a8a29e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Fechas</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4; color: #1c1917; font-size: 15px; text-align: right;">${body.dates}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 12px 0; color: #a8a29e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; vertical-align: top;">Mensaje</td>
            <td style="padding: 12px 0; color: #1c1917; font-size: 15px; text-align: right; white-space: pre-wrap;">${body.message}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactBody = await request.json();

    // ── Server-side validation ─────────────────────────────
    const errors: string[] = [];

    if (!body.name || body.name.trim().length < 2) {
      errors.push("El nombre o agencia debe tener al menos 2 caracteres.");
    }

    if (!["email", "phone"].includes(body.contactMethod)) {
      errors.push("Medio de contacto inválido.");
    }

    if (!body.contactValue || body.contactValue.trim().length < 3) {
      errors.push("El email o teléfono es obligatorio.");
    } else if (body.contactMethod === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contactValue)) {
      errors.push("Ingresá un email válido.");
    } else if (body.contactMethod === "phone" && !/^[\d\s\-\+\(\)]{7,20}$/.test(body.contactValue)) {
      errors.push("Ingresá un número de teléfono válido.");
    }

    if (!["photo", "video", "event", "other"].includes(body.productionType)) {
      errors.push("Tipo de producción inválido.");
    }

    if (
      body.productionType === "other" &&
      (!body.otherDescription || body.otherDescription.trim().length < 3)
    ) {
      errors.push("Describí brevemente tu tipo de producción.");
    }

    if (!body.message || body.message.trim().length < 10) {
      errors.push("El mensaje debe tener al menos 10 caracteres.");
    }

    if (errors.length > 0) {
      console.warn("Contact form validation errors:", errors, "body:", { ...body, contactValue: "***" });
      return NextResponse.json(
        { ok: false, errors },
        { status: 400 }
      );
    }

    // ── Send email via Resend ──────────────────────────────
    const html = buildEmailHtml(body);
    const subject = `Nuevo contacto — ${body.name} (${body.contactValue})`;

    const { error: resendError } = await resend.emails.send({
      from: "Midcentury Lookbook <onboarding@resend.dev>",
      to: CONTACT_EMAIL,
      replyTo: body.contactMethod === "email" ? body.contactValue : undefined,
      subject,
      html,
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      return NextResponse.json(
        { ok: false, errors: ["Error al enviar el email."] },
        { status: 500 }
      );
    }

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
