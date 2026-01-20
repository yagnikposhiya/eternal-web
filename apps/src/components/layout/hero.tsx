/*
    author: Yagnik Poshiya
    github: https://github.com/yagnikposhiya/eternal-web
*/

"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type HeroProps = {
    room: string;
    setRoom: (v: string) => void;

    phone: string;
    setPhone: (v: string) => void;

    busy: boolean;
    err: string | null;

    onJoin: () => void;

    showPhoneField?: boolean;
    requirePhone?: boolean;
};

function MicIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M12 14a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M19 11a7 7 0 0 1-14 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12 18v3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M8 21h8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function Typewriter(props: {
    phrases: string[];
    className?: string;
    typingSpeedMs?: number;   /* Per character */
    deletingSpeedMs?: number; /* Per character */
    holdMs?: number;          /* Pause after full phrase typed */
}) {
    const {
        phrases,
        className,
        typingSpeedMs = 45,
        deletingSpeedMs = 22,
        holdMs = 1200,
    } = props;

    const [i, setI] = useState(0);        /* Phrase index */
    const [txt, setTxt] = useState("");   /* Currently displayed substring */
    const [del, setDel] = useState(false); /* Deleting? */
    const [cursorOn, setCursorOn] = useState(true);

    /* Cursor blink */
    useEffect(() => {
        const t = setInterval(() => setCursorOn((v) => !v), 500);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        if (!phrases?.length) return;

        const full = phrases[i % phrases.length];

        /* Pause when finished typing */
        if (!del && txt === full) {
            const t = setTimeout(() => setDel(true), holdMs);
            return () => clearTimeout(t);
        }

        /* Move to next phrase after deleting */
        if (del && txt.length === 0) {
            setDel(false);
            setI((v) => (v + 1) % phrases.length);
            return;
        }

        const step = () => {
            if (!del) {
                setTxt(full.slice(0, txt.length + 1));
            } else {
                setTxt(full.slice(0, Math.max(0, txt.length - 1)));
            }
        };

        const speed = del ? deletingSpeedMs : typingSpeedMs;
        const t = setTimeout(step, speed);
        return () => clearTimeout(t);
    }, [phrases, i, txt, del, typingSpeedMs, deletingSpeedMs, holdMs]);

    return (
        <div className={className}>
            <span>{txt}</span>
            <span className="inline-block w-[1ch]">
                {cursorOn ? "|" : " "}
            </span>
        </div>
    );
}

function TypingPlaceholder(props: {
    phrases: string[];
    className?: string;
    typingSpeedMs?: number;
    deletingSpeedMs?: number;
    holdMs?: number;
}) {
    const {
        phrases,
        className,
        typingSpeedMs = 35,
        deletingSpeedMs = 18,
        holdMs = 900,
    } = props;

    const [i, setI] = useState(0);
    const [txt, setTxt] = useState("");
    const [del, setDel] = useState(false);
    const [cursorOn, setCursorOn] = useState(true);

    useEffect(() => {
        const t = setInterval(() => setCursorOn((v) => !v), 500);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        if (!phrases?.length) return;

        const full = phrases[i % phrases.length];

        if (!del && txt === full) {
            const t = setTimeout(() => setDel(true), holdMs);
            return () => clearTimeout(t);
        }

        if (del && txt.length === 0) {
            setDel(false);
            setI((v) => (v + 1) % phrases.length);
            return;
        }

        const speed = del ? deletingSpeedMs : typingSpeedMs;
        const t = setTimeout(() => {
            setTxt((prev) =>
                del ? prev.slice(0, Math.max(0, prev.length - 1)) : full.slice(0, prev.length + 1)
            );
        }, speed);

        return () => clearTimeout(t);
    }, [phrases, i, txt, del, typingSpeedMs, deletingSpeedMs, holdMs]);

    return (
        <span className={className}>
            {txt}
            <span className="inline-block w-[1ch]">{cursorOn ? "|" : " "}</span>
        </span>
    );
}


