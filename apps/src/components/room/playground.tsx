/* 
    author: Yagnik Poshiya
    github: https://github.com/yagnikposhiya/eternal-web
*/

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Track } from "livekit-client";
import {
    LiveKitRoom,
    RoomAudioRenderer,
    useRoomContext,
    GridLayout,
    ParticipantTile,
    useTracks,
    useDataChannel,
} from "@livekit/components-react";

import Navbar from "../layout/navbar";
import Hero from "../layout/hero";
import Footer from "../layout/footer";
import { ToolEventsPanel } from "../tools/tool-events-panel";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Loader2,
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
    MessageSquare,
    MessageSquareOff,
    UserRound,
} from "lucide-react";

type TokenResponse = {
    token: string;
    url?: string;
    error?: string;
};

type CallSummaryEvent = {
    type: "call_summary";
    session_id: string;
    summary_text: string;
    booked_appointments: any[];
    preferences: any;
    ts: string;
    ts_local?: string;
    tz?: string;
};

function EndConversationListener(props: { onEnded: () => void }) {
    const { message: toolMsg } = useDataChannel("tool_events");

    useEffect(() => {
        if (!toolMsg) return;

        try {
            const txt = new TextDecoder().decode(toolMsg.payload);
            const ev = JSON.parse(txt);

            if (ev?.type === "tool_event" && ev?.tool === "end_conversation" && ev?.ok) {
                props.onEnded();
            }
        } catch { }
    }, [toolMsg, props]);

    return null;
}

function AvatarReadyWatcher(props: { onReady: () => void }) {
    const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);

    const remoteCameraTracks = cameraTracks.filter((t) => !t.participant.isLocal);

    useEffect(() => {
        if (remoteCameraTracks.length > 0) {
            props.onReady();
        }
    }, [remoteCameraTracks.length, props]);

    return null;
}

function ConnectingOverlay(props: { show: boolean }) {
    if (!props.show) return null;

    return (
        <div className="absolute inset-0 z-[60] grid place-items-center bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded-2xl border-None bg-black/40 px-7 py-6 text-white shadow-2xl">
                <div className="flex items-center gap-3">
                    <Loader2 className="h-12 w-12 animate-spin" />
                    <div className="text-5xl font-semibold">Please wait…</div>
                </div>
                <div className="text-base text-white/70">
                    Eternal is joining the room, hold on for a moment while the connection is being established.
                </div>
            </div>
        </div>
    );
}

