# ResQLink Remaining Work

## P0 (Mandatory for Hackathon Demo)
- **Supabase Integration & Database**: Set up the real Supabase connection. Create a basic schema for `incidents`, `reports`, `zones`, and `mesh_messages` to replace in-memory storage.
- **End-to-End Data Flow**: Connect frontend React queries to the backend FastAPI (or directly to Supabase where appropriate) so that the Dashboard, Map, and Risk Engine use real data.
- **AI Vision Integration**: Ensure the YOLOv8 pipeline actually processes images (or fallback gracefully to a robust demo mode if weights/camera fail).
- **Risk Engine Wiring**: Ensure incident reports and AI detections feed into the risk engine and recalculate zone risks dynamically.
- **RescueMesh & Offline Flow**: 
  - Implement a real IndexedDB outbox queue in the frontend.
  - Implement a basic WebRTC (or polling-based) store-and-forward demo that actually caches messages when offline and syncs them when online.
- **AI Briefing**: Connect the AI briefing endpoint to a mock AI provider (or real OpenAI compatible provider) to generate reports based on actual current state, not mock strings.
- **Demo Mode / Simulation Tool**: Create a "Run Emergency Simulation" button that artificially injects a sequence of events (reports -> AI detections -> internet failure) into the real application state to drive the demo smoothly.

## P1 (Important)
- **Fix Frontend Tests**: Repair the 70 failing tests (e.g., missing `Clock` import in `RescueOperationsPage.tsx`, broken DOM queries).
- **Backend Tests**: Fix the Python environment setup script and get `pytest` running and passing for core risk/mesh logic.
- **Route Recommendations & Resource Allocation**: Connect the UI to the backend routing endpoints (even if using simulated/demo routing logic).
- **Documentation Updates**: Ensure `README.md`, `ARCHITECTURE.md`, `API.md` accurately reflect what is built.

## P2 (Optional Polish)
- Advanced map animations.
- Real peer-to-peer WebRTC signaling via Supabase Realtime or similar.
- Visual polish on empty/error states.
