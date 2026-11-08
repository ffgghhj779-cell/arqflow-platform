import "server-only";

/**
 * Evolution API helper — sends WhatsApp messages from an agency-owned instance.
 * Used to deliver client onboarding (login credentials + QR-linking steps) the
 * moment a setup payment is approved.
 *
 * Required env vars:
 *   EVOLUTION_API_URL              — base URL of the Evolution API server
 *   EVOLUTION_API_KEY              — global/instance API key (sent as `apikey`)
 *   EVOLUTION_ONBOARDING_INSTANCE  — instance used to send (default: "Arq Flow")
 *
 * Targets Evolution API v2 (`POST /message/sendText/{instance}` → { number, text }).
 */

const base = () => process.env.EVOLUTION_API_URL?.replace(/\/+$/, "") ?? null;
const apiKey = () => process.env.EVOLUTION_API_KEY ?? null;
const onboardingInstance = () => process.env.EVOLUTION_ONBOARDING_INSTANCE ?? "Arq Flow";

export function isEvolutionConfigured(): boolean {
  return !!base() && !!apiKey();
}

/**
 * Normalize a phone number to Evolution's expected international, digits-only
 * MSISDN. Tuned for Egypt but leaves already-international numbers untouched.
 *   01090362926        → 201090362926
 *   +20 109 036 2926   → 201090362926
 *   00201090362926     → 201090362926
 *   201090362926       → 201090362926 (unchanged)
 */
export function normalizeMsisdn(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = String(raw).replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("00")) d = d.slice(2); // drop intl access prefix
  if (d.startsWith("0") && d.length === 11) d = "20" + d.slice(1); // local 01XXXXXXXXX
  else if (d.startsWith("1") && d.length === 10) d = "20" + d; // bare 1XXXXXXXXX
  return d;
}

/** Send a plain-text WhatsApp message via Evolution API. */
export async function sendWhatsAppText(
  number: string,
  text: string,
  instance?: string
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const b = base();
  const k = apiKey();
  if (!b || !k) return { ok: false, error: "EVOLUTION_API_URL / EVOLUTION_API_KEY not set" };

  const inst = instance ?? onboardingInstance();
  const url = `${b}/message/sendText/${encodeURIComponent(inst)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: k },
      body: JSON.stringify({ number, text }),
      signal: AbortSignal.timeout(15_000),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detail =
        (json?.response?.message && JSON.stringify(json.response.message)) ||
        json?.message ||
        json?.error ||
        `Evolution sendText → ${res.status}`;
      return { ok: false, error: String(detail) };
    }
    return { ok: true, id: json?.key?.id ?? json?.messageId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Evolution unreachable" };
  }
}

export type EvolutionConnectionInfo = {
  ok: boolean;
  connected: boolean;
  state: "open" | "close" | "connecting" | "unknown";
  number: string | null;
  error?: string;
};

/** Query Evolution API for live connection state and connected number */
export async function getEvolutionInstanceStatus(
  instanceName: string
): Promise<EvolutionConnectionInfo> {
  const b = base();
  const k = apiKey();
  if (!b || !k) {
    return { ok: false, connected: false, state: "unknown", number: null, error: "Evolution API not configured" };
  }

  try {
    let stateStr = "unknown";
    let connectedNumber: string | null = null;

    // 1. Check fetchInstances for detailed instance status + connected phone number
    try {
      const fetchUrl = `${b}/instance/fetchInstances?instanceName=${encodeURIComponent(instanceName)}`;
      const resFetch = await fetch(fetchUrl, {
        method: "GET",
        headers: { apikey: k },
        signal: AbortSignal.timeout(8_000),
        cache: "no-store",
      });

      if (resFetch.ok) {
        const raw = await resFetch.json().catch(() => null);
        const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const inst = list[0] as
          | {
              instance?: { state?: string; status?: string };
              connectionStatus?: string;
              state?: string;
              status?: string;
              ownerJid?: string | null;
              number?: string | null;
            }
          | undefined;

        const fState = (
          inst?.instance?.state ??
          inst?.state ??
          inst?.connectionStatus ??
          inst?.instance?.status ??
          inst?.status ??
          ""
        ).toLowerCase();

        if (fState) {
          stateStr = fState;
        }

        connectedNumber =
          inst?.number ??
          (inst?.ownerJid ? String(inst.ownerJid).split("@")[0].replace(/\D/g, "") : null) ??
          null;
      }
    } catch {
      // Fall through to connectionState check
    }

    // 2. If state still unknown, query connectionState endpoint
    if (stateStr === "unknown") {
      try {
        const connUrl = `${b}/instance/connectionState/${encodeURIComponent(instanceName)}`;
        const resConn = await fetch(connUrl, {
          method: "GET",
          headers: { apikey: k },
          signal: AbortSignal.timeout(6_000),
          cache: "no-store",
        });

        if (resConn.ok) {
          const connData = (await resConn.json().catch(() => ({}))) as {
            instance?: { state?: string };
            state?: string;
          };
          stateStr = (connData.instance?.state ?? connData.state ?? "unknown").toLowerCase();
        }
      } catch {
        // Leave stateStr as unknown
      }
    }

    const isConnected = stateStr === "open" || stateStr === "connected";
    const mappedState: "open" | "close" | "connecting" | "unknown" = isConnected
      ? "open"
      : stateStr === "connecting"
      ? "connecting"
      : stateStr === "close" || stateStr === "closed" || stateStr === "disconnected"
      ? "close"
      : "unknown";

    return {
      ok: true,
      connected: isConnected,
      state: mappedState,
      number: connectedNumber,
    };
  } catch (e) {
    return {
      ok: false,
      connected: false,
      state: "unknown",
      number: null,
      error: e instanceof Error ? e.message : "Evolution API unreachable",
    };
  }
}

export type EvolutionQrResult = {
  ok: boolean;
  connected: boolean;
  qr_base64?: string | null;
  pairing_code?: string | null;
  ttl_seconds?: number;
  error?: string;
};

/** Request a fresh QR code from Evolution API for pairing */
export async function getEvolutionQrCode(
  instanceName: string
): Promise<EvolutionQrResult> {
  const b = base();
  const k = apiKey();
  if (!b || !k) {
    return { ok: false, connected: false, error: "Evolution API not configured" };
  }

  try {
    const url = `${b}/instance/connect/${encodeURIComponent(instanceName)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { apikey: k },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });

    if (!res.ok) {
      return { ok: false, connected: false, error: `Evolution connect returned ${res.status}` };
    }

    const data = (await res.json()) as {
      base64?: string;
      code?: string;
      pairingCode?: string | null;
      instance?: { state?: string };
    };

    const isConnected =
      (!data.base64 && (data.instance?.state === "open" || data.instance?.state === "connected")) ||
      data.instance?.state === "open";

    if (isConnected) {
      return { ok: true, connected: true };
    }

    if (!data.base64) {
      return { ok: false, connected: false, error: "QR code not available yet, please retry shortly" };
    }

    return {
      ok: true,
      connected: false,
      qr_base64: data.base64,
      pairing_code: data.pairingCode ?? null,
      ttl_seconds: 40,
    };
  } catch (e) {
    return { ok: false, connected: false, error: e instanceof Error ? e.message : "Evolution unreachable" };
  }
}

