import networkx as nx
import math
from typing import List, Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)

class GraphRoutingEngine:
    """Graph-based routing engine using networkx for disaster areas."""
    
    def __init__(self, grid_size: int = 20, area_size_km: float = 10.0, center_lat: float = 20.6, center_lng: float = 79.0):
        self.grid_size = grid_size
        self.area_size_km = area_size_km
        self.center_lat = center_lat
        self.center_lng = center_lng
        self.graph = nx.Graph()
        self._build_grid_graph()

    def _build_grid_graph(self):
        """Builds a simulated roadmap (grid) representing the disaster area."""
        # Calculate roughly the step size in degrees
        # 1 degree lat is approx 111 km
        lat_step = (self.area_size_km / 111.0) / self.grid_size
        lng_step = (self.area_size_km / 111.0) / self.grid_size
        
        start_lat = self.center_lat - (self.area_size_km / 222.0)
        start_lng = self.center_lng - (self.area_size_km / 222.0)
        
        for i in range(self.grid_size):
            for j in range(self.grid_size):
                node_id = (i, j)
                lat = start_lat + i * lat_step
                lng = start_lng + j * lng_step
                self.graph.add_node(node_id, lat=lat, lng=lng)
                
                # Connect to adjacent nodes
                if i > 0:
                    self._add_edge(node_id, (i - 1, j))
                if j > 0:
                    self._add_edge(node_id, (i, j - 1))
                if i > 0 and j > 0:
                    self._add_edge(node_id, (i - 1, j - 1))
                if i > 0 and j < self.grid_size - 1:
                    self._add_edge(node_id, (i - 1, j + 1))

    def _add_edge(self, node1, node2):
        lat1, lng1 = self.graph.nodes[node1]['lat'], self.graph.nodes[node1]['lng']
        lat2, lng2 = self.graph.nodes[node2]['lat'], self.graph.nodes[node2]['lng']
        dist = self.calculate_distance({"lat": lat1, "lng": lng1}, {"lat": lat2, "lng": lng2})
        self.graph.add_edge(node1, node2, weight=dist, original_weight=dist)

    def calculate_distance(self, point1: Dict[str, float], point2: Dict[str, float]) -> float:
        """Calculate distance between two points using Haversine formula."""
        lat1, lon1 = point1["lat"], point1["lng"]
        lat2, lon2 = point2["lat"], point2["lng"]
        R = 6371  # Earth's radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c

    def _find_nearest_node(self, lat: float, lng: float) -> Tuple[int, int]:
        """Find the nearest graph node to a given coordinate."""
        min_dist = float('inf')
        nearest = None
        for node, data in self.graph.nodes(data=True):
            dist = self.calculate_distance({"lat": lat, "lng": lng}, {"lat": data['lat'], "lng": data['lng']})
            if dist < min_dist:
                min_dist = dist
                nearest = node
        return nearest

    def _apply_hazard_penalties(self, hazard_zones: List[Dict[str, Any]]):
        """Increase weights for edges that pass through hazard zones."""
        # Reset weights
        for u, v, d in self.graph.edges(data=True):
            d['weight'] = d['original_weight']
            
        for hazard in hazard_zones:
            hazard_lat = hazard.get("lat", 0)
            hazard_lng = hazard.get("lng", 0)
            radius = hazard.get("radius_km", 1.0)
            
            for u, v, d in self.graph.edges(data=True):
                u_data = self.graph.nodes[u]
                v_data = self.graph.nodes[v]
                # Simple check if either node of the edge is within the hazard
                dist_u = self.calculate_distance({"lat": u_data['lat'], "lng": u_data['lng']}, {"lat": hazard_lat, "lng": hazard_lng})
                dist_v = self.calculate_distance({"lat": v_data['lat'], "lng": v_data['lng']}, {"lat": hazard_lat, "lng": hazard_lng})
                
                if dist_u <= radius or dist_v <= radius:
                    # Apply a massive penalty to avoid this edge
                    d['weight'] += 1000.0

    def calculate_route(self, start: Dict[str, float], end: Dict[str, float], hazard_zones: List[Dict[str, Any]], algorithm='astar') -> List[Dict[str, float]]:
        """Calculate route using A* or Dijkstra."""
        self._apply_hazard_penalties(hazard_zones)
        
        start_node = self._find_nearest_node(start['lat'], start['lng'])
        end_node = self._find_nearest_node(end['lat'], end['lng'])
        
        if not start_node or not end_node:
            return [start, end]
            
        try:
            if algorithm == 'astar':
                def heuristic(n1, n2):
                    n1_data = self.graph.nodes[n1]
                    n2_data = self.graph.nodes[n2]
                    return self.calculate_distance(
                        {"lat": n1_data['lat'], "lng": n1_data['lng']},
                        {"lat": n2_data['lat'], "lng": n2_data['lng']}
                    )
                path = nx.astar_path(self.graph, start_node, end_node, heuristic=heuristic, weight='weight')
            else:
                path = nx.dijkstra_path(self.graph, start_node, end_node, weight='weight')
                
            route_points = [start]
            for node in path:
                node_data = self.graph.nodes[node]
                route_points.append({"lat": node_data['lat'], "lng": node_data['lng']})
            route_points.append(end)
            return route_points
        except nx.NetworkXNoPath:
            logger.warning("No path found between start and end!")
            return [start, end]