function SummaryDialogController(props: {
    callEnded: boolean;
    open: boolean;
    setOpen: (v: boolean) => void;

    summary: CallSummaryEvent | null;
    setSummary: (ev: CallSummaryEvent | null) => void;

    onSummaryReady: (ev: CallSummaryEvent) => void;
}) {
    const { message } = useDataChannel("call_summary");
    const lastSummaryKeyRef = useRef<string | null>(null);

    /* Open dialog immediately when end_conversation happens */
    useEffect(() => {
        if (props.callEnded) props.setOpen(true);
    }, [props.callEnded, props.setOpen]);

    /* Populate when summary arrives */
    useEffect(() => {
        if (!message) return;

        try {
            const txt = new TextDecoder().decode(message.payload);
            const ev = JSON.parse(txt) as CallSummaryEvent;

            if (ev?.type !== "call_summary") return;

            /* Prevent infinite loops by processing each summary once */
            const key = `${ev.session_id}:${ev.ts}`;
            if (lastSummaryKeyRef.current === key) return;
            lastSummaryKeyRef.current = key;

            props.setSummary(ev);
            props.onSummaryReady(ev);
            props.setOpen(true);
        } catch { }
    }, [message, props.setOpen, props.setSummary, props.onSummaryReady]);


    const generating = props.callEnded && !props.summary;

    return (
        <Dialog
            open={props.open}
            onOpenChange={(v) => {
                /* If call ended and summary not ready, keep it open (as requested) */
                if (generating) return;
                props.setOpen(v);
            }}
        >
            <DialogContent className="sm:max-w-[720px] bg-black/70 text-white border border-white/20 backdrop-blur-2xl">
                <DialogHeader className="text-left">
                    <DialogTitle className="text-white">Call Summary</DialogTitle>
                    <DialogDescription className="text-white/70">
                        {generating ? "Summary is being generated…" : "Here’s what you have talked with Eternal."}
                    </DialogDescription>

                    {/* Divider */}
                    <div className="mt-2 h-px w-full bg-white/20" />
                </DialogHeader>

                {generating ? (
                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <div className="text-sm text-white/80">Summary is being generated…</div>
                    </div>
                ) : props.summary ? (
                    <div className="p-0 text-left">
                        <div className="text-sm whitespace-pre-wrap text-white/90">
                            {props.summary.summary_text}
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}


function AvatarFullStage() {
    const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);

    /* Only REMOTE camera tracks */
    const avatarTracks = cameraTracks.filter((t) => !t.participant.isLocal);

    const main = avatarTracks[0]; /* Keep only ONE fullscreen track (avatar) */

    return (
        <div className="h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-black/50">
            {main ? (
                <GridLayout tracks={[main]} style={{ height: "100%", width: "100%" }}>
                    <ParticipantTile />
                </GridLayout>
            ) : (
                <div className="grid h-full w-full place-items-center text-white/60">
                    Waiting for Eternal's video…
                </div>
            )}
        </div>
    );
}


function DraggableLocalTile(props: { camOn: boolean }) {
    /* Local camera track only (small tile) */
    const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
    const localTracks = cameraTracks.filter((t) => t.participant.isLocal);

    const CARD_W = 240;
    const CARD_H = 150;

    const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
    const dragging = useRef(false);
    const offset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

    useEffect(() => {
        /* Default bottom-left */
        const x = 16;
        const y = Math.max(16, window.innerHeight - CARD_H - 110); /* Keep above controls */
        setPos({ x, y });
    }, []);

    useEffect(() => {
        function onMove(e: PointerEvent) {
            if (!dragging.current || !pos) return;

            const nextX = e.clientX - offset.current.dx;
            const nextY = e.clientY - offset.current.dy;

            const maxX = window.innerWidth - CARD_W - 16;
            const maxY = window.innerHeight - CARD_H - 16;

            setPos({
                x: Math.min(Math.max(16, nextX), Math.max(16, maxX)),
                y: Math.min(Math.max(16, nextY), Math.max(16, maxY)),
            });
        }

        function onUp() {
            dragging.current = false;
        }

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);

        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };
    }, [pos]);

    if (!pos) return null;

    return (
        <div
            className="fixed z-[40] overflow-hidden rounded-xl border border-white/15 bg-black/50 shadow-2xl"
            style={{ width: CARD_W, height: CARD_H, left: pos.x, top: pos.y }}
            onPointerDown={(e) => {
                dragging.current = true;
                offset.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
            }}
        >
            <div className="relative h-full w-full">
                <GridLayout tracks={localTracks} style={{ height: "100%", width: "100%" }}>
                    <ParticipantTile />
                </GridLayout>

                {/* If camera OFF: cover last frame with solid black + icon */}
                {!props.camOn ? (
                    <div className="absolute inset-0 z-10 grid place-items-center bg-black">
                        <UserRound className="h-16 w-16 text-white/70" />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function MeetControls(props: {
    onLeave: () => void;
    leaveDisabled?: boolean;
    micOn: boolean;
    camOn: boolean;
    setMicOn: (v: boolean) => void;
    setCamOn: (v: boolean) => void;

    panelOpen: boolean;
    onTogglePanel: () => void;
}) {

    const room = useRoomContext();

    async function toggleMic() {
        const next = !props.micOn;
        props.setMicOn(next);
        try {
            await room.localParticipant.setMicrophoneEnabled(next);
        } catch {
            props.setMicOn(!next);
        }
    }

    async function toggleCam() {
        const next = !props.camOn;
        props.setCamOn(next);
        try {
            await room.localParticipant.setCameraEnabled(next);
        } catch {
            props.setCamOn(!next);
        }
    }

    function leave() {
        if (props.leaveDisabled) return;
        room.disconnect();
        props.onLeave();
    }

    return (
        <div className="fixed bottom-6 left-1/2 z-[50] -translate-x-1/2">
            <div className="flex items-center gap-3 rounded-full bg-black/70 px-4 py-3 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={toggleMic}
                    className="cursor-pointer grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
                    aria-label={props.micOn ? "Mute microphone" : "Unmute microphone"}
                    title={props.micOn ? "Mute microphone" : "Unmute microphone"}
                >
                    {props.micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>

                <button
                    onClick={toggleCam}
                    className="cursor-pointer grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
                    aria-label={props.camOn ? "Turn off camera" : "Turn on camera"}
                    title={props.camOn ? "Turn off camera" : "Turn on camera"}
                >
                    {props.camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>

                <button
                    onClick={props.onTogglePanel}
                    className="cursor-pointer grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
                    aria-label={props.panelOpen ? "Close messages panel" : "Open messages panel"}
                    title={props.panelOpen ? "Close tool call panel" : "Open tool call panel"}
                >
                    {props.panelOpen ? <MessageSquare className="h-5 w-5" /> : <MessageSquareOff className="h-5 w-5" />}
                </button>

                <button
                    onClick={leave}
                    disabled={!!props.leaveDisabled}
                    className={[
                        "grid h-11 w-11 place-items-center rounded-full text-white transition",
                        props.leaveDisabled
                            ? "cursor-not-allowed bg-red-500/30 opacity-70"
                            : "cursor-pointer bg-red-500/70 hover:bg-black",
                    ].join(" ")}
                    aria-label="Leave the room"
                    title="Leave the room"
                >
                    <PhoneOff className="h-5 w-5" />
                </button>

            </div>
        </div>
    );
}


function ToolPanel(props: {
    open: boolean;

    summaryReady: boolean;
    hasSummary: boolean;
    onOpenSummary: () => void;
}) {
    return (
        <aside
            className={[
                "relative h-full transition-all overflow-hidden",
                props.open ? "w-[360px]" : "w-0",
            ].join(" ")}
        >
            {props.open ? (
                <div className="h-full p-4">
                    {/* Portrait card (same feel as Eternal card) */}
                    <div className="h-full overflow-hidden rounded-2xl border border-white/20 bg-black/70 backdrop-blur-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/20 bg-black/70 px-4 py-3">
                            <div>
                                <div className="text-lg font-semibold text-white">Tool Calls</div>
                                <div className="text-sm text-white/70">Live tool invocation flow</div>
                            </div>
                        </div>

                        {/* Scroll inside the card only */}
                        <div className="h-[calc(100%-56px)] overflow-auto p-3">
                            <div className="mb-3">
                                <button
                                    type="button"
                                    title="Click to view summary"
                                    onClick={props.onOpenSummary}
                                    disabled={!props.hasSummary}
                                    className={[
                                        "w-full flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2 text-left transition",
                                        props.hasSummary
                                            ? "cursor-pointer bg-black/30 hover:bg-white/15"
                                            : "cursor-not-allowed bg-black/20 opacity-60",
                                    ].join(" ")}
                                >
                                    <div
                                        className={[
                                            "h-2.5 w-2.5 rounded-full",
                                            props.summaryReady && props.hasSummary ? "bg-green-400" : "bg-white/30",
                                        ].join(" ")}
                                    />
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-white">
                                            {props.summaryReady && props.hasSummary ? "Call Summary generated" : "Call Summary"}
                                        </div>
                                        <div className="text-xs text-white/70">
                                            {props.summaryReady && props.hasSummary ? "Click to view summary" : "Not available yet"}
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {/* Existing tool flow list */}
                            <ToolEventsPanel />
                        </div>
                    </div>
                </div>
            ) : (
                null
            )}
        </aside>
    );
}


export default function VoicePlayground() {
    const [room, setRoom] = useState("");
    const [phone, setPhone] = useState("");
    const [token, setToken] = useState<string | null>(null);
    const [connect, setConnect] = useState(false);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [callEnded, setCallEnded] = useState(false);
    const [summaryReady, setSummaryReady] = useState(false);

    const [avatarReady, setAvatarReady] = useState(false);
    const [panelOpen, setPanelOpen] = useState(true);

    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [summaryEvent, setSummaryEvent] = useState<CallSummaryEvent | null>(null);

    const serverUrl = useMemo(() => process.env.NEXT_PUBLIC_LIVEKIT_URL, []);
    const identityLabel = phone?.trim() || "Guest";

    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);

    const handleSummaryReady = useCallback(() => {
        setSummaryReady(true);
    }, []);

    useEffect(() => {
        if (!token) return;

        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = prev;
        };
    }, [token]);


    async function join() {
        setErr(null);
        setBusy(true);

        try {
            const identity = phone?.trim()
                ? phone.trim()
                : `guest-${Math.random().toString(16).slice(2)}`;

            const res = await fetch("/api/livekit-token", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    room: room.trim(),
                    identity,
                    name: identity,
                }),
            });

            const data = (await res.json()) as TokenResponse;

            if (!res.ok) throw new Error(data?.error || "Failed to mint token");
            if (!data.token) throw new Error("Token missing in response");

            setToken(data.token);
            setConnect(true);
        } catch (e: any) {
            setErr(e?.message || "Unknown error");
            setToken(null);
            setConnect(false);
        } finally {
            setBusy(false);
        }
    }

    function afterLeave() {
        setConnect(false);
        setToken(null);
        setCallEnded(false);
        setSummaryReady(false);
        setAvatarReady(false);
        setPanelOpen(true);
        setSummaryDialogOpen(false);
        setSummaryEvent(null);
    }

    if (!serverUrl) {
        return (
            <div style={{ padding: 16 }}>
                <h2>LiveKit Voice Playground</h2>
                <p style={{ color: "crimson" }}>
                    Missing <code>NEXT_PUBLIC_LIVEKIT_URL</code> in environment variables.
                </p>
            </div>
        );
    }

    // Join screen (Home)
    if (!token) {
        return (
            <div className="relative h-screen w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/primary-image.png')" }}
                />

                <div className="relative z-10 flex h-screen flex-col">
                    <Navbar />
                    <main className="relative flex-1 min-h-0 px-4 pt-16 pb-20 flex">
                        <Hero
                            room={room}
                            setRoom={setRoom}
                            phone={phone}
                            setPhone={setPhone}
                            busy={busy}
                            err={err}
                            onJoin={join}
                            showPhoneField={true}
                            requirePhone={true}
                        />
                    </main>
                    <Footer />
                </div>
            </div>
        );
    }

    /* Meeting room */
    return (
        <LiveKitRoom
            serverUrl={serverUrl}
            token={token}
            connect={connect}
            audio={true}
            video={true}
            onDisconnected={afterLeave}
            style={{ height: "100dvh", width: "100vw", overflow: "hidden" }}
        >
            <RoomAudioRenderer />

            <EndConversationListener onEnded={() => setCallEnded(true)} />

            {/* Open summary dialog on end_conversation; fill it when call_summary arrives */}
            <SummaryDialogController
                callEnded={callEnded}
                open={summaryDialogOpen}
                setOpen={setSummaryDialogOpen}
                summary={summaryEvent}
                setSummary={setSummaryEvent}
                onSummaryReady={handleSummaryReady}
            />


            {/* Watch for the remote avatar track; hide connecting overlay when ready */}
            <AvatarReadyWatcher onReady={() => setAvatarReady(true)} />

            <div className="relative h-[100dvh] w-[100vw] overflow-hidden bg-black">
                <ConnectingOverlay show={!avatarReady} />

                <div
                    className={[
                        "grid h-full w-full duration-500",
                        panelOpen ? "grid-cols-[1fr_360px]" : "grid-cols-[1fr_0px]",
                    ].join(" ")}
                >
                    {/* Main stage */}
                    <div className="relative h-full overflow-hidden p-4">
                        <AvatarFullStage />

                        {/* Local draggable small tile */}
                        <DraggableLocalTile camOn={camOn} />

                        {/* Meet-like controls */}
                        <MeetControls
                            onLeave={afterLeave}
                            leaveDisabled={callEnded && !summaryReady}
                            micOn={micOn}
                            camOn={camOn}
                            setMicOn={setMicOn}
                            setCamOn={setCamOn}
                            panelOpen={panelOpen}
                            onTogglePanel={() => setPanelOpen((v) => !v)}
                        />

                    </div>

                    {/* Right tool panel */}
                    <ToolPanel
                        open={panelOpen}
                        summaryReady={summaryReady}
                        hasSummary={!!summaryEvent}
                        onOpenSummary={() => setSummaryDialogOpen(true)}
                    />
                </div>
            </div>
        </LiveKitRoom>
    );
}
