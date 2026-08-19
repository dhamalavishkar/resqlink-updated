# ResQLink Database Design

## Overview

ResQLink uses Supabase (PostgreSQL) as its primary database for storing persistent data related to incidents, resources, reports, and AI-generated content. This document describes the database schema, relationships, and design decisions.

## Schema Overview

The database consists of 13 core tables that model the emergency response ecosystem:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│     users       │    │   incidents      │    │  incident_reports │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        ▲                       ▲                         ▲
        │                       │                         │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ mesh_devices    │    │      zones       │    │    detections   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        ▲                       ▲                         ▲
        │                       │                         │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ mesh_messages   │    │   resources      │    │ rescue_teams    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        ▲                       ▲                         ▲
        │                       │                         │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ ai_briefings    │    │ route_recommendations │ audit_logs    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Detailed Table Descriptions

### Users
Stores information about system users (responders, volunteers, administrators, etc.)

**Key Columns:**
- `id`: UUID primary key
- `email`: Unique email address for authentication
- `full_name`: User's full name
- `role`: User role (admin, responder, volunteer, citizen)
- `phone`: Contact phone number
- `is_active`: Account status flag
- `last_login_at`: Timestamp of last login
- `created_at`, `updated_at`: Audit timestamps

### Incidents
Represents major disaster events that trigger emergency response operations.

**Key Columns:**
- `id`: UUID primary key
- `title`: Short incident name (e.g., "Mumbai Urban Flooding")
- `description`: Detailed incident description
- `severity`: Overall incident severity (LOW, NORMAL, HIGH, CRITICAL)
- `location_lat`, `location_lng`: Geographic coordinates of incident center
- `reported_at`: When the incident was first reported
- `updated_at`: Last update timestamp
- `created_at`: Record creation timestamp

### Incident Reports
Field reports from various sources about specific observations or needs.

**Key Columns:**
- `id`: UUID primary key
- `incident_id`: Foreign key to incidents table
- `reporter_type`: Source of report (Citizen, Volunteer, Responder, Drone, AI Detection, CCTV)
- `title`: Short report title
- `description`: Detailed description of what was observed
- `location`: Text description of location
- `location_lat`, `location_lng`: Geographic coordinates
- `severity`: Report severity level (LOW, NORMAL, HIGH, CRITICAL)
- `confidence`: Numerical confidence score (0.0-1.0)
- `media_url`: URL to stored media in Supabase Storage
- `status`: Report processing status (NEW, VERIFIED, INVESTIGATING, RESOLVED, REJECTED)
- `created_at`, `updated_at`: Audit timestamps

### Zones
Geographic subdivisions of an incident area used for risk assessment and resource allocation.

**Key Columns:**
- `id`: UUID primary key
- `incident_id`: Foreign key to incidents table
- `name`: Zone identifier (e.g., "Zone A-01")
- `risk_score`: Calculated risk score (0-100)
- `severity`: Derived from risk_score (CRITICAL, HIGH, MEDIUM, LOW, SAFE)
- `population`: Estimated number of people in zone
- `survivors_detected`: Number of survivors detected in zone
- `fires_detected`: Number of active fires in zone
- `damage_indicators`: Number of structural damage indicators
- `reports_count`: Number of field reports in zone
- `location_lat`, `location_lng`: Zone center coordinates
- `radius_km`: Radius defining zone extent (for circular zones)
- `last_updated`: Timestamp of last data update
- `created_at`, `updated_at`: Audit timestamps

### Detections
AI-generated object detections from computer vision processing of imagery.

**Key Columns:**
- `id`: UUID primary key
- `incident_id`: Foreign key to incidents table
- `zone_id`: Foreign key to zones table (optional)
- `class`: Detected object class (person, fire, car, etc.)
- `confidence`: Detection confidence score (0.0-1.0)
- `bbox_x1`, `bbox_y1`, `bbox_x2`, `bbox_y2`: Bounding box coordinates
- `source`: Detection source (drone, satellite, cctv, ground, upload)
- `location_lat`, `location_lng`: Detection location coordinates
- `detected_at`: Timestamp when detection was made
- `created_at`: Record creation timestamp

### Resources
Emergency response assets (vehicles, equipment, personnel teams).

