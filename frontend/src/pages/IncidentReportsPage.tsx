import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Users, Activity, MapPin, AlertTriangle, Users as UserIcon, RefreshCw } from 'lucide-react';
import { api } from '@/services/api';

export const IncidentReportsPage = () => {
  const [reports, setReports] = useState<Array<{
    id: string;
    reporterType: 'Citizen' | 'Volunteer' | 'Responder' | 'Drone' | 'AI Detection' | 'CCTV';
    title: string;
    description: string;
    location: string;
    severity: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
    timestamp: string; // ISO timestamp from API
    media: string | null;
    confidence: number;
    status: 'NEW' | 'VERIFIED' | 'INVESTIGATING' | 'RESOLVED' | 'REJECTED';
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    reporterTypes: ['Citizen', 'Volunteer', 'Responder', 'Drone', 'AI Detection', 'CCTV'] as const,
    severities: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'] as const,
    statuses: ['NEW', 'VERIFIED', 'INVESTIGATING', 'RESOLVED', 'REJECTED'] as const
  });
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity' | 'confidence'>('timestamp');
  const [sortDesc, setSortDesc] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    reporterType: 'Citizen' as const,
    title: '',
    description: '',
    location: '',
    severity: 'NORMAL' as const,
    confidence: 0.8
  });

  // Helper function to format timestamp as relative time
  const formatTimeAgo = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 5) return 'just now';
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await api.getReports();
        // Map API data to UI format
        const mappedReports = data.map((report: any) => ({
          id: report.id,
          reporterType: report.reporter_type as any,
          title: report.title,
          description: report.description,
          location: report.location,
          severity: report.severity as any,
          timestamp: report.created_at, // Keep as ISO string for sorting
          media: report.media || null,
          confidence: report.confidence,
          status: report.status as any
        }));
        setReports(mappedReports);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Create a copy of reports with formatted timestamp for display
  const reportsWithFormattedTime = reports.map(report => ({
    ...report,
    formattedTimestamp: formatTimeAgo(report.timestamp)
  }));

  const filteredReports = reportsWithFormattedTime
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

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    try {
      const reportData = {
        reporter_type: formData.reporterType,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        severity: formData.severity,
        confidence: formData.confidence,
        status: 'NEW' as const
      };

      const result = await api.create_report(reportData);
      if (result) {
        // Add the new report to the beginning of the list
        setReports(prev => [{
          id: result.id,
          reporterType: result.reporter_type as any,
          title: result.title,
          description: result.description,
          location: result.location,
          severity: result.severity as any,
          timestamp: result.created_at,
          media: result.media || null,
          confidence: result.confidence,
          status: result.status as any
        }, ...prev]);

        // Reset form
        setFormData({
          reporterType: 'Citizen' as const,
          title: '',
          description: '',
          location: '',
          severity: 'NORMAL' as const,
          confidence: 0.8
        });
        setShowCreateForm(false);
      } else {
        throw new Error('Failed to create report');
      }
    } catch (err) {
      console.error('Error creating report:', err);
      setCreateError('Failed to create report');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Incident Reports</h2>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="hover-shadow transition-all duration-200">
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="hover-shadow transition-all duration-200"
          >
            {showCreateForm ? 'Cancel' : 'New Report'}
          </Button>
          {showCreateForm && (
            <Button variant="outline" size="sm" onClick={() => setShowCreateForm(false)} className="hover-shadow transition-all duration-200">
              Close
            </Button>
          )}
        </div>
      </div>

      {showCreateForm && (
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-[var(--color-text)] font-semibold">Create New Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleCreateReport} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Reporter Type</label>
                  <select
                    value={formData.reporterType}
                    onChange={(e) => setFormData(prev => ({ ...prev, reporterType: e.target.value as 'Citizen' | 'Volunteer' | 'Responder' | 'Drone' | 'AI Detection' | 'CCTV' }))}
                    className="w-full px-3 py-2 border border-[var(--color-border)/50%] bg-[var(--color-background)/50%] text-[var(--color-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] backdrop-blur-sm"
                  >
                    <option value="Citizen">Citizen</option>
                    <option value="Volunteer">Volunteer</option>
                    <option value="Responder">Responder</option>
                    <option value="Drone">Drone</option>
                    <option value="AI Detection">AI Detection</option>
                    <option value="CCTV">CCTV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL' }))}
                    className="w-full px-3 py-2 border border-[var(--color-border)/50%] bg-[var(--color-background)/50%] text-[var(--color-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] backdrop-blur-sm"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-[var(--color-border)/50%] bg-[var(--color-background)/50%] text-[var(--color-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] backdrop-blur-sm"
                  placeholder="Enter report title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-[var(--color-border)/50%] bg-[var(--color-background)/50%] text-[var(--color-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] backdrop-blur-sm"
                  rows="3"
                  placeholder="Enter detailed description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-[var(--color-border)/50%] bg-[var(--color-background)/50%] text-[var(--color-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] backdrop-blur-sm"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Confidence (0-1)</label>
                <input
                  type="number"
                  value={formData.confidence}
                  onChange={(e) => setFormData(prev => ({ ...prev, confidence: parseFloat(e.target.value) || 0.8 }))}
                  className="w-full px-3 py-2 border border-[var(--color-border)/50%] bg-[var(--color-background)/50%] text-[var(--color-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] backdrop-blur-sm"
                  min="0"
                  max="1"
                  step="0.1"
                />
              </div>

              {createError && (
                <div className="p-3 bg-[var(--color-accent-red)/10%] text-[var(--color-accent-red)] rounded-md">
                  {createError}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowCreateForm(false);
                  }}
                  className="hover-shadow transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  type="submit"
                  disabled={createLoading}
                  className="hover-shadow transition-all duration-200"
                >
                  {createLoading ? 'Creating...' : 'Submit Report'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-[var(--color-text)] font-semibold">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-[var(--color-secondary)]" />
                  <span className="font-medium text-[var(--color-text)]">Reporter Types</span>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
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
                          className="hover-shadow transition-all duration-200 text-[var(--color-primary)]"
                        />
                        <span className="text-sm text-[var(--color-text)]">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-[var(--color-secondary)]" />
                  <span className="font-medium text-[var(--color-text)]">Severity Levels</span>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
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
                          className="hover-shadow transition-all duration-200 text-[var(--color-primary)]"
                        />
                        <Badge
                          variant={severity === 'CRITICAL' ? 'destructive' :
                                   severity === 'HIGH' ? 'outline' :
                                   severity === 'NORMAL' ? 'secondary' : 'default'}
                          className="text-[var(--color-text)]"
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
                  <ClipboardList className="h-4 w-4 text-[var(--color-secondary)]" />
                  <span className="font-medium text-[var(--color-text)]">Status</span>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
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
                          className="hover-shadow transition-all duration-200 text-[var(--color-primary)]"
                        />
                        <span className="text-sm text-[var(--color-text)]">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 text-[var(--color-secondary)]" />
                  <span className="font-medium text-[var(--color-text)]">Sort By</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="sortBy"
                      value="timestamp"
                      checked={sortBy === 'timestamp'}
                      onChange={(e) => {
                        setSortBy(e.target.value as typeof sortBy);
                      }}
                      className="hover-shadow transition-all duration-200 text-[var(--color-primary)]"
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
                      className="hover-shadow transition-all duration-200 text-[var(--color-primary)]"
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
                      className="hover-shadow transition-all duration-200 text-[var(--color-primary)]"
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
                      className="hover-shadow transition-all duration-200 text-[var(--color-primary)]"
                    />
                    Descending
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-[var(--color-text)] font-semibold">Reports List</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-96">
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 bg-gray-50 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">ID</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Reporter</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Severity</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Location</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 text-xs font-mono text-gray-400 max-w-[7rem]">
                          <div className="truncate" title={report.id}>{report.id}</div>
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-800 max-w-[12rem]">
                          <div className="truncate" title={report.title}>{report.title}</div>
                        </td>
                        <td className="px-3 py-2 max-w-[6rem]">
                          <div className="flex items-center gap-1 min-w-0">
                            {report.reporterType === 'Citizen' ? (
                              <Users className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                            ) : report.reporterType === 'Volunteer' ? (
                              <UserIcon className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                            ) : report.reporterType === 'Responder' ? (
                              <Activity className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                            ) : report.reporterType === 'Drone' ? (
                              <MapPin className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                            ) : report.reporterType === 'AI Detection' ? (
                              <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                            ) : (
                              <ClipboardList className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                            )}
                            <span className="truncate text-xs text-gray-500 capitalize">{report.reporterType.toLowerCase()}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant={report.severity === 'CRITICAL' ? 'destructive' : report.severity === 'HIGH' ? 'outline' : report.severity === 'NORMAL' ? 'secondary' : 'default'}>
                            {report.severity.toLowerCase()}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant={report.status === 'NEW' ? 'default' : report.status === 'VERIFIED' ? 'secondary' : report.status === 'INVESTIGATING' ? 'outline' : report.status === 'RESOLVED' ? 'success' : 'destructive'}>
                            {report.status.toLowerCase()}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 max-w-[7rem]">
                          <div className="truncate" title={report.location}>{report.location}</div>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-400 whitespace-nowrap">{report.formattedTimestamp}</td>
                      </tr>
                    ))}
                    {filteredReports.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-10">
                          <ClipboardList className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">No reports match the current filters</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
};