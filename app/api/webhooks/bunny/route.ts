import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";

interface BunnyWebhookPayload {
  VideoLibraryId: number;
  VideoGuid: string;
  Status: number;
}

export async function POST(request: NextRequest) {
  try {
    // Bunny doesn't sign its webhook payloads, so we secure this endpoint
    // with a shared secret embedded in the callback URL configured in the
    // Bunny dashboard (e.g. .../api/webhooks/bunny?secret=xxxx). Without
    // this, anyone who finds the URL could POST fake "video ready" events.
    const secret = request.nextUrl.searchParams.get("secret");
    if (secret !== env.BUNNY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: BunnyWebhookPayload = await request.json();
    const { VideoGuid, Status } = payload;

    if (!VideoGuid) {
      return NextResponse.json({ error: "Missing VideoGuid" }, { status: 400 });
    }

    // Map Bunny's numeric status codes to our own VideoStatus enum.
    // 3 = Finished, 4 = Resolution finished (already playable) -> READY
    // 5 = Failed -> FAILED
    // Everything else (0,1,2,6,7,8,9) is an in-progress/irrelevant event we ignore.
    let newStatus: "READY" | "FAILED" | null = null;

    if (Status === 3 || Status === 4) {
      newStatus = "READY";
    } else if (Status === 5) {
      newStatus = "FAILED";
    }

    if (!newStatus) {
      // Nothing to update yet (e.g. still queued/encoding) — acknowledge and stop.
      return NextResponse.json({ received: true });
    }

    // bunnyVideoId is how we look up our own row — it stores the same GUID Bunny sent us.
    await prisma.video.updateMany({
      where: { bunnyVideoId: VideoGuid },
      data: { status: newStatus },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Bunny webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}