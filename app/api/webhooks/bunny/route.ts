import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

interface BunnyWebhookPayload {
  VideoLibraryId: number;
  VideoGuid: string;
  Status: number;
}

export async function POST(request: Request) {
  try {
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