**Key Columns:**
- `id`: UUID primary key
- `incident_id`: Foreign key to incidents table
- `type`: Resource type (ambulance, fire_truck, medical_unit, sar_team, etc.)
- `name`: Resource identifier (e.g., "Ambulance 01")
- `status`: Current status (available, deployed, maintenance, offline)
- `location`: Text description of current location
- `location_lat`, `location_lng`: Geographic coordinates
- `assigned_zone_id`: Foreign key to zones table (if currently assigned)
- `eta_minutes`: Estimated time to arrival at assigned zone (in minutes)
- `capacity`: Description of resource capacity (e.g., "2 patients", "1500 gal water")
- `last_updated`: Timestamp of last status update
- `created_at`, `updated_at`: Audit timestamps

### Rescue Teams
Specialized teams of personnel for specific rescue operations.

**Key Columns:**
- `id`: UUID primary key
- `incident_id`: Foreign key to incidents table
- `name`: Team name (e.g., "SAR Team Alpha")
- `type`: Team type (SAR, MEDICAL, FIRE, EVACUATION, LOGISTICS)
- `status`: Team status (available, deployed, maintenance, offline)
- `location_lat`, `location_lng`: Team location coordinates
- `assigned_zone_id`: Foreign key to zones table (if currently assigned)
- `personnel_count`: Number of team members
- `equipment`: JSONB field listing team equipment
- `last_updated`: Timestamp of last status update
- `created_at`, `updated_at`: Audit timestamps

### Mesh Messages
Store-and-forward messages for peer-to-peer communication in the rescue mesh network.

**Key Columns:**
- `id`: UUID primary key
- `incident_id`: Foreign key to incidents table
- `sender_id`: Foreign key to users table (message sender)
- `receiver_id`: Foreign key to users table (intended recipient)
- `content`: Message text content
- `priority`: Message priority (LOW, NORMAL, HIGH, CRITICAL)
- `incident_ref`: Reference to specific incident or zone
- `location_lat`, `location_lng`: Location where message was sent
- `status`: Message status (CREATED, QUEUED, FORWARDED, DELIVERED, EXPIRED)
- `ttl`: Time to live in hops (prevents infinite forwarding)
- `hop_count`: Number of hops message has traveled
- `route_history`: JSONB array of peer IDs that handled this message
- `created_at`, `updated_at`: Audit timestamps

### Mesh Devices
Tracking of devices participating in the rescue mesh network.

**Key Columns:**
- `id`: UUID primary key
- `incident_id`: Foreign key to incidents table
- `user_id`: Foreign key to users table (device owner)
- `device_id`: Unique device identifier
- `device_name`: Human-readable device name
- `status`: Connection status (connected, disconnected, connecting)
- `last_seen`: Timestamp of last communication from device
- `location_lat`, `location_lng`: Last known device location
- `queued_messages`: Number of messages awaiting transmission
- `delivered_messages`: Number of messages successfully sent
- `created_at`, `updated_at`: Audit timestamps

### AI Briefings
Stored AI-generated situation briefings for audit and reference.

**Key Columns:**
- `id`: UUID primary key
- `incident_id`: Foreign key to incidents table
- `title`: Briefing title
- `content`: Full briefing text
- `generated_by`: AI provider used (mock, gemini, openai)
- `data_snapshot`: JSONB of the input data used to generate this briefing
- `created_at`: Timestamp when briefing was generated

### Route Recommendations
Stored recommended routes that avoid hazardous areas.

**Key Columns:**
- `id`: UUID primary key
- `incident_id`: Foreign key to incidents table
- `start_lat`, `start_lng`: Starting point coordinates
- `end_lat`, `end_lng`: Destination point coordinates
- `distance_km`: Total route distance in kilometers
- `estimated_time_minutes`: Estimated travel time in minutes
- `route_geometry`: GeoJSON LineString representing the route
- `avoided_hazards`: JSONB array of hazard zones that were avoided
- `safety_score`: Calculated safety score (0-100, higher is safer)
- `created_at`: Timestamp when recommendation was generated

### Audit Logs
Tracking of important system actions for security and accountability.

**Key Columns:**
- `id`: UUID primary key
- `user_id`: Foreign key to users table (who performed the action)
- `action`: Description of action performed
- `table_name`: Name of table affected (if applicable)
- `record_id`: UUID of record affected (if applicable)
- `changes`: JSONB describing what changed
- `ip_address`: IP address of the user
- `user_agent`: Browser/user agent string
- `created_at`: Timestamp when action occurred

