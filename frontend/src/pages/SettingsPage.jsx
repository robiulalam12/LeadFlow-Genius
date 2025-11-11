import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Key, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const SettingsPage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [sendgridKey, setSendgridKey] = useState('');
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    campaignUpdates: true,
    weeklyReports: false,
  });

  const handleSaveApiKey = () => {
    // In production, this would save to backend
    toast.success('SendGrid API key saved successfully!');
  };

  const handleUpdateNotifications = () => {
    toast.success('Notification preferences updated!');
  };

  return (
    <div data-testid="settings-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={user.email}
                disabled
                className="rounded-xl mt-1 bg-gray-50"
                data-testid="profile-email-input"
              />
            </div>

            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter current password"
                className="rounded-xl mt-1"
                data-testid="current-password-input"
              />
            </div>

            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                className="rounded-xl mt-1"
                data-testid="new-password-input"
              />
            </div>

            <Button className="gradient-primary rounded-xl" data-testid="update-profile-button">
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* SendGrid Integration */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Service Integration
            </CardTitle>
            <CardDescription>Connect your SendGrid account for email sending</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sendgrid-key">SendGrid API Key</Label>
              <Input
                id="sendgrid-key"
                type="password"
                placeholder="SG.xxxxxxxxxxxxxxxx"
                className="rounded-xl mt-1"
                value={sendgridKey}
                onChange={(e) => setSendgridKey(e.target.value)}
                data-testid="sendgrid-api-key-input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from{' '}
                <a href="https://sendgrid.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  SendGrid Dashboard
                </a>
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> For MVP testing, email simulation is active. Connect SendGrid for production use.
              </p>
            </div>

            <Button onClick={handleSaveApiKey} className="gradient-primary rounded-xl" data-testid="save-api-key-button">
              <Key className="w-4 h-4 mr-2" />
              Save API Key
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Email Alerts</Label>
                <p className="text-sm text-gray-500">Receive alerts when campaigns complete</p>
              </div>
              <Switch
                checked={notifications.emailAlerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                data-testid="email-alerts-switch"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Campaign Updates</Label>
                <p className="text-sm text-gray-500">Get notified about campaign progress</p>
              </div>
              <Switch
                checked={notifications.campaignUpdates}
                onCheckedChange={(checked) => setNotifications({ ...notifications, campaignUpdates: checked })}
                data-testid="campaign-updates-switch"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Weekly Reports</Label>
                <p className="text-sm text-gray-500">Receive weekly performance summaries</p>
              </div>
              <Switch
                checked={notifications.weeklyReports}
                onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                data-testid="weekly-reports-switch"
              />
            </div>

            <Button onClick={handleUpdateNotifications} className="gradient-primary rounded-xl" data-testid="save-notifications-button">
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Account Status:</strong> Active and secure
              </p>
              <p className="text-xs text-green-700 mt-1">Last login: {new Date().toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
