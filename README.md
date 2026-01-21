# Eternal
A repository contains frontend for an appointment booking voice AI agent. Backend is available [here].(https://github.com/yagnikposhiya/eternal-agent)

## Environment variables (Frontend)
1. Expose the LiveKit server URL (public) using NEXT_PUBLIC_* variable. It must be public as the browser client needs this URL to connect directly to the LiveKit server. URL is not a creddential, just the address of LiveKit endpoint so it's safe to expose it publicly.
2. Set the LiveKit API Key private (server-only)
3. Set the LiveKit API Secret private (server-only)

## Limitations (but working on it)
1. Users must state the complete date, including the day, month, and year. Partial dates such as “21 January” are not accepted—“21 January 2026” is required.
2. Users can book an appointment only within a 15-day window from the current date.
3. At the end of the conversation, the user will experience a brief 4–5 second delay before the summary appears on screen. This delay is part of the system’s processing workflow.
4. The system does not provide cost or price estimations at the end of a call.
5. The system can handle up to 15 concurrent booking sessions at a time.

## Want to talk with Eternal
[Click here](https://tryeternal.vercel.app)