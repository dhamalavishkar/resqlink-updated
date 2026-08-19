-- ResQLink Demo Data Seed
-- Sample data for demonstration purposes

-- Insert sample users
INSERT INTO users (email, full_name, role, phone, is_active) VALUES
('commander@resqlink.demo', 'Emergency Commander', 'admin', '+1-555-0100', TRUE),
('responder1@resqlink.demo', 'First Responder Alpha', 'responder', '+1-555-0101', TRUE),
('volunteer1@resqlink.demo', 'Community Volunteer', 'volunteer', '+1-555-0102', TRUE),
('citizen1@resqlink.demo', 'Concerned Citizen', 'citizen', '+1-555-0103', TRUE),
('drone_ops@resqlink.demo', 'Drone Operations', 'responder', '+1-555-0104', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insert sample incidents
INSERT INTO incidents (title, description, severity, location_lat, location_lng, reported_at, updated_at) VALUES
('Mumbai Urban Flooding', 'Heavy rainfall causing widespread flooding in low-lying areas affecting approximately 50,000 residents', 'HIGH', 19.0760, 72.8777, '2026-08-19 10:00:00+00', '2026-08-19 14:30:00+00'),
('Himalayan Earthquake', 'Magnitude 7.2 earthquake causing structural damage in remote mountain villages', 'CRITICAL', 30.3165, 78.0322, '2026-08-19 08:15:00+00', '2026-08-19 14:25:00+00'),
('Industrial Chemical Fire', 'Fire at chemical storage facility releasing toxic smoke, requiring evacuation of nearby residential areas', 'CRITICAL', 19.1200, 72.9500, '2026-08-19 09:30:00+00', '2026-08-19 14:20:00+00')
ON CONFLICT DO NOTHING;

-- Insert sample zones for Mumbai flooding incident
INSERT INTO zones (incident_id, name, risk_score, population, survivors_detected, fires_detected, damage_indicators, reports_count, location_lat, location_lng, radius_km, last_updated, updated_at)
SELECT
    i.id,
    'Zone A-01 - Downtown Mumbai',
    87,
    1200,
    12,
    1,
    2,
    8,
    19.0760,
    72.8777,
    1.5,
    '2026-08-19 14:28:00+00',
    '2026-08-19 14:30:00+00'
FROM incidents i
WHERE i.title = 'Mumbai Urban Flooding'
ON CONFLICT DO NOTHING;

INSERT INTO zones (incident_id, name, risk_score, population, survivors_detected, fires_detected, damage_indicators, reports_count, location_lat, location_lng, radius_km, last_updated, updated_at)
SELECT
    i.id,
    'Zone B-07 - Suburban Area',
    72,
    800,
    5,
    0,
    3,
    5,
    19.0500,
    72.8500,
    2.0,
    '2026-08-19 14:25:00+00',
    '2026-08-19 14:30:00+00'
FROM incidents i
WHERE i.title = 'Mumbai Urban Flooding'
ON CONFLICT DO NOTHING;

-- Insert sample zones for Himalayan earthquake incident
INSERT INTO zones (incident_id, name, risk_score, population, survivors_detected, fires_detected, damage_indicators, reports_count, location_lat, location_lng, radius_km, last_updated, updated_at)
SELECT
    i.id,
    'Zone C-03 - Village Cluster Alpha',
    92,
    500,
    25,
    0,
    8,
    12,
    30.3165,
    78.0322,
    1.0,
    '2026-08-19 14:20:00+00',
    '2026-08-19 14:30:00+00'
FROM incidents i
WHERE i.title = 'Himalayan Earthquake'
ON CONFLICT DO NOTHING;

-- Insert sample incident reports
INSERT INTO incident_reports (incident_id, reporter_type, title, description, location, severity, confidence, media_url, status, created_at, updated_at)
SELECT
    i.id,
    'Citizen',
    'Floating debris blocking main road',
    'Large tree trunk and debris blocking Oak Street near the river, preventing evacuation routes',
    'Oak Street & Riverbank',
    'HIGH',
    0.8,
    NULL,
    'NEW',
    '2026-08-19 14:25:00+00',
    '2026-08-19 14:25:00+00'
FROM incidents i
WHERE i.title = 'Mumbai Urban Flooding'
ON CONFLICT DO NOTHING;

INSERT INTO incident_reports (incident_id, reporter_type, title, description, location, severity, confidence, media_url, status, created_at, updated_at)
SELECT
    i.id,
    'Drone',
    'Survivors spotted on roof',
    'Three individuals waving for help on the roof of a collapsed building in the downtown area',
    'Building 42, Downtown Mumbai',
    'CRITICAL',
    0.95,
    NULL,
    'VERIFIED',
    '2026-08-19 14:20:00+00',
    '2026-08-19 14:20:00+00'
FROM incidents i
WHERE i.title = 'Mumbai Urban Flooding'
ON CONFLICT DO NOTHING;

INSERT INTO incident_reports (incident_id, reporter_type, title, description, location, severity, confidence, media_url, status, created_at, updated_at)
SELECT
    i.id,
    'AI Detection',
    'Fire detected in warehouse',
    'Thermal imaging shows active fire in Warehouse 7 near the industrial district',
    'Warehouse 7, Industrial District',
    'HIGH',
    0.91,
    NULL,
    'INVESTIGATING',
    '2026-08-19 14:15:00+00',
    '2026-08-19 14:15:00+00'
FROM incidents i
WHERE i.title = 'Mumbai Urban Flooding'
ON CONFLICT DO NOTHING;

-- Insert sample detections
INSERT INTO detections (incident_id, zone_id, class, confidence, bbox_x1, bbox_y1, bbox_x2, bbox_y2, source, location_lat, location_lng, detected_at, created_at)
SELECT
    i.id,
    z.id,
    'person',
    0.92,
    100.0,
    150.0,
    200.0,
    300.0,
    'drone',
    19.0750,
    72.8760,
    '2026-08-19 14:20:00+00',
    '2026-08-19 14:20:00+00'
FROM incidents i
JOIN zones z ON i.id = z.incident_id
WHERE i.title = 'Mumbai Urban Flooding' AND z.name = 'Zone A-01 - Downtown Mumbai'
ON CONFLICT DO NOTHING;

INSERT INTO detections (incident_id, zone_id, class, confidence, bbox_x1, bbox_y1, bbox_x2, bbox_y2, source, location_lat, location_lng, detected_at, created_at)
SELECT
    i.id,
    z.id,
    'person',
    0.87,
    300.0,
    100.0,
    400.0,
    250.0,
    'drone',
    19.0740,
    72.8780,
    '2026-08-19 14:18:00+00',
    '2026-08-19 14:18:00+00'
FROM incidents i
JOIN zones z ON i.id = z.incident_id
WHERE i.title = 'Mumbai Urban Flooding' AND z.name = 'Zone A-01 - Downtown Mumbai'
ON CONFLICT DO NOTHING;

INSERT INTO detections (incident_id, zone_id, class, confidence, bbox_x1, bbox_y1, bbox_x2, bbox_y2, source, location_lat, location_lng, detected_at, created_at)
SELECT
    i.id,
    z.id,
    'fire',
    0.91,
    400.0,
    200.0,
    500.0,
    350.0,
    'satellite',
    19.0700,
    72.8800,
    '2026-08-19 14:15:00+00',
    '2026-08-19 14:15:00+00'
FROM incidents i
JOIN zones z ON i.id = z.incident_id
WHERE i.title = 'Mumbai Urban Flooding' AND z.name = 'Zone A-01 - Downtown Mumbai'
ON CONFLICT DO NOTHING;

-- Insert sample resources
INSERT INTO resources (incident_id, type, name, status, location, location_lat, location_lng, assigned_zone_id, eta_minutes, capacity, updated_at, created_at)
SELECT
    i.id,
    'ambulance',
    'Ambulance 01',
    'available',
    'Central Hospital',
    19.0800,
    72.8800,
    NULL,
    NULL,
    '2 patients',
    '2026-08-19 14:28:00+00',
    '2026-08-19 14:30:00+00'
FROM incidents i
LEFT JOIN zones z ON i.id = z.incident_id AND z.name = 'Zone A-01 - Downtown Mumbai'
WHERE i.title = 'Mumbai Urban Flooding'
ON CONFLICT DO NOTHING;

INSERT INTO resources (incident_id, type, name, status, location, location_lat, location_lng, assigned_zone_id, eta_minutes, capacity, updated_at, created_at)
SELECT
    i.id,
    'fire_truck',
    'Fire Truck 07',
    'deployed',
    'En route to Zone A-01',
    19.0720,
    72.8750,
    z.id,
    5,
    '1500 gal water',
    '2026-08-19 14:25:00+00',
    '2026-08-19 14:30:00+00'
FROM incidents i
JOIN zones z ON i.id = z.incident_id AND z.name = 'Zone A-01 - Downtown Mumbai'
WHERE i.title = 'Mumbai Urban Flooding'
ON CONFLICT DO NOTHING;

INSERT INTO resources (incident_id, type, name, status, location, location_lat, location_lng, assigned_zone_id, eta_minutes, capacity, updated_at, created_at)
SELECT
    i.id,
    'medical_unit',
    'Medical Unit 03',
    'available',
    'West Clinic',
    19.0600,
    72.8600,
    NULL,
    NULL,
    '4 patients',
    '2026-08-19 14:26:00+00',
    '2026-08-19 14:30:00+00'
FROM incidents i
LEFT JOIN zones z ON i.id = z.incident_id AND z.name = 'Zone B-07 - Suburban Area'
WHERE i.title = 'Mumbai Urban Flooding'
ON CONFLICT DO NOTHING;

-- Insert sample rescue teams
INSERT INTO rescue_teams (incident_id, name, type, status, location_lat, location_lng, assigned_zone_id, personnel_count, equipment, updated_at, created_at)
SELECT
    i.id,
    'SAR Team Alpha',
    'SAR',
    'deployed',
    19.0730,
    72.8760,
    z.id,
    6,
    '["rope_kit", "first_aid", "flashlights", "radio"]'::jsonb,
    '2026-08-19 14:22:00+00',
    '2026-08-19 14:30:00+00'
FROM incidents i
JOIN zones z ON i.id = z.incident_id AND z.name = 'Zone A-01 - Downtown Mumbai'
WHERE i.title = 'Mumbai Urban Flooding'
ON CONFLICT DO NOTHING;

INSERT INTO rescue_teams (incident_id, name, type, status, location_lat, location_lng, assigned_zone_id, personnel_count, equipment, updated_at, created_at)
SELECT
    i.id,
    'Medical Team Beta',
    'MEDICAL',
    'available',
    19.0550,
    72.8520,
    NULL,
    4,
    '["defibrillator", "iv_kits", "oxygen_tanks", "triage_tags"]'::jsonb,
    '2026-08-19 14:24:00+00',
    '2026-08-19 14:30:00+00'
FROM incidents i
WHERE i.title = 'Mumbai Urban Flooding'
ON CONFLICT DO NOTHING;

-- Insert sample mesh devices
INSERT INTO mesh_devices (incident_id, user_id, device_id, device_name, status, location_lat, location_lng, queued_messages, delivered_messages, updated_at, created_at)
SELECT
    i.id,
    u.id,
    'device-001',
    'Commander Tablet',
    'connected',
    19.0760,
    72.8777,
    0,
    12,
    '2026-08-19 14:30:00+00',
    '2026-08-19 14:30:00+00'
FROM incidents i
JOIN users u ON u.email = 'commander@resqlink.demo'
WHERE i.title = 'Mumbai Urban Flooding'
ON CONFLICT (device_id) DO NOTHING;

INSERT INTO mesh_devices (incident_id, user_id, device_id, device_name, status, location_lat, location_lng, queued_messages, delivered_messages, updated_at, created_at)
SELECT
    i.id,
    u.id,
    'device-002',
    'Responder Radio',
    'connected',
    19.0720,
    72.8750,
    2,
    8,
    '2026-08-19 14:30:00+00',
    '2026-08-19 14:30:00+00'
FROM incidents i
JOIN users u ON u.email = 'responder1@resqlink.demo'
WHERE i.title = 'Mumbai Urban Flooding'
ON CONFLICT (device_id) DO NOTHING;

INSERT INTO mesh_devices (incident_id, user_id, device_id, device_name, status, location_lat, location_lng, queued_messages, delivered_messages, updated_at, created_at)
SELECT
    i.id,
    u.id,
    'device-003',
    'Drone Controller',
    'disconnected',
    19.0800,
    72.8800,
    5,
    3,
    '2026-08-19 14:30:00+00',
    '2026-08-19 14:30:00+00'
FROM incidents i
JOIN users u ON u.email = 'drone_ops@resqlink.demo'
WHERE i.title = 'Mumbai Urban Flooding'
ON CONFLICT (device_id) DO NOTHING;

-- Insert sample mesh messages
INSERT INTO mesh_messages (incident_id, sender_id, receiver_id, content, priority, status, ttl, hop_count, route_history, created_at, updated_at)
SELECT
    i.id,
    sender.id,
    receiver.id,
    'Requesting medical evacuation for Zone A-01 - 12 survivors trapped, need immediate assistance',
    'CRITICAL',
    'DELIVERED',
    10,
    1,
    '["device-001", "device-002"]'::jsonb,
    '2026-08-19 14:28:00+00',
    '2026-08-19 14:28:00+00'
FROM incidents i
JOIN users sender ON sender.email = 'responder1@resqlink.demo'
JOIN users receiver ON receiver.email = 'commander@resqlink.demo'
WHERE i.title = 'Mumbai Urban Flooding'
ON CONFLICT DO NOTHING;

INSERT INTO mesh_messages (incident_id, sender_id, receiver_id, content, priority, status, ttl, hop_count, route_history, created_at, updated_at)
SELECT
    i.id,
    sender.id,
    receiver.id,
    'Fire spreading north from industrial zone, need additional units and evacuation of Block B',
    'HIGH',
    'QUEUED',
    10,
    0,
    '["device-001"]'::jsonb,
    '2026-08-19 14:25:00+00',
    '2026-08-19 14:25:00+00'
FROM incidents i
JOIN users sender ON sender.email = 'drone_ops@resqlink.demo'
JOIN users receiver ON receiver.email = 'commander@resqlink.demo'
WHERE i.title = 'Mumbai Urban Flooding'
ON CONFLICT DO NOTHING;

-- Insert sample AI briefing
INSERT INTO ai_briefings (incident_id, title, content, generated_by, data_snapshot, created_at)
SELECT
    i.id,
    'Emergency Situation Briefing - Mumbai Flooding',
    '**SITUATION BRIEFING - RESQLINK**
Generated at: 2026-08-19 14:30:00+00

**1. SITUATION SUMMARY**
At 14:30, two high-priority zones were identified in the Mumbai flooding incident. Survivor detections indicate 17 people requiring assistance across affected zones. Fire risk is contained to one industrial zone. Structural damage is moderate in downtown areas.

**2. CRITICAL INCIDENTS**
- Zone A-01: Downtown area with 12 survivors trapped in collapsed buildings, active fire in adjacent structure, and flooding preventing evacuation.
- Zone B-07: Suburban area with 5 residents reporting isolation due to flooded roads, medical supplies running low.

**3. SURVIVOR STATUS**
- Total Detected: 17 survivors
- Requiring Immediate Rescue: 12
- Requiring Medical Attention: 5
- Status Unknown: 0

**4. FIRE/STRUCTURAL HAZARDS**
- Active Fires: 1 location (Industrial District)
- Structural Damage: 5 buildings with moderate to severe damage
- Flooding: Widespread affecting 80% of downtown area

**5. RESOURCE REQUIREMENTS**
- Search and Rescue Teams: 2 teams needed immediately
- Medical Units: 2 units for trauma care
- Fire Response: 1 engine company, 1 ladder truck
- Evacuation Vehicles: 4 high-waiver vehicles for flood zones
- Supplies: Sandbags, pumps, medical kits, food/water for 20 people for 24 hours

**6. RECOMMENDED ACTIONS**
1. IMMEDIATE (Next 30 minutes):
   - Deploy SAR Team Alpha to Zone A-01 for victim extraction
   - Initiate fire suppression in industrial zone
   - Begin evacuation of Zone B-07 using high-waiver vehicles
   - Establish medical triage at Central Hospital

2. SHORT TERM (Next 2 hours):
   - Deploy additional SAR teams to surrounding areas
   - Set up temporary shelter at Mumbai Central School
   - Begin damage assessment of all critical infrastructure
   - Establish supply chain for ongoing operations

**NOTE: This briefing is generated by AI decision support systems. All recommendations should be reviewed by qualified emergency personnel before implementation.**',
    'mock',
    '{"zones_count": 2, "reports_count": 3, "detections_count": 3, "resources_count": 3}'::jsonb,
    '2026-08-19 14:30:00+00'
FROM incidents i
WHERE i.title = 'Mumbai Urban Flooding'
ON CONFLICT DO NOTHING;

-- Insert sample route recommendation
INSERT INTO route_recommendations (incident_id, start_lat, start_lng, end_lat, end_lng, distance_km, estimated_time_minutes, route_geometry, avoided_hazards, safety_score, created_at)
SELECT
    i.id,
    19.0760,
    72.8777,
    19.0850,
    72.8900,
    1.8,
    5.4,
    '{"type": "LineString", "coordinates": [[72.8777, 19.0760], [72.8800, 19.0780], [72.8850, 19.0810], [72.8900, 19.0850]]}'::jsonb,
    ' [{"lat": 19.0800, "lng": 72.8800, "radius_km": 1.0, "name": "Flooded Intersection"}]'::jsonb,
    85,
    '2026-08-19 14:30:00+00'
FROM incidents i
WHERE i.title = 'Mumbai Urban Flooding'
ON CONFLICT DO NOTHING;