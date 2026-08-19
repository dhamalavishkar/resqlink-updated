-- ResQLink Database Schema
-- Emergency Intelligence Platform / Disaster Response Decision Support System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for responders, volunteers, etc.)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) CHECK (role IN ('admin', 'responder', 'volunteer', 'citizen')) DEFAULT 'citizen',
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incidents table (major disaster events)
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) CHECK (severity IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')) DEFAULT 'NORMAL',
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    reported_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incident reports table (field reports from citizens, responders, drones, etc.)
CREATE TABLE IF NOT EXISTS incident_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    reporter_type VARCHAR(20) CHECK (reporter_type IN ('Citizen', 'Volunteer', 'Responder', 'Drone', 'AI Detection', 'CCTV')) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    severity VARCHAR(20) CHECK (severity IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')) DEFAULT 'NORMAL',
    confidence DOUBLE PRECISION CHECK (confidence >= 0 AND confidence <= 1),
    media_url TEXT,  -- URL to stored media in Supabase Storage
    status VARCHAR(20) CHECK (status IN ('NEW', 'VERIFIED', 'INVESTIGATING', 'RESOLVED', 'REJECTED')) DEFAULT 'NEW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Zones table (geographic areas for risk assessment)
CREATE TABLE IF NOT EXISTS zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    name VARCHAR(100),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    severity VARCHAR(20) GENERATED ALWAYS AS (
        CASE
            WHEN risk_score >= 80 THEN 'CRITICAL'
            WHEN risk_score >= 60 THEN 'HIGH'
            WHEN risk_score >= 40 THEN 'MEDIUM'
            WHEN risk_score >= 20 THEN 'LOW'
            ELSE 'SAFE'
        END
    ) STORED,
    population INTEGER DEFAULT 0,
    survivors_detected INTEGER DEFAULT 0,
    fires_detected INTEGER DEFAULT 0,
    damage_indicators INTEGER DEFAULT 0,
    reports_count INTEGER DEFAULT 0,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 1.0,  -- For circular zones
    last_updated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Detections table (AI computer vision results)
CREATE TABLE IF NOT EXISTS detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    class VARCHAR(100) NOT NULL,  -- e.g., 'person', 'fire', 'car'
    confidence DOUBLE PRECISION CHECK (confidence >= 0 AND confidence <= 1) NOT NULL,
    bbox_x1 DOUBLE PRECISION,  -- Bounding box coordinates
    bbox_y1 DOUBLE PRECISION,
    bbox_x2 DOUBLE PRECISION,
    bbox_y2 DOUBLE PRECISION,
    source VARCHAR(50) CHECK (source IN ('drone', 'satellite', 'cctv', 'ground', 'upload')) NOT NULL,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources table (ambulances, fire trucks, medical units, etc.)
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,  -- e.g., 'ambulance', 'fire_truck', 'medical_unit', 'sar_team'
    name VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('available', 'deployed', 'maintenance', 'offline')) DEFAULT 'available',
    location VARCHAR(255),
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    assigned_zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    eta_minutes INTEGER,  -- Estimated time to arrival in minutes
    capacity VARCHAR(100),  -- e.g., '2 patients', '1500 gal water'
    last_updated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rescue teams table (specialized teams)
CREATE TABLE IF NOT EXISTS rescue_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('SAR', 'MEDICAL', 'FIRE', 'EVACUATION', 'LOGISTICS')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('available', 'deployed', 'maintenance', 'offline')) DEFAULT 'available',
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    assigned_zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    personnel_count INTEGER DEFAULT 0,
    equipment JSONB,  -- Flexible equipment listing
    last_updated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mesh messages table (for store-and-forward messaging)
