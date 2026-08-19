from fastapi import APIRouter
from app.api.endpoints import health, incidents, reports, zones, detections, resources, mesh, ai, routes, simulation

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(health.router, tags=["health"])
api_router.include_router(incidents.router, tags=["incidents"])
api_router.include_router(reports.router, tags=["reports"])
api_router.include_router(zones.router, tags=["zones"])
api_router.include_router(detections.router, tags=["detections"])
api_router.include_router(resources.router, tags=["resources"])
api_router.include_router(mesh.router, tags=["mesh"])
api_router.include_router(ai.router, tags=["ai"])
api_router.include_router(routes.router, tags=["routes"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["simulation"])