## Relationships and Data Flow

### Incident-Centric Model
All major entities are related to an incident, allowing data isolation between different disaster events:

- One incident has many zones, reports, detections, resources, rescue teams, mesh messages, mesh devices, AI briefings, and route recommendations
- Zones belong to exactly one incident
- Reports can optionally be linked to an incident (for reports not tied to a specific incident)
- Detections can optionally be linked to a zone (for more precise location)
- Resources and rescue teams belong to an incident
- Mesh messages and devices belong to an incident
- AI briefings and route recommendations belong to an incident

### Key Relationships
1. **Users ↔ Mesh Devices**: One-to-many (a user can have multiple devices)
2. **Users ↔ Mesh Messages**: One-to-many (a user can send/receive many messages)
3. **Incidents ←→ Zones**: One-to-many (an incident contains multiple zones)
4. **Incidents ←→ Incident Reports**: One-to-many (an incident has many reports)
5. **Incidents ←→ Detections**: One-to-many (an incident has many detections)
6. **Incidents ←→ Resources**: One-to-many (an incident has many resources)
7. **Incidents ←→ Rescue Teams**: One-to-many (an incident has many teams)
8. **Incidents ←→ Mesh Messages**: One-to-many (an incident has many mesh messages)
9. **Incidents ←→ Mesh Devices**: One-to-many (an incident has many mesh devices)
10. **Incidents ←→ AI Briefings**: One-to-many (an incident has many briefings)
11. **Incidents ←→ Route Recommendations**: One-to-many (an incident has many recommendations)

## Indexing Strategy

Indexes are created on columns frequently used in WHERE clauses, JOIN conditions, and ORDER BY clauses:

### Primary Indexes (Automatic)
- All primary key columns (id)

### Foreign Key Indexes
- All foreign key columns (incident_id, user_id, zone_id, etc.)

### Query Optimization Indexes
- `idx_incidents_severity`: For filtering incidents by severity
- `idx_incidents_location`: For geographic queries on incidents
- `idx_reports_reporter_type`: For filtering reports by source
- `idx_reports_status`: For filtering reports by processing status
- `idx_reports_location`: For geographic queries on reports
- `idx_zones_risk_score`: For sorting zones by risk level
- `idx_zones_severity`: For filtering zones by severity
- `idx_zones_location`: For geographic queries on zones
- `idx_detections_class`: For filtering detections by object type
- `idx_detections_confidence`: For filtering detections by confidence threshold
- `idx_detections_location`: For geographic queries on detections
- `idx_detections_detected_at`: For time-based queries on detections
- `idx_resources_status`: For filtering resources by availability
- `idx_resources_type`: For filtering resources by type
- `idx_resources_location`: For geographic queries on resources
- `idx_mesh_messages_status`: For filtering messages by status
- `idx_mesh_messages_priority`: For filtering messages by priority
- `idx_mesh_messages_created_at`: For retrieving recent messages
- `idx_mesh_devices_status`: For filtering devices by connection state
- `idx_mesh_devices_last_seen`: For identifying stale devices
- `idx_ai_briefings_created_at`: For retrieving recent briefings
- `idx_route_recommendations_created_at`: For retrieving recent recommendations
- `idx_audit_logs_created_at`: For retrieving recent audit entries

## Constraints and Data Integrity

### Check Constraints
Many tables include CHECK constraints to ensure data validity:

- Severity values limited to allowed enumerations
- Status values limited to allowed enumerations
- Numerical values constrained to valid ranges (0-100 for scores, 0.0-1.0 for confidences)
- UUID primary keys ensure global uniqueness
- Foreign key constraints prevent orphaned records

### Default Values
- Timestamps automatically set to statement time
- Enumeration fields set to sensible defaults (e.g., status = 'available' for new resources)
- Boolean fields default to appropriate values

## Storage Considerations

### Supabase Storage Integration
While structured data lives in the PostgreSQL database, large binary objects (photos, video, audio) are stored in Supabase Storage with references kept in the database:

- Incident reports can have a `media_url` pointing to stored media
- AI briefings remain in the database as they are primarily text
- Export files and logs would similarly use Supabase Storage