CREATE TABLE IF NOT EXISTS mesh_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    receiver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    priority VARCHAR(10) CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')) DEFAULT 'NORMAL',
    incident_ref VARCHAR(100),  -- Reference to specific incident
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    status VARCHAR(20) CHECK (status IN ('CREATED', 'QUEUED', 'FORWARDED', 'DELIVERED', 'EXPIRED')) DEFAULT 'CREATED',
    ttl INTEGER DEFAULT 10,  -- Time to live in hops
    hop_count INTEGER DEFAULT 0,
    route_history JSONB,  -- Array of peer IDs that handled this message
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mesh devices table (track nodes in the mesh network)
CREATE TABLE IF NOT EXISTS mesh_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    device_id VARCHAR(255) UNIQUE NOT NULL,  -- Unique device identifier
    device_name VARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('connected', 'disconnected', 'connecting')) DEFAULT 'disconnected',
    last_seen TIMESTAMP WITH TIME ZONE,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    queued_messages INTEGER DEFAULT 0,
    delivered_messages INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI briefings table (store generated briefings)
CREATE TABLE IF NOT EXISTS ai_briefings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    generated_by VARCHAR(50) CHECK (generated_by IN ('mock', 'gemini', 'openai')) DEFAULT 'mock',
    data_snapshot JSONB,  -- Store the data used to generate this briefing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Route recommendations table (store calculated routes)
CREATE TABLE IF NOT EXISTS route_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    start_lat DOUBLE PRECISION NOT NULL,
    start_lng DOUBLE PRECISION NOT NULL,
    end_lat DOUBLE PRECISION NOT NULL,
    end_lng DOUBLE PRECISION NOT NULL,
    distance_km DOUBLE PRECISION,
    estimated_time_minutes DOUBLE PRECISION,
    route_geometry JSONB,  -- Store the route as GeoJSON LineString or similar
    avoided_hazards JSONB,  -- Store list of avoided hazard zones
    safety_score INTEGER CHECK (safety_score >= 0 AND safety_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table (for tracking important actions)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    changes JSONB,  -- Store what changed
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_type ON incident_reports(reporter_type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON incident_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_location ON incident_reports(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_zones_risk_score ON zones(risk_score);
CREATE INDEX IF NOT EXISTS idx_zones_severity ON zones(severity);
CREATE INDEX IF NOT EXISTS idx_zones_location ON zones(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_detections_class ON detections(class);
CREATE INDEX IF NOT EXISTS idx_detections_confidence ON detections(confidence);
CREATE INDEX IF NOT EXISTS idx_detections_location ON detections(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_detections_detected_at ON detections(detected_at);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_location ON resources(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_mesh_messages_status ON mesh_messages(status);
CREATE INDEX IF NOT EXISTS idx_mesh_messages_priority ON mesh_messages(priority);
CREATE INDEX IF NOT EXISTS idx_mesh_messages_created_at ON mesh_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_mesh_devices_status ON mesh_devices(status);
CREATE INDEX IF NOT EXISTS idx_mesh_devices_last_seen ON mesh_devices(last_seen);
CREATE INDEX IF NOT EXISTS idx_ai_briefings_created_at ON ai_briefings(created_at);
CREATE INDEX IF NOT EXISTS idx_route_recommendations_created_at ON route_recommendations(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescue_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesh_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesh_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies would be defined here based on authentication requirements
-- For simplicity in MVP, we'll allow all operations (in production, these would be more restrictive)

CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on incidents" ON incidents FOR ALL USING (true);
CREATE POLICY "Allow all operations on incident_reports" ON incident_reports FOR ALL USING (true);
CREATE POLICY "Allow all operations on zones" ON zones FOR ALL USING (true);
CREATE POLICY "Allow all operations on detections" ON detections FOR ALL USING (true);
CREATE POLICY "Allow all operations on resources" ON resources FOR ALL USING (true);
CREATE POLICY "Allow all operations on rescue_teams" ON rescue_teams FOR ALL USING (true);
CREATE POLICY "Allow all operations on mesh_messages" ON mesh_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on mesh_devices" ON mesh_devices FOR ALL USING (true);
CREATE POLICY "Allow all operations on ai_briefings" ON ai_briefings FOR ALL USING (true);
CREATE POLICY "Allow all operations on route_recommendations" ON route_recommendations FOR ALL USING (true);
CREATE POLICY "Allow all operations on audit_logs" ON audit_logs FOR ALL USING (true);