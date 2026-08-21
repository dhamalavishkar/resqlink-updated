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
        <h2 className="text-xl font-bold text-[var(--color-text)]">Settings</h2>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="hover-shadow transition-all duration-200"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-[var(--color-text)] font-semibold">Application Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-[var(--color-secondary)]" />
                  <span className="font-medium text-[var(--color-text)]">General</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Moon className="h-4 w-4 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[var(--color-text)]">Theme</h4>
                      <p className="text-[var(--color-text)]/60 text-sm">
                        Choose interface appearance
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Activity className="h-4 w-4 text-[var(--color-accent-green)]" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-[var(--color-text)]">
                        <input
                          type="radio"
                          name="theme"
                          value="light"
                          checked={theme === 'light'}
                          onChange={(e) => setTheme(e.target.value as typeof theme)}
                          className="text-[var(--color-primary)] hover-shadow transition-all duration-200"
                        />
                        Light
                      </label>
                      <label className="text-sm font-medium text-[var(--color-text)] ml-4">
                        <input
                          type="radio"
                          name="theme"
                          value="dark"
                          checked={theme === 'dark'}
                          onChange={(e) => setTheme(e.target.value as typeof theme)}
                          className="text-[var(--color-primary)] hover-shadow transition-all duration-200"
                        />
                        Dark
                      </label>
                      <label className="text-sm font-medium text-[var(--color-text)] ml-4">
                        <input
                          type="radio"
                          name="theme"
                          value="system"
                          checked={theme === 'system'}
                          onChange={(e) => setTheme(e.target.value as typeof theme)}
                          className="text-[var(--color-primary)] hover-shadow transition-all duration-200"
                        />
                        System
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-[var(--color-secondary)]" />
                  <span className="font-medium text-[var(--color-text)]">Demo Mode</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Activity className="h-4 w-4 text-[var(--color-accent-blue)]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--color-text)]">Simulation Settings</h4>
                    <p className="text-[var(--color-text)]/60 text-sm">
                      Enable demo mode for simulated disaster scenarios
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 mt-2">
                    <div className="flex-shrink-0">
                      <CheckCheck className="h-4 w-4 text-[var(--color-accent-green)]" />
                    </div>
                    <label className="text-sm font-medium text-[var(--color-text)]">
                      <input
                        type="checkbox"
                        checked={demoMode}
                        onChange={(e) => setDemoMode(e.target.checked)}
                        className="hover-shadow transition-all duration-200 text-[var(--color-primary)]"
                      />
                      Enable Demo Mode
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-[var(--color-secondary)]" />
                  <span className="font-medium text-[var(--color-text)]">Network & Connectivity</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <WifiOff className="h-4 w-4 text-[var(--color-accent-blue)]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[var(--color-text)]">Online Status Preferences</h4>
                      <p className="text-[var(--color-text)]/60 text-sm">
                        Configure how the app behaves when online/offline
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 mt-2">
                    <div className="flex-shrink-0">
                      <Activity className="h-4 w-4 text-[var(--color-accent-green)]" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-[var(--color-text)]">
                        <input
                          type="checkbox"
                          checked={true}
                          disabled
                        />
                        Allow offline operation
                      </label>
                      <label className="text-sm font-medium text-[var(--color-text)] ml-4">
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
              <CardTitle className="text-[var(--color-text)] font-semibold">Alert & Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-[var(--color-secondary)]" />
                  <span className="font-medium text-[var(--color-text)]">Notifications</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Users className="h-4 w-4 text-[var(--color-accent-blue)]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[var(--color-text)]">Email Notifications</h4>
                      <p className="text-[var(--color-text)]/60 text-sm">
                        Receive alerts via email
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Activity className="h-4 w-4 text-[var(--color-accent-green)]" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-[var(--color-text)]">
                        <input
                          type="checkbox"
                          checked={notifications.email}
                          onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                          className="hover-shadow transition-all duration-200 text-[var(--color-primary)]"
                        />
                        Enabled
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Zap className="h-4 w-4 text-[var(--color-accent-blue)]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[var(--color-text)]">Push Notifications</h4>
                      <p className="text-[var(--color-text)]/60 text-sm">
                        Receive browser push alerts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Users className="h-4 w-4 text-[var(--color-secondary)]" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-[var(--color-text)]">
                        <input
                          type="checkbox"
                          checked={notifications.push}
                          onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                          className="hover-shadow transition-all duration-200 text-[var(--color-primary)]"
                        />
                        Enabled
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Users className="h-4 w-4 text-[var(--color-accent-blue)]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[var(--color-text)]">SMS Notifications</h4>
                      <p className="text-[var(--color-text)]/60 text-sm">
                        Receive alerts via text message
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Zap className="h-4 w-4 text-[var(--color-secondary)]" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-[var(--color-text)]">
                        <input
                          type="checkbox"
                          checked={notifications.sms}
                          onChange={(e) => setNotifications(prev => ({ ...prev, sms: e.target.checked }))}
                          className="hover-shadow transition-all duration-200 text-[var(--color-primary)]"
                        />
                        Enabled
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-[var(--color-secondary)]" />
                  <span className="font-medium text-[var(--color-text)]">Alert Thresholds</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Activity className="h-4 w-4 text-[var(--color-accent-red)]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[var(--color-text)]">Critical Alert Level</h4>
                      <p className="text-[var(--color-text)]/60 text-sm">
                        Minimum risk score to trigger critical alerts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Activity className="h-4 w-4 text-[var(--color-accent-orange)]" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-[var(--color-text)]">
                        <input
                          type="number"
                          value={alertThresholds.critical}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                            setAlertThresholds(prev => ({ ...prev, critical: val }));
                          }}
                          className="w-16 border border-[var(--color-border)/50%] bg-[var(--color-background)/50%] text-[var(--color-text)] rounded-md px-2 py-1 text-center focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] backdrop-blur-sm"
                          min="0"
                          max="100"
                        />
                        <span className="ml-2 text-[var(--color-text)]/50">/100</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Activity className="h-4 w-4 text-[var(--color-accent-yellow)]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-[var(--color-text)]">High Alert Level</h4>
                        <p className="text-[var(--color-text)]/60 text-sm">
                          Minimum risk score to trigger high alerts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Activity className="h-4 w-4 text-[var(--color-accent-blue)]" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-[var(--color-text)]">
                          <input
                            type="number"
                            value={alertThresholds.high}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                              setAlertThresholds(prev => ({ ...prev, high: val }));
                            }}
                            className="w-16 border border-[var(--color-border)/50%] bg-[var(--color-background)/50%] text-[var(--color-text)] rounded-md px-2 py-1 text-center focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] backdrop-blur-sm"
                            min="0"
                            max="100"
                          />
                          <span className="ml-2 text-[var(--color-text)]/50">/100</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Activity className="h-4 w-4 text-[var(--color-accent-green)]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-[var(--color-text)]">Medium Alert Level</h4>
                        <p className="text-[var(--color-text)]/60 text-sm">
                          Minimum risk score to trigger medium alerts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Activity className="h-4 w-4 text-[var(--color-text)]/50" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-[var(--color-text)]">
                          <input
                            type="number"
                            value={alertThresholds.medium}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                              setAlertThresholds(prev => ({ ...prev, medium: val }));
                            }}
                            className="w-16 border border-[var(--color-border)/50%] bg-[var(--color-background)/50%] text-[var(--color-text)] rounded-md px-2 py-1 text-center focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] backdrop-blur-sm"
                            min="0"
                            max="100"
                          />
                          <span className="ml-2 text-[var(--color-text)]/50">/100</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Activity className="h-4 w-4 text-[var(--color-text)]/50" />
                      </div>
                      <div>
                        <h4 className="font-medium text-[var(--color-text)]">Low Alert Level</h4>
                        <p className="text-[var(--color-text)]/60 text-sm">
                          Minimum risk score to trigger low alerts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Activity className="h-4 w-4 text-[var(--color-text)]/50" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-[var(--color-text)]">
                          <input
                            type="number"
                            value={alertThresholds.low}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                              setAlertThresholds(prev => ({ ...prev, low: val }));
                            }}
                            className="w-16 border border-[var(--color-border)/50%] bg-[var(--color-background)/50%] text-[var(--color-text)] rounded-md px-2 py-1 text-center focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] backdrop-blur-sm"
                            min="0"
                            max="100"
                          />
                          <span className="ml-2 text-[var(--color-text)]/50">/100</span>
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
            <CardTitle className="text-[var(--color-text)] font-semibold">About ResQLink</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <MapPin className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <div>
                <h4 className="font-medium text-[var(--color-text)]">Version</h4>
                <p className="text-[var(--color-text)]/60 text-sm">0.1.0 (Hackathon MVP)</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <HelpCircle className="h-5 w-5 text-[var(--color-accent-green)]" />
              </div>
              <div>
                <h4 className="font-medium text-[var(--color-text)]">Description</h4>
                <p className="text-[var(--color-text)]/60 text-sm">
                  Emergency Intelligence Platform for disaster response coordination.
                  See the disaster. Connect the people. Coordinate the rescue.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Settings className="h-5 w-5 text-[var(--color-accent-purple)]" />
              </div>
              <div>
                <h4 className="font-medium text-[var(--color-text)]">Technology Stack</h4>
                <p className="text-[var(--color-text)]/60 text-sm">
                  React • TypeScript • FastAPI • Supabase • YOLOv8 • WebRTC
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 mt-2">
              <div className="flex-shrink-0">
                <LogOut className="h-5 w-5 text-[var(--color-accent-red)]" />
              </div>
              <div>
                <h4 className="font-medium text-[var(--color-text)]">Logout</h4>
                <p className="text-[var(--color-text)]/60 text-sm">
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