### Data Retention
- Active incident data is retained indefinitely for historical analysis
- Mesh messages may have shorter retention based on operational needs
- Audit logs are retained for compliance and security monitoring
- Old incidents can be archived while preserving summary statistics

## Security and Access Control

### Row Level Security (RLS)
RLS is enabled on all tables with policies that, in the MVP, allow all operations for simplicity. In a production deployment, policies would be refined to:

1. **Users Table**: 
   - Users can only read their own profile unless they are administrators
   - Administrators can read all user profiles

2. **Incidents and Related Tables**:
   - Users can only access data for incidents they are assigned to
   - Incident commanders and administrators have broader access

3. **Mesh Communications**:
   - Users can only send/receive messages within their incident context
   - Device registration is restricted to authenticated users

4. **Administrative Functions**:
   - Only administrators can modify user roles and system settings

### Authentication
- Authentication is handled via Supabase Auth (JWT-based)
- Row level security policies use the `auth.uid()` function to identify the current user
- API endpoints in the backend validate JWT tokens before processing requests

## Performance Considerations

### Connection Pooling
- Supabase provides built-in connection pooling
- The backend uses connection pooling to efficiently handle concurrent requests

### Caching Strategies
- Frequently accessed reference data (e.g., severity levels, resource types) can be cached
- Recently computed risk scores may be cached with short TTLs
- AI briefings are not cached as they are generated on demand

### Database Optimization
- Proper indexing as described above
- Regular vacuuming and analysis (handled automatically by Supabase)
- Monitoring of slow queries and optimization as needed

## Backup and Disaster Recovery

### Supabase Managed Backups
- Supabase provides automatic daily backups
- Point-in-time recovery is available
- Geographic redundancy options exist for higher tiers

### Export/Import Capabilities
- Database can be exported via `pg_dump` for migration or backup
- SQL files (schema.sql and seed.sql) allow for environment replication

## Environment-Specific Configurations

### Development vs Production
- Development environments may use a separate Supabase project
- Schema migrations are managed via the SQL files in the supabase/ directory
- Seed data provides consistent starting state for demonstrations
- Production environments would have tighter security policies and monitoring

## Limitations and Assumptions

### Current MVP Limitations
1. **Simplified Security**: RLS policies are permissive for demonstration purposes
2. **Fixed Schema**: Schema changes require manual SQL execution (in production, migrations would be automated)
3. **Limited Analytics**: No built-in analytics dashboards (would be added in production)
4. **Simplified Geographic Data**: Uses simple latitude/longitude rather than PostGIS for spatial queries (adequate for MVP)

### Assumptions Made
1. **Incident Isolation**: Data from different incidents does not need to be commingled for analysis
2. **Moderate Data Volume**: Expected data volumes are manageable with standard PostgreSQL configurations
3. **Read-Heavy Workload**: More reads than writes, typical for operational dashboards
4. **Geographic Simplicity**: Distance-based queries are sufficient for zone containment checks (no complex polygon operations needed)

## Future Enhancements

1. **Spatial Indexing**: Implement PostGIS for advanced geographic queries and zone operations
2. **Data Archiving**: Implement automatic archiving of old incident data to reduce costs
3. **Metrics Collection**: Add tables for system performance and usage analytics
4. **Median Cache Layer**: Introduce Redis caching for frequently accessed data
5. **Event Sourcing**: Consider event-sourced architecture for audit trails and replay capabilities
6. **Multi-Tenant Support**: Adapt schema to support multiple organizations or isolated deployments
7. **Federated Identity**: Support integration with external identity providers (LDAP, SAML, etc.)
8. **Data Quality Controls**: Implement validation rules and data quality scoring

## Conclusion

The ResQLink database design provides a solid foundation for an emergency response information system. It models the key entities and relationships needed to track incidents, resources, reports, and AI-generated information while supporting the core functionality of the four pillars: SEE (through detections and reports), CONNECT (through mesh communications), THINK (through risk assessments and AI briefings), and ACT (through resource management and route recommendations).

The design balances normalization for data integrity with practical considerations for query performance and ease of use. By leveraging Supabase's managed PostgreSQL offering, ResQLink gains enterprise-grade database features without the operational overhead of self-managed infrastructure.