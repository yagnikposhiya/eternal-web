# Eternal
A repository contains frontend for an appointment booking voice AI agent. Backend is available [here].(https://github.com/yagnikposhiya/eternal-agent)

<img width="1366" height="768" alt="Talk-with-Eternal" src="https://github.com/user-attachments/assets/9772738e-48cd-4aa3-8e03-c7790e29be80" />

## Environment variables (Frontend)
1. Expose the LiveKit server URL (public) using NEXT_PUBLIC_* variable. It must be public as the browser client needs this URL to connect directly to the LiveKit server. URL is not a creddential, just the address of LiveKit endpoint so it's safe to expose it publicly.
2. Set the LiveKit API Key private (server-only)
3. Set the LiveKit API Secret private (server-only)

## Limitations (but working on it)
1. The user may need to wait a little longer while the system connects to the room.
2. At the end of the conversation, the user will experience a brief 4–5 second delay before the summary appears on screen. This delay is part of the system’s processing workflow.
3. The system does not provide cost or price estimations at the end of a call.
4. The system can handle up to 15 concurrent booking sessions at a time.

## Want to talk with Eternal
[Click here](https://tryeternal.vercel.app)
