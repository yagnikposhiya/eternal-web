/* 
    author: Yagnik Poshiya
    github: https://github.com/yagnikposhiya/eternal-web
*/

"use client";

import { useEffect, useMemo, useState } from "react";
import { useDataChannel } from "@livekit/components-react";
import { CheckCircle2, XCircle } from "lucide-react";

type ToolEvent = {
    type: "tool_event";
    session_id: string;
    tool: string;
    input: any;
    output: any;
    ok: boolean;
    error_message?: string | null;
    ts: string;
};

function titleCase(s: string) {
    return s
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ToolEventsPanel() {
    const [events, setEvents] = useState<ToolEvent[]>([]);
    const { message } = useDataChannel("tool_events");

    /* Map tool name -> user-friendly label */
    const toolLabel = useMemo(() => {
        const map: Record<string, string> = {
            identify_user: "User identification",
            retrieve_appointments: "Retrieve appointments",
            create_appointment: "Book appointment",
            update_appointment: "Update appointment",
            delete_appointment: "Cancel appointment",
            end_conversation: "End conversation",
        };

        return (tool: string) => map[tool] ?? titleCase(tool);
    }, []);

    useEffect(() => {
        if (!message) return;

        try {
            const txt = new TextDecoder().decode(message.payload);
            const ev = JSON.parse(txt) as ToolEvent;

            if (ev?.type === "tool_event") {
                /* Keep latest on top */
                setEvents((prev) => [ev, ...prev].slice(0, 50));
            }
        } catch {
            /* ignore malformed packets */
        }
    }, [message]);

    if (events.length === 0) {
        return (
            <div className="text-sm text-white/70">
                No tool calls are made yet.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {events.map((e, idx) => (
                <div
                    key={idx}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                >
                    {e.ok ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                    ) : (
                        <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                    )}

                    <div className="min-w-0">
                        <div className="text-sm font-medium text-white">
                            {toolLabel(e.tool)}
                        </div>

                        {/* Flag: show short error only (no JSON) */}
                        {!e.ok && e.error_message ? (
                            <div className="mt-0.5 text-xs text-red-300/90 line-clamp-2">
                                {e.error_message}
                            </div>
                        ) : null}
                    </div>
                </div>
            ))}
        </div>
    );
}
