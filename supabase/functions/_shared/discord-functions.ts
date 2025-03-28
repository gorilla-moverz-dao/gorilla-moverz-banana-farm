import nacl from "https://cdn.skypack.dev/tweetnacl@v1.0.3?dts";
import { json } from "https://deno.land/x/sift@0.6.0/mod.ts";

/** Verify whether the request is coming from Discord. */
export async function verifySignature(request: Request): Promise<{ valid: boolean; body: string }> {
  const PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY")!;
  // Discord sends these headers with every request.
  const signature = request.headers.get("X-Signature-Ed25519")!;
  const timestamp = request.headers.get("X-Signature-Timestamp")!;
  const body = await request.text();
  const valid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + body),
    hexToUint8Array(signature),
    hexToUint8Array(PUBLIC_KEY),
  );

  return { valid, body };
}

/** Converts a hexadecimal string to Uint8Array. */
function hexToUint8Array(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((val) => parseInt(val, 16)));
}

export function createDiscordResponse(message: string, isError: boolean = false) {
  return json({
    type: 4,
    data: {
      content: `\`\`\`ansi\n${isError ? "\u001b[31m" : ""}${message}\`\`\``,
      flags: 64,
    },
  });
}

export enum DiscordCommandType {
  Ping = 1,
  ApplicationCommand = 2,
}

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
