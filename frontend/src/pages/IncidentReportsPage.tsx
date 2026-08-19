import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Users, Activity, MapPin, AlertTriangle, Users as UserIcon, RefreshCw } from 'lucide-react';

export const IncidentReportsPage = () => {
  const [reports, setReports] = useState<Array<{
    id: number;
    reporterType: 'Citizen' | 'Volunteer' | 'Responder' | 'Drone' | 'AI Detection' | 'CCTV';
    title: string;
    description: string;
    location: string;
    severity: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
    timestamp: string;
    media: string | null;
    confidence: number;
    status: 'NEW' | 'VERIFIED' | 'INVESTIGATING' | 'RESOLVED' | 'REJECTED';
  }>>([
    {
      id: 1,
      reporterType: 'Citizen',
      title: 'Flood in Main Street',
      description: 'Water levels rising rapidly on Main Street near the bridge',
      location: 'Main Street & 1st Avenue',
      severity: 'HIGH',
      timestamp: '5 minutes ago',
      media: null,
      confidence: 0.8,
      status: 'NEW'
    },
    {
      id: 2,
      reporterType: 'Drone',
      title: 'Person trapped in building',
      description: 'Individual seen waving from upper floor window of collapsed structure',
      location: 'Building 42, Industrial District',
      severity: 'CRITICAL',
      timestamp: '8 minutes ago',
      media: '/drone-footage.jpg',
      confidence: 0.95,
      status: 'VERIFIED'
    },
    {
      id: 3,
      reporterType: 'AI Detection',
      title: 'Road blocked by debris',
      description: 'Large debris field blocking major east-west thoroughfare',
      location: 'Highway 10 & River Crossing',
      severity: 'HIGH',
      timestamp: '12 minutes ago',
      media: '/thermal-image.jpg',
      confidence: 0.91,
      status: 'INVESTIGATING'
    },
    {
      id: 4,
      reporterType: 'Volunteer',
      title: 'Medical assistance needed',
      description: 'Multiple individuals requiring medical attention at community center',
      location: 'Community Center, North District',
      severity: 'CRITICAL',
      timestamp: '15 minutes ago',
      media: null,
      confidence: 0.85,
      status: 'NEW'
    },
    {
      id: 5,
      reporterType: 'CCTV',
      title: 'Fire spreading north',
      description: 'Structure fire in warehouse district showing signs of northern expansion',
      location: 'Industrial Zone B',
      severity: 'HIGH',
      timestamp: '20 minutes ago',
      media: '/cctv-feed.jpg',
      confidence: 0.75,
      status: 'REJECTED'
    }
  ]);
  const [filters, setFilters] = useState({
    reporterTypes: ['Citizen', 'Volunteer', 'Responder', 'Drone', 'AI Detection', 'CCTV'] as const,
    severities: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'] as const,
    statuses: ['NEW', 'VERIFIED', 'INVESTIGATING', 'RESOLVED', 'REJECTED'] as const
  });
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity' | 'confidence'>('timestamp');
  const [sortDesc, setSortDesc] = useState(true);

  const filteredReports = reports
    .filter(report =>
      filters.reporterTypes.includes(report.reporterType) &&
      filters.severities.includes(report.severity) &&
      filters.statuses.includes(report.status)
    )
    .sort((a, b) => {
      if (sortBy === 'timestamp') {
        return sortDesc
          ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      if (sortBy === 'severity') {
        const severityOrder: Record<string, number> = {
          CRITICAL: 4,
          HIGH: 3,
          NORMAL: 2,
          LOW: 1
        };
        return sortDesc
          ? severityOrder[b.severity] - severityOrder[a.severity]
          : severityOrder[a.severity] - severityOrder[b.severity];
      }
      if (sortBy === 'confidence') {
        return sortDesc ? b.confidence - a.confidence : a.confidence - b.confidence;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Incident Reports</h2>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              // In a real app, this would open a form to create a new report
              alert('New report form would open here');
            }}
          >
            New Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Reporter Types</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-wrap space-x-2">
                    {['Citizen', 'Volunteer', 'Responder', 'Drone', 'AI Detection', 'CCTV'].map(type => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.reporterTypes.includes(type as const)}
                          onChange={(e) => {
                            const newList = e.target.checked
                              ? [...filters.reporterTypes, type as const]
                              : filters.reporterTypes.filter(t => t !== type);
                            setFilters(prev => ({ ...prev, reporterTypes: newList }));
                          }}
                        />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Severity Levels</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-wrap space-x-2">
                    {['LOW', 'NORMAL', 'HIGH', 'CRITICAL'].map(severity => (
                      <label key={severity} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.severities.includes(severity as const)}
                          onChange={(e) => {
                            const newList = e.target.checked
                              ? [...filters.severities, severity as const]
                              : filters.severities.filter(s => s !== severity);
                            setFilters(prev => ({ ...prev, severities: newList }));
                          }}
                        />
                        <Badge
                          variant={severity === 'CRITICAL' ? 'destructive' :
                                   severity === 'HIGH' ? 'outline' :
                                   severity === 'NORMAL' ? 'secondary' : 'default'}
                        >
                          {severity}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <ClipboardList className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Status</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-wrap space-x-2">
                    {['NEW', 'VERIFIED', 'INVESTIGATING', 'RESOLVED', 'REJECTED'].map(status => (
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
                        <span className="text-sm">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Sort By</span>
                </div>
                <div className="flex items-wrap space-x-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="sortBy"
                      value="timestamp"
                      checked={sortBy === 'timestamp'}
                      onChange={(e) => {
                        setSortBy(e.target.value as typeof sortBy);
                      }}
                    />
                    Timestamp
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="sortBy"
                      value="severity"
                      checked={sortBy === 'severity'}
                      onChange={(e) => {
                        setSortBy(e.target.value as typeof sortBy);
                      }}
                    />
                    Severity
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="sortBy"
                      value="confidence"
                      checked={sortBy === 'confidence'}
                      onChange={(e) => {
                        setSortBy(e.target.value as typeof sortBy);
                      }}
                    />
                    Confidence
                  </label>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={sortDesc}
                      onChange={(e) => setSortDesc(e.target.checked)}
                    />
                    Descending
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
              <CardTitle>Reports List</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto h-96">
                {/* Table Header */}
                <div className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider grid grid-cols-12 gap-4">
                  <div className="col-span-2">ID</div>
                  <div className="col-span-3">Title</div>
                  <div className="col-span-2">Reporter</div>
                  <div className="col-span-1">Severity</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">Location</div>
                  <div className="col-span-1 text-gray-500">Time</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {filteredReports.map((report, index) => (
                    <div key={report.id} className="px-4 py-3 text-sm text-gray-700 grid grid-cols-12 gap-4">
                      <div className="col-span-2">{report.id}</div>
                      <div className="col-span-3">{report.title}</div>
                      <div className="col-span-2 flex items-center">
                        {report.reporterType === 'Citizen' ? (
                          <Users className="h-4 w-4 text-blue-500 mr-2" />
                        ) : report.reporterType === 'Volunteer' ? (
                          <UserIcon className="h-4 w-4 text-green-500 mr-2" />
                        ) : report.reporterType === 'Responder' ? (
                          <Activity className="h-4 w-4 text-red-500 mr-2" />
                        ) : report.reporterType === 'Drone' ? (
                          <MapPin className="h-4 w-4 text-purple-500 mr-2" />
                        ) : report.reporterType === 'AI Detection' ? (
                          <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                        ) : (
                          <ClipboardList className="h-4 w-4 text-gray-500 mr-2" />
                        )}
                        <span className="text-gray-600 capitalize">
                          {report.reporterType.toLowerCase()}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <Badge
                          variant={report.severity === 'CRITICAL' ? 'destructive' :
                            report.severity === 'HIGH' ? 'outline' :
                            report.severity === 'NORMAL' ? 'secondary' : 'default'}
                        >
                          {report.severity.toLowerCase()}
                        </Badge>
                      </div>
                      <div className="col-span-1">
                        <Badge
                          variant={report.status === 'NEW' ? 'default' :
                            report.status === 'VERIFIED' ? 'secondary' :
                            report.status === 'INVESTIGATING' ? 'outline' :
                            report.status === 'RESOLVED' ? 'success' : 'destructive'}
                        >
                          {report.status.toLowerCase()}
                        </Badge>
                      </div>
                      <div className="col-span-2">{report.location}</div>
                      <div className="col-span-1 text-gray-500">{report.timestamp}</div>
                    </div>
                  ))}
                </div>

                {filteredReports.length === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardList className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No reports match the current filters</p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
};