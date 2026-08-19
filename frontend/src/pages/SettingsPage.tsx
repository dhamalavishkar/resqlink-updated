import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WifiOff, Zap, Users, Activity, AlertTriangle, MapPin, HelpCircle, Settings, LogOut, Moon, Sun, CheckCheck, X } from 'lucide-react';

export const SettingsPage = () => {
  const [demoMode, setDemoMode] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });
  const [alertThresholds, setAlertThresholds] = useState({
    critical: 80,
    high: 60,
    medium: 40,
    low: 20
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate saving to backend
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">General</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Moon className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Theme</h4>
                      <p className="text-sm text-gray-500">
                        Choose interface appearance
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Activity className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">
                        <input
                          type="radio"
                          name="theme"
                          value="light"
                          checked={theme === 'light'}
                          onChange={(e) => setTheme(e.target.value as typeof theme)}
                        />
                        Light
                      </label>
                      <label className="text-sm font-medium text-gray-700 ml-4">
                        <input
                          type="radio"
                          name="theme"
                          value="dark"
                          checked={theme === 'dark'}
                          onChange={(e) => setTheme(e.target.value as typeof theme)}
                        />
                        Dark
                      </label>
                      <label className="text-sm font-medium text-gray-700 ml-4">
                        <input
                          type="radio"
                          name="theme"
                          value="system"
                          checked={theme === 'system'}
                          onChange={(e) => setTheme(e.target.value as typeof theme)}
                        />
                        System
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Demo Mode</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Activity className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Simulation Settings</h4>
                    <p className="text-sm text-gray-500">
                      Enable demo mode for simulated disaster scenarios
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 mt-2">
                    <div className="flex-shrink-0">
                      <CheckCheck className="h-4 w-4 text-green-500" />
                    </div>
                    <label className="text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={demoMode}
                        onChange={(e) => setDemoMode(e.target.checked)}
                      />
                      Enable Demo Mode
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Network & Connectivity</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <WifiOff className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Online Status Preferences</h4>
                      <p className="text-sm text-gray-500">
                        Configure how the app behaves when online/offline
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 mt-2">
                    <div className="flex-shrink-0">
                      <Activity className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={true}
                          disabled
                        />
                        Allow offline operation
                      </label>
                      <label className="text-sm font-medium text-gray-700 ml-4">
                        <input
                          type="checkbox"
                          checked={false}
                          disabled
                        />
                        Auto-sync when online
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Alert & Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Notifications</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">
                        Receive alerts via email
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Activity className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={notifications.email}
                          onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                        />
                        Enabled
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Zap className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Push Notifications</h4>
                      <p className="text-sm text-gray-500">
                        Receive browser push alerts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Users className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={notifications.push}
                          onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                        />
                        Enabled
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                      <p className="text-sm text-gray-500">
                        Receive alerts via text message
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Zap className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={notifications.sms}
                          onChange={(e) => setNotifications(prev => ({ ...prev, sms: e.target.checked }))}
                        />
                        Enabled
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Alert Thresholds</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Activity className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Critical Alert Level</h4>
                      <p className="text-sm text-gray-500">
                        Minimum risk score to trigger critical alerts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Activity className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">
                        <input
                          type="number"
                          value={alertThresholds.critical}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                            setAlertThresholds(prev => ({ ...prev, critical: val }));
                          }}
                          className="w-16 border border-gray-300 rounded-md px-2 py-1 text-center"
                          min="0"
                          max="100"
                        />
                        <span className="ml-2">/100</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Activity className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">High Alert Level</h4>
                        <p className="text-sm text-gray-500">
                          Minimum risk score to trigger high alerts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Activity className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">
                          <input
                            type="number"
                            value={alertThresholds.high}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                              setAlertThresholds(prev => ({ ...prev, high: val }));
                            }}
                            className="w-16 border border-gray-300 rounded-md px-2 py-1 text-center"
                            min="0"
                            max="100"
                          />
                          <span className="ml-2">/100</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Activity className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Medium Alert Level</h4>
                        <p className="text-sm text-gray-500">
                          Minimum risk score to trigger medium alerts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Activity className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">
                          <input
                            type="number"
                            value={alertThresholds.medium}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                              setAlertThresholds(prev => ({ ...prev, medium: val }));
                            }}
                            className="w-16 border border-gray-300 rounded-md px-2 py-1 text-center"
                            min="0"
                            max="100"
                          />
                          <span className="ml-2">/100</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Activity className="h-4 w-4 text-gray-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Low Alert Level</h4>
                        <p className="text-sm text-gray-500">
                          Minimum risk score to trigger low alerts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Activity className="h-4 w-4 text-gray-100" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">
                          <input
                            type="number"
                            value={alertThresholds.low}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                              setAlertThresholds(prev => ({ ...prev, low: val }));
                            }}
                            className="w-16 border border-gray-300 rounded-md px-2 py-1 text-center"
                            min="0"
                            max="100"
                          />
                          <span className="ml-2">/100</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>About ResQLink</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <MapPin className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Version</h4>
                <p className="text-sm text-gray-500">0.1.0 (Hackathon MVP)</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <HelpCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Description</h4>
                <p className="text-sm text-gray-500">
                  Emergency Intelligence Platform for disaster response coordination.
                  See the disaster. Connect the people. Coordinate the rescue.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Settings className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Technology Stack</h4>
                <p className="text-sm text-gray-500">
                  React • TypeScript • FastAPI • Supabase • YOLOv8 • WebRTC
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 mt-2">
              <div className="flex-shrink-0">
                <LogOut className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Logout</h4>
                <p className="text-sm text-gray-500">
                  Securely end your session
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};