export default function Hero(props: HeroProps) {
    const [open, setOpen] = useState(false);

    const showPhoneField = !!props.showPhoneField;
    const requirePhone = !!props.requirePhone;

    const joinDisabled = useMemo(() => {
        if (props.busy) return true;
        if (!props.room.trim()) return true;
        if (showPhoneField && requirePhone && !props.phone.trim()) return true;
        return false;
    }, [props.busy, props.room, props.phone, showPhoneField, requirePhone]);

    const micDisabled = props.busy;

    return (
        <section className="w-full flex flex-col flex-1 min-h-0">
            <div className="mt-auto flex flex-col items-center gap-3 pb-6">

                {/* Mic CTA (opens dialog) */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <button
                            type="button"
                            disabled={micDisabled}
                            aria-label="Open join dialog"
                            className={[
                                "relative grid h-16 w-16 place-items-center rounded-full border border-white/20 text-white shadow-2xl backdrop-blur-md transition",
                                micDisabled
                                    ? "cursor-not-allowed bg-white/10 opacity-70"
                                    : "cursor-pointer bg-red-500/70 hover:bg-black",
                            ].join(" ")}
                        >
                            {/* Voice/ripple effect */}
                            {!micDisabled ? (
                                <>
                                    <span
                                        className="absolute inset-0 rounded-full animate-ping bg-red-500/100"
                                        style={{ animationDuration: "2s" }}
                                    />
                                    <span
                                        className="absolute inset-2 rounded-full animate-ping bg-red-500/90"
                                        style={{ animationDuration: "2s", animationDelay: "0.12s" }}
                                    />
                                    <span
                                        className="absolute inset-4 rounded-full animate-ping bg-red-500/80"
                                        style={{ animationDuration: "2s", animationDelay: "0.24s" }}
                                    />
                                    <span
                                        className="absolute inset-6 rounded-full animate-ping bg-red-500/70"
                                        style={{ animationDuration: "2s", animationDelay: "0.36s" }}
                                    />
                                </>
                            ) : null}


                            <span className="relative z-10">
                                <MicIcon />
                            </span>
                        </button>
                    </DialogTrigger>

                    {/* ShadCN Dialog */}
                    <DialogContent className="sm:max-w-[520px] bg-transparent backdrop-blur-2xl border border-white/20">
                        <DialogHeader>
                            <DialogTitle className="text-white">Join a room</DialogTitle>
                            <DialogDescription className="text-white/70">
                                Please don’t refresh the page after joining the room.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-2 pb-4">
                            <div className="grid gap-2">
                                <Label htmlFor="room" className="text-white">
                                    Room name<span className="text-red-500">*</span>
                                </Label>

                                <div className="relative">
                                    <Input
                                        id="room"
                                        value={props.room}
                                        onChange={(e) => props.setRoom(e.target.value)}
                                        placeholder="" // keep empty so we control placeholder UI ourselves
                                        className="text-white pr-10 border-white/40"
                                    />

                                    {/* Animated placeholder (only when empty) */}
                                    {!props.room.trim() ? (
                                        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                                            <TypingPlaceholder
                                                phrases={[
                                                    "product-sync",
                                                    "client-kickoff",
                                                    "support-escalation",
                                                    "sales-discovery",
                                                    "engineering-standup",
                                                    "api-integration",
                                                    "deployment-bridge",
                                                    "incident-warroom",
                                                    "strategy-huddle",
                                                    "exec-briefing"
                                                ]}
                                                typingSpeedMs={28}
                                                deletingSpeedMs={14}
                                                holdMs={700}
                                                className="text-white/50 text-sm"
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {showPhoneField ? (
                                <div className="grid gap-2">
                                    <Label htmlFor="phone" className="text-white">
                                        Phone
                                        {requirePhone ? <span className="text-red-500"> *</span> : null}
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={props.phone}
                                        onChange={(e) => props.setPhone(e.target.value)}
                                        placeholder="e.g., 97xxxxxx38"
                                        className="text-white border-white/40"
                                    />
                                </div>
                            ) : null}

                        </div>

                        {props.err ? (
                            <p className="m-0 text-sm text-red-600">{props.err}</p>
                        ) : null}

                        <Button
                            onClick={props.onJoin}
                            disabled={joinDisabled}
                            className="cursor-pointer w-full bg-red-500/70"
                        >
                            {props.busy ? "Connecting..." : "Talk with Eternal"}
                        </Button>
                    </DialogContent>
                </Dialog>

                <Typewriter
                    phrases={[
                        `Book an appointment tomorrow at 11 PM.`,
                        `Check my upcoming appointments.`,
                        `Reschedule my appointment to 5 PM.`,
                        `What time slots are available this week?`,
                        `Set an appointment for next Monday morning.`,
                    ]}
                    className="text-center text-lg text-white/70"
                />

            </div>
        </section >
    );
}
