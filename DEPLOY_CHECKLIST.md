# Deployment checklist

## This delivery

- Run npm ci, npm run check, npm run build and npm run test:e2e.
- Preview dist and directly load every route.
- Replace fictional contact/location details before a real prospect deployment.
- Verify the chosen host supports the pinned Node runtime.
- Publish the dist output with the supplied SPA and cache configuration.

## Final demo readiness (M8–M9, pending)

- Deploy the day before the presentation.
- Open once online on the demo phone and laptop; wait for service-worker precaching.
- Confirm all routes reload offline and install to the home screen.
- Run the golden path on the deployed URL.
- Confirm the real WhatsApp app receives the message.
- Use two tabs in the same browser profile for dashboard synchronization.
- Complete the ten-run offline rehearsal.
