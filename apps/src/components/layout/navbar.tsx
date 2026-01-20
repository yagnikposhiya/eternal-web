/*
    author: Yagnik Poshiya
    github: https://github.com/yagnikposhiya/eternal-web
*/

"use client";

import Image from "next/image";

type NavbarProps = {
    tooltipText?: string;
    logoSrc?: string;
    logoAlt?: string;
};

export default function Navbar(props: NavbarProps) {
    const tooltipText =
        props.tooltipText ??
        "Click that red mic, drop a room name, and ...boom... you're face-to-voice with Eternal.";

    const logoSrc = props.logoSrc ?? "/logo/2.png";
    const logoAlt = props.logoAlt ?? "SuperBryn";

    return (
        <header className="absolute left-0 top-0 z-20 w-full bg-transparent">
            <div className="flex w-full items-center justify-between px-6 py-5">
                {/* Left: Logo */}
                <div className="flex items-center">
                    <Image
                        src={logoSrc}
                        alt={logoAlt}
                        width={150}
                        height={360}
                        priority
                        className="h-16 w-auto select-none"
                    />
                </div>

                {/* Right: Help / Tooltip */}
                <div className="relative group">
                    <button
                        type="button"
                        aria-label="Help"
                        className="cursor-pointer grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-black/70 text-white backdrop-blur-md transition hover:bg-white/15"
                    >
                        <span className="text-2xl font-semibold">!</span>
                    </button>

                    {/* Tooltip */}
                    <div className="pointer-events-none absolute right-0 top-full z-50 mt-3 w-[320px]
                        opacity-0 -translate-y-1 scale-95
                        transition-all duration-500 ease-out
                        group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100">

                        <div className="rounded-2xl border border-white/15 bg-black/60 p-4 text-sm text-white shadow-xl backdrop-blur-md">
                            <div className="font-semibold">How to use !</div>
                            <div className="my-2 h-px w-full bg-white/15" />
                            <p className="mt-1 text-white/85">{tooltipText}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
