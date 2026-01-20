# Eternal
A repository contains frontend for an appointment booking voice AI agent.

## Environment variables (Frontend)
1. Expose the LiveKit server URL (public) using NEXT_PUBLIC_* variable. It must be public as the browser client needs this URL to connect directly to the LiveKit server. URL is not a creddential, just the address of LiveKit endpoint so it's safe to expose it publicly.
2. Set the LiveKit API Key private (server-only)
3. Set the LiveKit API Secret private (server-only)

## Want to talk with Eternal
[Click here](https://tryeternal.vercel.app)