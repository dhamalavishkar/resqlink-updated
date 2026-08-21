# ResQLink

**See the disaster. Connect the people. Coordinate the rescue.**

## Project Overview

ResQLink is an Emergency Intelligence Platform / Disaster Response Decision Support System built for hackathon demonstration. It integrates computer vision, offline peer-to-peer communication, AI-driven risk analysis, and resource allocation to provide a comprehensive command-center style dashboard for emergency responders.

## The Four Pillars

### SEE
- Computer vision analysis of drone/CCTV/disaster footage
- Detects survivors, fires, and structural damage
- Generates detection confidence scores and geographic associations

### CONNECT
- Offline communication between nearby devices using WebRTC
- Store-and-forward messaging with message deduplication
- Visible "Offline Mode" / "Mesh Mode" indicators
- Peer discovery and pairing mechanisms

### THINK
- Fuses computer vision detections with human reports and incident metadata
- Calculates risk scores for affected zones using configurable weighting
- Ranks zones by urgency and explains risk factors

### ACT
- Shows recommended rescue routes and resource allocation
- Generates AI incident briefings from multi-source data
- Clearly labels AI-generated content as decision support

## Key Features

- Real-time disaster map with hazard overlays
- AI-powered object detection (Gemini Pro Vision) for survivor/fire/damage detection
- Configurable risk scoring engine with explainable outputs
- Peer-to-peer mesh network with store-and-forward capabilities
- AI-generated situation briefings using Gemini LLM
- Resource allocation and route recommendation system
- Offline-first architecture with IndexedDB and service workers
- Supabase backend for data persistence and synchronization
- Demo mode with simulated disaster scenarios

## Technology Stack

- **Frontend**: React 19+, TypeScript, Vite, Tailwind CSS, Leaflet/React Leaflet
- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic, Supabase Python client
- **Streamlit**: Optional AI/model testing dashboard
- **Database**: Supabase PostgreSQL (with persistent in-memory fallbacks for demo stability)
- **Computer Vision & GenAI**: Google Gemini Pro Vision API
- **Maps**: OpenStreetMap tiles via Leaflet
- **Offline Communication**: WebRTC RTCPeerConnection, IndexedDB, store-and-forward logic
- **Testing**: Vitest, React Testing Library (frontend); Pytest (backend)

## System Workflow

1. **Data Ingestion**: Vision systems, citizen reports, and sensor data feed into the system
2. **Processing**: 
   - Computer vision analyzes media for hazards and survivors
   - Reports are geolocated and timestamped
   - Mesh network shares information between devices
3. **Analysis**: 
   - Risk engine calculates zone severities
   - AI briefings synthesize multi-source data
   - Route optimization avoids high-risk areas
4. **Action**: 
   - Dashboard displays actionable intelligence
   - Resource recommendations guide deployment
   - Communication status connects responders

## Installation

See the **Running Locally** section below for detailed setup instructions.

## Running Locally

1. Clone the repository
2. Configure environment variables (see `.env.example`)
3. Set up Supabase database
4. Install frontend dependencies: `cd frontend && npm install`
5. Install backend dependencies: `cd backend && pip install -r requirements.txt`
6. Start the backend: `cd backend && uvicorn app.main:app --reload`
7. Start the frontend: `cd frontend && npm run dev`
8. Optional: Start Streamlit dashboard: `cd streamlit && streamlit run app.py`

## Demo Mode

Enable demo mode by setting `DEMO_MODE=true` in your environment variables. This will:
- Seed realistic emergency data
- Simulate incoming reports and changing conditions
- Activate mesh network simulation
- Provide sample data for computer vision

Run the demo simulation: `python scripts/run_demo.py`

## Testing

- Frontend: `cd frontend && npm test`
- Backend: `cd backend && pytest`

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture details
- [docs/OFFLINE_MESH.md](docs/OFFLINE_MESH.md) - Mesh communication explanation
- [docs/AI_PIPELINE.md](docs/AI_PIPELINE.md) - AI and computer vision pipeline
- [docs/DATABASE.md](docs/DATABASE.md) - Database schema and relationships

## Limitations

- WebRTC requires a signaling mechanism for peer connection (implemented via a centralized Node/Python signaling server)
- Offline mesh requires both devices to have loaded the web app into cache prior to losing internet.

## Safety Disclaimer

ResQLink is a decision support tool. All AI-generated recommendations and risk scores must be reviewed by qualified emergency personnel before action. This system does not replace professional judgment or emergency protocols.

## Future Roadmap

- Integration with actual drone and CCTV feeds
- Custom YOLOv8 models for disaster-specific object detection
- Production-ready mesh networking with Bluetooth/Wi-Fi direct
- Mobile application deployment (React Native)
- Advanced route optimization with real-time traffic data
- Multilingual support for international deployments

## Contributors

- [Your Name] - Lead Architect & Full-Stack Engineer

## License

[MIT](LICENSE)