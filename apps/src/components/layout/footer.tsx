/*
    author: Yagnik Poshiya
    github: https://github.com/yagnikposhiya/eternal-web
*/

"use client";

export default function Footer() {
    return (
        <footer className="w-full bg-transparent">
            <div className="mx-auto flex w-full max-w-6xl justify-center px-6 pb-3 pt-4">
                <div className="text-sm font-semibold text-white">
                    &copy; {new Date().getFullYear()} SuperBryn. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
