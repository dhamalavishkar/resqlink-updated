import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, MapPin, ClipboardList, RefreshCw, Truck, Ambulance, Stethoscope, Flame, HelpingHand, Clock } from 'lucide-react';

export const RescueOperationsPage = () => {
  const [resources, setResources] = useState<Array<{
    id: number;
    type: string;
    name: string;
    status: 'available' | 'deployed' | 'maintenance' | 'offline';
    location: string;
    assignedZone: string | null;
    eta: string | null;
    capacity: string;
    lastUpdated: string;
  }>>([]);
  const [filters, setFilters] = useState({
    types: ['ambulance', 'fire_truck', 'medical_unit', 'sar_team', 'water_truck', 'supply_truck'] as const,
    statuses: ['available', 'deployed', 'maintenance', 'offline'] as const
  });

  useState(() => {
    // Mock data
    setResources([
      {
        id: 1,
        type: 'ambulance',
        name: 'Ambulance 01',
        status: 'available',
        location: 'Central Hospital',
        assignedZone: null,
        eta: null,
        capacity: '2 patients',
        lastUpdated: '2 minutes ago'
      },
      {
        id: 2,
        type: 'ambulance',
        name: 'Ambulance 02',
        status: 'deployed',
        location: 'En route to Zone A-01',
        assignedZone: 'Zone A-01',
        eta: '5 minutes',
        capacity: '2 patients',
        lastUpdated: '3 minutes ago'
      },
      {
        id: 3,
        type: 'fire_truck',
        name: 'Fire Truck 07',
        status: 'available',
        location: 'East Fire Station',
        assignedZone: null,
        eta: null,
        capacity: '1500 gal water',
        lastUpdated: '1 minute ago'
      },
      {
        id: 4,
        type: 'fire_truck',
        name: 'Fire Truck 12',
        status: 'deployed',
        location: 'Engaged at Zone A-01',
        assignedZone: 'Zone A-01',
        eta: 'On scene',
        capacity: '2000 gal water',
        lastUpdated: '4 minutes ago'
      },
      {
        id: 5,
        type: 'medical_unit',
        name: 'Medical Unit 03',
        status: 'available',
        location: 'West Clinic',
        assignedZone: null,
        eta: null,
        capacity: '4 patients',
        lastUpdated: '5 minutes ago'
      },
      {
        id: 6,
        type: 'sar_team',
        name: 'SAR Team Alpha',
        status: 'deployed',
        location: 'Searching Zone B-07',
        assignedZone: 'Zone B-07',
        eta: 'On scene',
        capacity: '6 personnel',
        lastUpdated: '1 minute ago'
      },
      {
        id: 7,
        type: 'water_truck',
        name: 'Water Truck 02',
        status: 'maintenance',
        location: 'Maintenance Bay',
        assignedZone: null,
        eta: null,
        capacity: '3000 gal',
        lastUpdated: '30 minutes ago'
      },
      {
        id: 8,
        type: 'supply_truck',
        name: 'Supply Truck 05',
        status: 'offline',
        location: 'Depot',
        assignedZone: null,
        eta: null,
        capacity: '10 tons',
        lastUpdated: '2 hours ago'
      }
    ]);
  });

  const filteredResources = resources.filter(resource =>
    filters.types.includes(resource.type as const) &&
    filters.statuses.includes(resource.status as const)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Rescue Operations</h2>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              // In a real app, this would open a resource management form
              alert('Resource management form would open here');
            }}
          >
            Manage Resources
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Resource Types</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-wrap space-x-2">
                    {['ambulance', 'fire_truck', 'medical_unit', 'sar_team', 'water_truck', 'supply_truck'].map(type => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.types.includes(type as const)}
                          onChange={(e) => {
                            const newList = e.target.checked
                              ? [...filters.types, type as const]
                              : filters.types.filter(t => t !== type);
                            setFilters(prev => ({ ...prev, types: newList }));
                          }}
                        />
                        <span className="text-sm">
                          {type
                            .split('_')
                            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(' ')
                          }
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Status</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-wrap space-x-2">
                    {['available', 'deployed', 'maintenance', 'offline'].map(status => (
                      <label key={status} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.statuses.includes(status as const)}
                          onChange={(e) => {
                            const newList = e.target.checked
                              ? [...filters.statuses, status as const]
                              : filters.statuses.filter(s => s !== status);
                            setFilters(prev => ({ ...prev, statuses: newList }));
                          }}
                        />
                        <Badge
                          variant={status === 'available' ? 'secondary' :
                                   status === 'deployed' ? 'destructive' :
                                   status === 'maintenance' ? 'outline' : 'default'}
                        >
                          {status
                            .split('_')
                            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(' ')
                          }
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Resources Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto h-96">
                {filteredResources.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredResources.map((resource, index) => (
                      <div key={resource.id} className="p-4">
                        <div className="flex items-start space-x-3 mb-2">
                          <div className="flex-shrink-0">
                            {resource.type === 'ambulance' ? (
                              <Ambulance className="h-5 w-5 text-blue-500" />
                            ) : resource.type === 'fire_truck' ? (
                              <Flame className="h-5 w-5 text-red-500" />
                            ) : resource.type === 'medical_unit' ? (
                              <Stethoscope className="h-5 w-5 text-green-500" />
                            ) : resource.type === 'sar_team' ? (
                              <HelpingHand className="h-5 w-5 text-purple-500" />
                            ) : resource.type === 'water_truck' ? (
                              <Truck className="h-5 w-5 text-light-blue-500" />
                            ) : (
                              <ClipboardList className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{resource.name}</h4>
                            <p className="text-sm text-gray-500">{resource.type
                              .split('_')
                              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(' ')
                            }</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs">
                              <span>
                                <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                                {resource.location}
                              </span>
                              <span>
                                <Badge
                                  variant={resource.status === 'available' ? 'secondary' :
                                           resource.status === 'deployed' ? 'destructive' :
                                           resource.status === 'maintenance' ? 'outline' : 'default'}
                                >
                                  {resource.status
                                    .split('_')
                                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                                    .join(' ')
                                }
                                </Badge>
                              </span>
                              {resource.assignedZone && (
                                <span>
                                  <Activity className="h-3 w-3 text-gray-400 mr-1" />
                                  Assigned: {resource.assignedZone}
                                </span>
                              )}
                              {resource.eta && (
                                <span className="ml-auto">
                                  <Clock className="h-3 w-3 text-gray-400 mr-1" />
                                  ETA: {resource.eta}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              Capacity: {resource.capacity}
                            </div>
                            <div className="mt-1 text-xs text-gray-400">
                              Last updated: {resource.lastUpdated}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClipboardList className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No resources match the current filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};