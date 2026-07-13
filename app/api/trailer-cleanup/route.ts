import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

// Dedicated endpoint for navigator.sendBeacon on page unload — sendBeacon
// can only POST to a plain URL, it can't invoke a Next.js server action.
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const { videoId } = JSON.parse(body) as { videoId?: string };

    if (!videoId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await fetch(
      `https://video.bunnycdn.com/library/${env.BUNNY_STREAM_TRAILER_LIBRARY_ID}/videos/${videoId}`,
      {
        method: "DELETE",
        headers: { AccessKey: env.BUNNY_STREAM_TRAILER_API_KEY },
      }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Trailer cleanup route error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}