// Shared Discord utilities for Convex HTTP handlers

// Discord interaction types
export const DiscordCommandType = {
  Ping: 1,
  ApplicationCommand: 2,
} as const;

export interface DiscordPostData {
  id: string;
  application_id: string;
  token: string;
  type: number;
  data: {
    options: { name: string; value: string }[];
  };
  guild_id: string;
  member: {
    user: {
      id: string;
      username: string;
    };
  };
}

// Helper to convert hex string to Uint8Array
function hexToUint8Array(hex: string): Uint8Array {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((val) => parseInt(val, 16)));
}

// Verify Discord signature
export async function verifyDiscordSignature(
  signature: string,
  timestamp: string,
  body: string,
  publicKey: string,
): Promise<boolean> {
  // Import tweetnacl dynamically (Convex supports this)
  const naclModule = await import("tweetnacl");
  // Handle both ESM default export and CommonJS module structure
  const nacl = naclModule.default || naclModule;
  const message = new TextEncoder().encode(timestamp + body);
  return nacl.sign.detached.verify(message, hexToUint8Array(signature), hexToUint8Array(publicKey));
}

// Create Discord response helper (type 4 - immediate response)
export function createDiscordResponse(message: string, isError: boolean = false): Response {
  return new Response(
    JSON.stringify({
      type: 4,
      data: {
        content: `\`\`\`ansi\n${isError ? "\u001b[31m" : ""}${message}\`\`\``,
        flags: 64,
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

// Create deferred response (type 5)
export function createDeferredResponse(): Response {
  return new Response(
    JSON.stringify({
      type: 5,
      flags: 64,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

// Validate Discord request and verify signature
export async function validateDiscordRequest(request: Request): Promise<{
  valid: boolean;
  body: string;
  error?: Response;
}> {
  if (request.method !== "POST") {
    return {
      valid: false,
      body: "",
      error: new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  const signature = request.headers.get("X-Signature-Ed25519");
  const timestamp = request.headers.get("X-Signature-Timestamp");

  if (!signature || !timestamp) {
    return {
      valid: false,
      body: "",
      error: new Response(JSON.stringify({ error: "Missing required headers" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  const body = await request.text();

  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) {
    console.error("DISCORD_PUBLIC_KEY not configured");
    return {
      valid: false,
      body: "",
      error: new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  const valid = await verifyDiscordSignature(signature, timestamp, body, publicKey);
  if (!valid) {
    return {
      valid: false,
      body: "",
      error: new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  return { valid: true, body };
}

// Discord API base URL
export const DISCORD_API_BASE_URL = "https://discord.com/api/v10";
