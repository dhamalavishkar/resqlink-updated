# ResQLink Future Roadmap & Remaining Work

The core ResQLink MVP is now complete and fully functional for demonstration. The following items represent future enhancements for a production-ready V2 release.

## P1 (Production Readiness)
- **Native Mobile Apps (React Native / Flutter)**: The Rescue Mesh currently relies on web technologies (WebRTC/localStorage). For true disconnected peer-to-peer data transfer in a real disaster (where no signaling server exists), a native mobile app is required to utilize Bluetooth Low Energy (BLE) and Wi-Fi Direct APIs.
- **Robust Authentication & Roles**: Implement Supabase Auth to securely distinguish between Admins, First Responders, and Citizens, restricting who can verify incidents and dispatch teams.
- **Production Database Migration**: Move entirely away from the in-memory fallback mechanisms (currently used for demo stability) and rely strictly on Supabase with robust Row Level Security (RLS) policies and offline syncing (e.g., using WatermelonDB).

## P2 (Advanced Features)
- **Drone Video Streams**: Enhance the AI Vision component to accept and process live RTSP video feeds from reconnaissance drones, rather than just static image uploads.
- **Advanced Route Optimization**: Integrate a real routing engine (like OSRM or Mapbox) that dynamically recalculates pathing for rescue vehicles based on real-time flood waters or blocked roads reported on the Live Map.
- **Push Notifications**: Integrate Firebase Cloud Messaging (FCM) or Apple Push Notification service (APNs) to alert off-duty responders immediately when a critical incident is verified in their sector.

## P3 (Maintenance & Code Health)
- **Test Suite Overhaul**: The UI has undergone a massive premium redesign. The existing test suite needs to be updated to match the new component structures (e.g., the new HTML tables, custom buttons, and glassmorphic layouts).
- **Internationalization (i18n)**: Fully populate the `react-i18next` translation files to support multiple regional languages common in disaster-prone areas (e.g., Hindi, Bengali, Spanish).