/** Disconnect / logout an active session in Evolution API */
export async function logoutEvolutionInstance(
  instanceName: string
): Promise<{ ok: boolean; error?: string }> {
  const b = base();
  const k = apiKey();
  if (!b || !k) {
    return { ok: false, error: "Evolution API not configured" };
  }

  try {
    // Try DELETE first (standard Evolution v2)
    const delRes = await fetch(`${b}/instance/logout/${encodeURIComponent(instanceName)}`, {
      method: "DELETE",
      headers: { apikey: k },
      signal: AbortSignal.timeout(10_000),
    });

    if (delRes.ok) {
      return { ok: true };
    }

    // Fallback to POST
    const postRes = await fetch(`${b}/instance/logout/${encodeURIComponent(instanceName)}`, {
      method: "POST",
      headers: { apikey: k },
      signal: AbortSignal.timeout(10_000),
    });

    if (postRes.ok) {
      return { ok: true };
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Evolution unreachable" };
  }
}

/**
 * Build the "bot is ready" WhatsApp message — sent to the client the moment the
 * n8n Bot Factory workflow finishes successfully (login details + QR-linking).
 */
export function botReadyMessage(p: {
  clientId: string;
  email: string;
  password: string;
  loginUrl: string;
}): string {
  return (
    `مرحبًا 👋\n` +
    `يسعدنا إبلاغك بأنه تم إنشاء البوت الخاص بك بنجاح وهو الآن جاهز للتفعيل. 🎉\n` +
    `يرجى الاحتفاظ ببيانات تسجيل الدخول التالية، لأنها لن تظهر مرة أخرى:\n` +
    `🔑 بيانات الدخول\n\n` +
    `• معرّف العميل: ${p.clientId}\n` +
    `• الإيميل: ${p.email}\n` +
    `• كلمة المرور: ${p.password}\n\n` +
    `لتفعيل البوت، اتبع الخطوات التالية:\n\n` +
    `1. سجّل الدخول إلى المنصة من خلال الرابط: ${p.loginUrl}\n` +
    `2. بعد تسجيل الدخول، سيظهر لك QR Code.\n` +
    `3. افتح تطبيق WhatsApp على هاتفك، ثم انتقل إلى الأجهزة المرتبطة (Linked Devices) واضغط ربط جهاز، ثم امسح الـQR Code الظاهر في المنصة.\n\n` +
    `بمجرد إتمام الربط، سيتم تفعيل البوت وربطه بحساب الواتساب الخاص بك، وسيصبح جاهزًا للعمل.\n` +
    `إذا واجهت أي مشكلة أثناء تسجيل الدخول أو ربط الواتساب، تواصل معنا وسنساعدك بكل سرور. 🌹`
  );
}
