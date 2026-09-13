# Stop voice quota failures from crashing Totland

## What will change

- Treat an exhausted or rejected ElevenLabs allowance as “voice temporarily unavailable” instead of throwing an app-wide error.
- Return a small unavailable response from the voice request and immediately use the device’s built-in voice for the child.
- Add a session-level circuit breaker after the first quota/auth denial so background voice downloads stop and do not send dozens of identical requests.
- Keep already-downloaded Hannah clips working normally, including offline.
- Verify the app builds and that a simulated unavailable voice response does not produce an unhandled error or blank screen.

## Technical details

- Update the voice server function to classify ElevenLabs `401`, `402`, `403`, and `429` responses without exposing provider details to the browser or throwing for expected availability failures.
- Return a discriminated result (`audio` or `unavailable`) and update the speech cache path to handle both safely.
- Persist the blocked state only for the current browser session, allowing a future app launch to try again after credits are restored.
