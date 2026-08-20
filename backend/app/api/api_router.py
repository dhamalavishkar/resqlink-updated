from fastapi import APIRouter
from app.api.endpoints import health, incidents, reports, zones, detections, resources, mesh, ai, routes, simulation, field_reports, risk

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["incidents"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(risk.router, prefix="/risk", tags=["risk"])
api_router.include_router(zones.router, prefix="/zones", tags=["zones"])
api_router.include_router(detections.router, prefix="/detections", tags=["detections"])
api_router.include_router(resources.router, prefix="/resources", tags=["resources"])
api_router.include_router(mesh.router, prefix="/mesh", tags=["mesh"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(routes.router, prefix="/routes", tags=["routes"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["simulation"])
api_router.include_router(field_reports.router, prefix="/field-reports", tags=["field-reports"])