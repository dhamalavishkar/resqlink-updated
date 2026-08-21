import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Activity, Users, MapPin, ClipboardList, ZapOff, Zap } from 'lucide-react';

export const RiskAnalysisPage = () => {
  const [zones, setZones] = useState<Array<{
    id: number;
    name: string;
    riskScore: number;
    severity: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    population: number;
    survivors: number;
    fires: number;
    damage: number;
    reports: number;
    lastUpdated: string;
    priority: string;
    resources: string;
  }>>([]);
  const [filters, setFilters] = useState({
    minRisk: 0,
    maxRisk: 100,
    severities: ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
  });

  useState(() => {
    // Mock data
    setZones([
      {
        id: 1,
        name: 'Zone A-01',
        riskScore: 87,
        severity: 'CRITICAL',
        population: 1200,
        survivors: 12,
        fires: 1,
        damage: 2,
        reports: 8,
        lastUpdated: '2 minutes ago',
        priority: 'Immediate SAR and Fire Response',
        resources: 'Fire Truck x2, Ambulance x3, SAR Team'
      },
      {
        id: 2,
        name: 'Zone B-07',
        riskScore: 72,
        severity: 'HIGH',
        population: 800,
        survivors: 5,
        fires: 0,
        damage: 3,
        reports: 5,
        lastUpdated: '5 minutes ago',
        priority: 'SAR Team Deployment',
        resources: 'Ambulance x2, SAR Team, Medical Unit'
      },
      {
        id: 3,
        name: 'Zone C-03',
        riskScore: 45,
        severity: 'MEDIUM',
        population: 500,
        survivors: 0,
        fires: 0,
        damage: 1,
        reports: 3,
        lastUpdated: '10 minutes ago',
        priority: 'Monitor and Assess',
        resources: 'Medical Unit on Standby'
      },
      {
        id: 4,
        name: 'Zone D-09',
        riskScore: 28,
        severity: 'LOW',
        population: 300,
        survivors: 0,
        fires: 0,
        damage: 0,
        reports: 1,
        lastUpdated: '15 minutes ago',
        priority: 'Low Priority',
        resources: 'None Required'
      },
      {
        id: 5,
        name: 'Zone E-02',
        riskScore: 12,
        severity: 'SAFE',
        population: 200,
        survivors: 0,
        fires: 0,
        damage: 0,
        reports: 0,
        lastUpdated: '20 minutes ago',
        priority: 'No Action',
        resources: 'None Required'
      }
    ]);
  });

  const filteredZones = zones.filter(zone =>
    zone.riskScore >= filters.minRisk &&
    zone.riskScore <= filters.maxRisk &&
    filters.severities.includes(zone.severity)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Risk Analysis</h2>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="hover-shadow transition-all duration-200 text-[var(--color-secondary)] border-[var(--color-border)/30%] hover:border-[var(--color-primary)] hover:text-[var(--color-text)]">
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-[var(--color-text)] font-semibold">Risk Zones</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-[var(--color-text)]">
                  <thead className="text-xs text-[var(--color-text)]/70 uppercase bg-[var(--color-background)/50%]">
                    <tr>
                      <th scope="col" className="px-6 py-3">Zone</th>
                      <th scope="col" className="px-6 py-3">Risk Score</th>
                      <th scope="col" className="px-6 py-3">Severity</th>
                      <th scope="col" className="px-6 py-3">Population</th>
                      <th scope="col" className="px-6 py-3">Survivors</th>
                      <th scope="col" className="px-6 py-3">Fires</th>
                      <th scope="col" className="px-6 py-3">Damage</th>
                      <th scope="col" className="px-6 py-3">Reports</th>
                      <th scope="col" className="px-6 py-3">Priority</th>
                      <th scope="col" className="px-6 py-3">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredZones.map((zone, index) => (
                      <tr key={zone.id} className={index % 2 === 0 ? 'bg-[var(--color-background)]' : 'bg-[var(--color-background)/50%]'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-[var(--color-secondary)]" />
                            <span className="font-medium text-[var(--color-text)]">{zone.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Badge
                            variant={zone.severity === 'CRITICAL' ? 'destructive' :
                                     zone.severity === 'HIGH' ? 'outline' :
                                     zone.severity === 'MEDIUM' ? 'secondary' : 'default'}
                            className="text-xs"
                          >
                            {zone.riskScore}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Badge
                            variant={zone.severity === 'CRITICAL' ? 'destructive' :
                                     zone.severity === 'HIGH' ? 'outline' :
                                     zone.severity === 'MEDIUM' ? 'secondary' :
                                     zone.severity === 'LOW' ? 'default' : 'destructive'}
                          >
                            {zone.severity}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">{zone.population}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">{zone.survivors}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">{zone.fires}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">{zone.damage}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">{zone.reports}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{zone.priority}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--color-text)]/70">{zone.lastUpdated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-[var(--color-text)] font-semibold">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-[var(--color-secondary)]" />
                  <span className="font-medium text-[var(--color-text)]">Risk Score Range</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="w-16">Min:</span>
                    <input
                      type="number"
                      value={filters.minRisk}
                      onChange={(e) => setFilters(prev => ({ ...prev, minRisk: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))}))}
                      className="w-16 border border-[var(--color-border)/50%] bg-[var(--color-background)/50%] text-[var(--color-text)] rounded-md px-2 py-1 text-center focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] backdrop-blur-sm"
                      min="0"
                      max="100"
                    />
                    <span className="w-16">Max:</span>
                    <input
                      type="number"
                      value={filters.maxRisk}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxRisk: Math.max(0, Math.min(100, parseInt(e.target.value) || 100))}))}
                      className="w-16 border border-[var(--color-border)/50%] bg-[var(--color-background)/50%] text-[var(--color-text)] rounded-md px-2 py-1 text-center focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] backdrop-blur-sm"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-[var(--color-text)]/50">
                    0 - 100
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-[var(--color-secondary)]" />
                  <span className="font-medium text-[var(--color-text)]">Severity Levels</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Badge variant="destructive" className="h-3 w-3 text-[var(--color-background)] bg-[var(--color-accent-red)]">
                        CRITICAL
                      </Badge>
                    </div>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.severities.includes('CRITICAL')}
                        onChange={(e) => {
                          const newList = e.target.checked
                            ? [...filters.severities, 'CRITICAL']
                            : filters.severities.filter(s => s !== 'CRITICAL');
                          setFilters(prev => ({ ...prev, severities: newList }));
                        }}
                      />
                      Critical
                    </label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="h-3 w-3 text-[var(--color-text)] border border-[var(--color-border)/50%] bg-[var(--color-background)/50%]">
                        HIGH
                      </Badge>
                    </div>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.severities.includes('HIGH')}
                        onChange={(e) => {
                          const newList = e.target.checked
                            ? [...filters.severities, 'HIGH']
                            : filters.severities.filter(s => s !== 'HIGH');
                          setFilters(prev => ({ ...prev, severities: newList }));
                        }}
                      />
                      High
                    </label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Badge variant="secondary" className="h-3 w-3 text-[var(--color-background)] bg-[var(--color-secondary)]">
                        MEDIUM
                      </Badge>
                    </div>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.severities.includes('MEDIUM')}
                        onChange={(e) => {
                          const newList = e.target.checked
                            ? [...filters.severities, 'MEDIUM']
                            : filters.severities.filter(s => s !== 'MEDIUM');
                          setFilters(prev => ({ ...prev, severities: newList }));
                        }}
                      />
                      Medium
                    </label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Badge variant="default" className="h-3 w-3 text-[var(--color-background)] bg-[var(--color-primary)]">
                        LOW
                      </Badge>
                    </div>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.severities.includes('LOW')}
                        onChange={(e) => {
                          const newList = e.target.checked
                            ? [...filters.severities, 'LOW']
                            : filters.severities.filter(s => s !== 'LOW');
                          setFilters(prev => ({ ...prev, severities: newList }));
                        }}
                      />
                      Low
                    </label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Badge variant="destructive" className="h-3 w-3 text-[var(--color-background)] bg-[var(--color-accent-red)]">
                        SAFE
                      </Badge>
                    </div>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.severities.includes('SAFE')}
                        onChange={(e) => {
                          const newList = e.target.checked
                            ? [...filters.severities, 'SAFE']
                            : filters.severities.filter(s => s !== 'SAFE');
                          setFilters(prev => ({ ...prev, severities: newList }));
                        }}
                      />
                      Safe
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[var(--color-text)] font-semibold">Risk Calculation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-[var(--color-background)/50%] rounded-md">
                <h4 className="font-medium text-[var(--color-text)]">Zone A-01 Risk Breakdown</h4>
                <p className="text-[var(--color-text)]/60 text-sm mt-2">
                  Total Risk Score: 87/100
                </p>
                <div className="mt-3 space-y-2 text-[var(--color-text)]/60 text-xs">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Users className="h-4 w-4 text-[var(--color-accent-green)]" />
                    </div>
                    <div>
                      <span className="font-medium text-[var(--color-text)]">Survivors Factor:</span> 12 survivors × 3.0 = 36.0
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Activity className="h-4 w-4 text-[var(--color-accent-red)]" />
                    </div>
                    <div>
                      <span className="font-medium text-[var(--color-text)]">Fire Factor:</span> 1 fire × 20.0 = 20.0
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-4 w-4 text-[var(--color-accent-yellow)]" />
                    </div>
                    <div>
                      <span className="font-medium text-[var(--color-text)]">Damage Factor:</span> 2 damage × 10.0 = 20.0
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <ClipboardList className="h-4 w-4 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <span className="font-medium text-[var(--color-text)]">Reports Factor:</span> 8 reports × 1.5 = 12.0
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <MapPin className="h-4 w-4 text-[var(--color-text)]/50" />
                    </div>
                    <div>
                      <span className="font-medium text-[var(--color-text)]">Population Factor:</span> 1200 pop × 0.005 = 6.0
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Zap className="h-4 w-4 text-[var(--color-accent-yellow)]" />
                    </div>
                    <div>
                      <span className="font-medium text-[var(--color-text)]">Accessibility Factor:</span> Poor roads × -5.0 = -5.0
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <ZapOff className="h-4 w-4 text-[var(--color-text)]/50" />
                    </div>
                    <div>
                      <span className="font-medium text-[var(--color-text)]">Recency Factor:</span> 2 min old × 2.0 = 4.0
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--color-border)/30%]">
                  <p className="font-medium text-[var(--color-text)]">Recommended Action:</p>
                  <p className="mt-1 text-sm text-[var(--color-text)]/60">
                    Deploy immediate search-and-rescue team and fire response unit.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};