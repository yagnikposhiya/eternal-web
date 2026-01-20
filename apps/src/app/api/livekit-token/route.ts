/* 
    author: Yagnik Poshiya
    github: https://github.com/yagnikposhiya/eternal-web
*/

import { NextResponse } from "next/server";
import {
    AccessToken,
    AgentDispatchClient,
    RoomServiceClient,
} from "livekit-server-sdk";

export const runtime = "nodejs"; // avoid Edge crypto limitations

export async function POST(req: Request) {
    const { room, identity, name } = await req.json();

    if (!room || !identity) {
        return NextResponse.json(
            { error: "room and identity are required" },
            { status: 400 }
        );
    }

    const apiKey = process.env.LIVEKIT_API_KEY!;
    const apiSecret = process.env.LIVEKIT_API_SECRET!;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

    // Server SDK needs HTTPS host (not WSS)
    const host =
        process.env.LIVEKIT_HOST ||
        wsUrl.replace(/^wss:/, "https:").replace(/^ws:/, "http:");

    const roomName = String(room).trim();
    const agentName = process.env.LIVEKIT_AGENT_NAME || "eternal-agent";

    // 1) Mint token for user
    const at = new AccessToken(apiKey, apiSecret, {
        identity: String(identity),
        name: name ? String(name) : String(identity),
        ttl: "1h",
    });

    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
    });

    const token = await at.toJwt();

    // 2) Ensure room exists, then dispatch agent (best effort)
    try {
        const roomSvc = new RoomServiceClient(host, apiKey, apiSecret);
        const dispatchClient = new AgentDispatchClient(host, apiKey, apiSecret);

        // Create room (ok if it already exists)
        try {
            await roomSvc.createRoom({ name: roomName });
        } catch (e: any) {
            // ignore "already exists" style errors
            // (different servers/versions use different error shapes)
        }

        // Dispatch agent (ok if already dispatched)
        try {
            await dispatchClient.createDispatch(roomName, agentName, {
                metadata: JSON.stringify({ source: "web" }),
            });
        } catch (e: any) {
            // ignore if already exists, but log other errors
            console.error("Agent dispatch create failed:", e);
        }
    } catch (err) {
        console.error("Agent dispatch failed:", err);
    }

    return NextResponse.json({ token, url: wsUrl });
}
