# ResQLink Hackathon Project - Implementation Plan
## Phase 1 & 2: Data Wiring & Performance Optimization

### Overview
This plan outlines the implementation for Phase 1 (Data Wiring) and Phase 2 (Performance Optimization) of the ResQLink hackathon project. The goal is to connect the frontend to real backend APIs and optimize performance without rebuilding the existing functionality.

## Phase 1: Connect the Dots (Data Wiring)

### Objective
Replace hardcoded mock data in frontend components with actual API calls to the FastAPI backend and Supabase database. Ensure data persistence when creating new incidents/reports.

### Target Components
1. **OverviewPage** (`frontend/src/pages/OverviewPage.tsx`) - Dashboard with stats, zones, and reports
2. **LiveMapPage** (`frontend/src/pages/LiveMapPage.tsx`) - Live incident map with zones, reports, detections, resources
3. **IncidentReportsPage** (`frontend/src/pages/IncidentReportsPage.tsx`) - Incident reporting and filtering

### Implementation Details

#### 1. OverviewPage Data Wiring
**Current State**: Uses mock data via `useState` and `useEffect` with simulated API calls
**Target State**: Replace mock data with real API calls using existing `api` service

**Changes Needed**:
- Keep existing API call structure but remove hardcoded mock data arrays
- Ensure all data comes from actual backend endpoints:
  - `/incidents` → activeIncidents count
  - `/zones` → criticalZones count and top zones
  - `/reports` → recentReports list and unresolvedReports count
  - `/detections` → survivorsDetected count
  - `/resources` → activeRescueTeams count
- Remove mock data fallbacks since Supabase is connected

#### 2. LiveMapPage Data Wiring
**Current State**: Uses API calls but has mock location generation for reports/resources
**Target State**: Use actual location data from database, remove random location generation

**Changes Needed**:
- Update Zone, Report, Detection, Resource interfaces to include proper lat/lng when available
- Modify map rendering to use actual coordinates from database:
  - For zones: Use `location.lat` and `location.lng` from Zone objects
  - For reports: Extract coordinates from location string OR store lat/lng in database
  - For detections: Already has `location.lat` and `location.lng`
  - For resources: Extract coordinates from location string OR store lat/lng in database
- Modify `_get_demo_*` methods in Supabase service to return proper lat/lng when in demo mode
- Remove random lat/lng generation (`Math.random()` calls) in map rendering

#### 3. IncidentReportsPage Data Wiring
**Current State**: Uses completely hardcoded mock data array
**Target State**: Fetch real reports from `/reports` endpoint

**Changes Needed**:
- Replace hardcoded reports array with data from `api.getReports()`
- Update Report interface to match backend database schema
- Implement real-time updates via polling or WebSocket (if available)
- Keep filtering/sorting functionality but apply to real data
- Implement actual "New Report" button functionality using `api.create_report()`

#### 4. Data Persistence for Create Operations
**Current State**: Create operations show alerts or do nothing
**Target State**: Actual data persistence to Supabase

**Changes Needed**:
- Implement form for creating new reports (modal or navigation to new page)
- Connect form submission to `api.create_report()` endpoint
- Handle success/error states appropriately
- Update UI optimistically or refresh data after successful creation

### Files to Modify
1. `frontend/src/pages/OverviewPage.tsx`
2. `frontend/src/pages/LiveMapPage.tsx`
3. `frontend/src/pages/IncidentReportsPage.tsx`
4. `frontend/src/services/api.ts` (if interface updates needed)
5. `backend/app/database/supabase_client.py` (ensure proper data types)

### Success Criteria
- All dashboard stats reflect real-time data from Supabase
- Map shows actual incident locations from database (not random positions)
- Incident reports table shows real reports from database
- Creating new reports persists to Supabase and appears in UI
- No hardcoded mock data remains in the three target pages

## Phase 2: Performance Optimization

### Objective
Optimize application performance by:
1. Making AI model loading asynchronous to prevent blocking backend startup
2. Optimizing React components to handle large datasets efficiently

### Target Areas
1. **Backend AI Model Loading** (`backend/app/services/vision.py`)
2. **Frontend Component Rendering** (particularly for large arrays in maps and lists)

### Implementation Details

#### 1. Backend AI Model Loading Optimization
**Current State**: VisionService loads YOLO model synchronously in `__init__` method (line 27)
**Target State**: Load model asynchronously on first use or via background initialization

**Changes Needed**:
- Modify `VisionService.__init__()` to not load model immediately
- Add async `initialize()` method or lazy-load in `detect_objects()`
- Update `VisionService` constructor to accept `lazy_load: bool = True` parameter
- In `detect_objects()`, check if model is loaded and load it if not
- Update `vision.py` endpoint to handle async initialization
- Add proper loading states and error handling

**Benefits**:
- FastAPI server starts instantly without waiting for YOLO model download/loading
- Model loads only when first detection request is made
- Background loading option for anticipated usage

#### 2. Frontend Rendering Optimization
**Current State**: Components may re-render inefficiently with large datasets
**Target State**: Implement React optimization techniques for large arrays

**Changes Needed**:
- **LiveMapPage**:
  - Implement `useMemo` for filtered detection arrays (survivors, fires, etc.)
  - Add virtualized rendering for large numbers of map markers (if >100 markers)
  - Optimize icon creation to avoid repeated calculations
  
- **IncidentReportsPage**:
  - Implement virtualized scrolling for reports list (if >50 reports)
  - Memoize filtered/sorted reports arrays
  - Optimize badge rendering and icon mapping

- **OverviewPage**:
  - Memoize stats calculations
  - Optimize zone/report sorting and slicing operations

- **General**:
  - Implement `React.memo` for reusable components
  - Use `useCallback` for event handlers
  - Add proper dependency arrays to `useEffect` hooks

### Files to Modify
1. `backend/app/services/vision.py` - Async model loading
2. `backend/app/api/endpoints/vision.py` - Update to handle async vision service
3. `frontend/src/pages/LiveMapPage.tsx` - Rendering optimizations
4. `frontend/src/pages/IncidentReportsPage.tsx` - Rendering optimizations
5. `frontend/src/pages/OverviewPage.tsx` - Rendering optimizations
6. `frontend/src/components/ui/` (if creating optimized components)

### Success Criteria
- Backend API server starts in <2 seconds (vs current delay from YOLO loading)
- First detection request may be slower (model loading) but subsequent requests are fast
- No blocking of server startup due to AI model initialization
- Frontend handles 1000+ map markers or report entries without noticeable lag
- UI remains responsive during data updates and user interactions
- Memory usage remains stable with large datasets

## Implementation Sequence

### Phase 1 Steps:
1. Backup current mock data implementations
2. Update OverviewPage to use real API data
3. Update LiveMapPage to use real location data
4. Update IncidentReportsPage to fetch and display real reports
5. Implement actual report creation functionality
6. Test data flow and persistence
7. Remove all hardcoded mock data from target pages

### Phase 2 Steps:
1. Modify VisionService for lazy/async loading
2. Update vision endpoint to handle async service
3. Implement frontend rendering optimizations
4. Test performance improvements
5. Verify backward compatibility

## Dependencies
- Supabase connection must be working (already verified)
- Existing API service in frontend is functional
- Backend endpoints are implemented and connected to Supabase

## Risk Mitigation
- Keep backup of original files before modification
- Test each component independently before moving to next
- Ensure fallback to mock data if API fails (graceful degradation)
- Monitor performance metrics before/after changes