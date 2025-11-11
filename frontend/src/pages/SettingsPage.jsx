import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Key,
  Bell,
  Shield,
  Plus,
  Edit,
  Trash2,
  Power,
  CheckCircle,
  XCircle,
  Star,
  Download,
  CreditCard,
  Globe,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { API } from '@/App';

const SettingsPage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Email Accounts State
  const [emailAccounts, setEmailAccounts] = useState([
    {
      id: 1,
      email: 'primary@gmail.com',
      type: 'Gmail',
      status: 'Active',
      daily_limit: 200,
      sent_today: 45,
      errors_today: 2,
      is_primary: true,
      sender_name: 'LeadFlow Team',
    },
    {
      id: 2,
      email: 'support@company.com',
      type: 'SMTP',
      status: 'Active',
      daily_limit: 150,
      sent_today: 23,
      errors_today: 0,
      is_primary: false,
      sender_name: 'Support Team',
    },
  ]);

  const [showGmailDialog, setShowGmailDialog] = useState(false);
  const [showSMTPDialog, setShowSMTPDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  // SMTP Form State
  const [smtpForm, setSmtpForm] = useState({
    email: '',
    sender_name: '',
    host: '',
    port: '587',
    username: '',
    password: '',
    daily_limit: 100,
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    campaign_completed: { email: true, inApp: true },
    follow_up_reply: { email: true, inApp: true },
    weekly_report: { email: false, inApp: true },
    login_alerts: { email: true, inApp: true },
  });

  // Email Sending Rules
  const [sendingRules, setSendingRules] = useState({
    default_daily_limit: 100,
    max_retries: 3,
    retry_delay_minutes: 30,
    enable_fallback: true,
  });

  const handleConnectGmail = () => {
    // Simulate OAuth2 flow
    toast.success('Gmail OAuth flow initiated! (Simulated in MVP)');
    const newAccount = {
      id: Date.now(),
      email: 'newgmail@gmail.com',
      type: 'Gmail',
      status: 'Active',
      daily_limit: 200,
      sent_today: 0,
      errors_today: 0,
      is_primary: false,
      sender_name: 'LeadFlow',
    };
    setEmailAccounts([...emailAccounts, newAccount]);
    setShowGmailDialog(false);
  };

  const handleTestSMTPConnection = async () => {
    toast.info('Testing SMTP connection...');
    // Simulate connection test
    setTimeout(() => {
      toast.success('SMTP connection successful!');
    }, 1500);
  };

  const handleSaveSMTPAccount = () => {
    if (!smtpForm.email || !smtpForm.host || !smtpForm.username || !smtpForm.password) {
      toast.error('Please fill all required fields');
      return;
    }

    const newAccount = {
      id: Date.now(),
      email: smtpForm.email,
      type: 'SMTP',
      status: 'Active',
      daily_limit: smtpForm.daily_limit,
      sent_today: 0,
      errors_today: 0,
      is_primary: false,
      sender_name: smtpForm.sender_name,
      smtp_config: {
        host: smtpForm.host,
        port: smtpForm.port,
        username: smtpForm.username,
      },
    };

    setEmailAccounts([...emailAccounts, newAccount]);
    setShowSMTPDialog(false);
    setSmtpForm({
      email: '',
      sender_name: '',
      host: '',
      port: '587',
      username: '',
      password: '',
      daily_limit: 100,
    });
    toast.success('SMTP account added successfully!');
  };

  const handleSetPrimary = (accountId) => {
    setEmailAccounts(
      emailAccounts.map((acc) => ({
        ...acc,
        is_primary: acc.id === accountId,
      }))
    );
    toast.success('Primary email account updated!');
  };

  const handleDeactivate = (accountId) => {
    setEmailAccounts(
      emailAccounts.map((acc) =>
        acc.id === accountId ? { ...acc, status: acc.status === 'Active' ? 'Inactive' : 'Active' } : acc
      )
    );
    toast.success('Account status updated!');
  };

  const handleDeleteAccount = (accountId) => {
    if (emailAccounts.length === 1) {
      toast.error('Cannot delete the last email account');
      return;
    }
    setEmailAccounts(emailAccounts.filter((acc) => acc.id !== accountId));
    toast.success('Email account deleted');
  };

  const handleExportLeads = () => {
    toast.success('Exporting leads... Download will start shortly');
  };

  const handleExportEmails = () => {
    toast.success('Exporting email history... Download will start shortly');
  };

  const handleDeleteAllData = () => {
    toast.error('This action requires confirmation');
  };

  return (
    <div data-testid="settings-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-500">Manage your account, integrations, and preferences</p>
      </div>

      <Tabs defaultValue="email-accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="email-accounts">
            <Mail className="w-4 h-4 mr-2" />
            Email Accounts
          </TabsTrigger>
          <TabsTrigger value="sending-rules">
            <Globe className="w-4 h-4 mr-2" />
            Sending Rules
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="data">
            <Download className="w-4 h-4 mr-2" />
            Data & Export
          </TabsTrigger>
        </TabsList>

        {/* EMAIL ACCOUNTS TAB */}
        <TabsContent value="email-accounts" className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Connected Email Accounts</h2>
              <p className="text-sm text-gray-500 mt-1">Manage unlimited email accounts for sending campaigns</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl" onClick={() => setShowGmailDialog(true)}>
                <Mail className="w-4 h-4 mr-2" />
                Connect Gmail
              </Button>
              <Button className="gradient-primary rounded-xl" onClick={() => setShowSMTPDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Connect SMTP
              </Button>
            </div>
          </div>

          {/* Email Accounts List */}
          <div className="space-y-4">
            {emailAccounts.map((account) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <Card className={`border-2 ${account.is_primary ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                  {account.is_primary && (
                    <div className="absolute -top-3 left-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Primary Account
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <Mail className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{account.email}</h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                account.status === 'Active'
                                  ? 'bg-green-100 text-green-700'
                                  : account.status === 'Error'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {account.status === 'Active' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                              {account.status === 'Error' && <XCircle className="w-3 h-3 inline mr-1" />}
                              {account.status}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                              {account.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">Sender Name: {account.sender_name}</p>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="p-3 bg-white rounded-xl border border-gray-200">
                              <p className="text-xs text-gray-500 mb-1">Daily Limit</p>
                              <p className="text-lg font-bold text-gray-900">{account.daily_limit}</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-gray-200">
                              <p className="text-xs text-gray-500 mb-1">Sent Today</p>
                              <p className="text-lg font-bold text-blue-600">{account.sent_today}</p>
                              <div className="w-full bg-gray-200 h-1 rounded-full mt-2">
                                <div
                                  className="h-1 rounded-full bg-blue-500"
                                  style={{ width: `${(account.sent_today / account.daily_limit) * 100}%` }}
                                />
                              </div>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-gray-200">
                              <p className="text-xs text-gray-500 mb-1">Errors Today</p>
                              <p className={`text-lg font-bold ${account.errors_today > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {account.errors_today}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 ml-4">
                        {!account.is_primary && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => handleSetPrimary(account.id)}
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Set Primary
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => setEditingAccount(account)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => handleDeactivate(account.id)}
                        >
                          <Power className="w-3 h-3 mr-1" />
                          {account.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Gmail Connection Dialog */}
          <Dialog open={showGmailDialog} onOpenChange={setShowGmailDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Connect Gmail Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">OAuth2 Authentication</h4>
                  <p className="text-sm text-blue-700">
                    You'll be redirected to Google's secure login page to authorize LeadFlow Genius to send emails on your
                    behalf.
                  </p>
                </div>
                <Button onClick={handleConnectGmail} className="w-full gradient-primary rounded-xl">
                  <Mail className="w-4 h-4 mr-2" />
                  Continue with Google
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* SMTP Connection Dialog */}
          <Dialog open={showSMTPDialog} onOpenChange={setShowSMTPDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Connect SMTP Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email Address *</Label>
                    <Input
                      placeholder="your@domain.com"
                      className="rounded-xl mt-1"
                      value={smtpForm.email}
                      onChange={(e) => setSmtpForm({ ...smtpForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Sender Name *</Label>
                    <Input
                      placeholder="Your Name"
                      className="rounded-xl mt-1"
                      value={smtpForm.sender_name}
                      onChange={(e) => setSmtpForm({ ...smtpForm, sender_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label>SMTP Host *</Label>
                    <Input
                      placeholder="smtp.gmail.com"
                      className="rounded-xl mt-1"
                      value={smtpForm.host}
                      onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Port *</Label>
                    <Input
                      placeholder="587"
                      className="rounded-xl mt-1"
                      value={smtpForm.port}
                      onChange={(e) => setSmtpForm({ ...smtpForm, port: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Username *</Label>
                    <Input
                      placeholder="username"
                      className="rounded-xl mt-1"
                      value={smtpForm.username}
                      onChange={(e) => setSmtpForm({ ...smtpForm, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="rounded-xl mt-1"
                      value={smtpForm.password}
                      onChange={(e) => setSmtpForm({ ...smtpForm, password: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Daily Sending Limit</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    className="rounded-xl mt-1"
                    value={smtpForm.daily_limit}
                    onChange={(e) => setSmtpForm({ ...smtpForm, daily_limit: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended: 50-200 per day</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={handleTestSMTPConnection} className="flex-1 rounded-xl">
                    Test Connection
                  </Button>
                  <Button onClick={handleSaveSMTPAccount} className="flex-1 gradient-primary rounded-xl">
                    Save & Connect
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* SENDING RULES TAB */}
        <TabsContent value="sending-rules" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Email Sending Rules</CardTitle>
              <CardDescription>Configure how emails are sent and retried</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Default Daily Limit Per Account</Label>
                <Input
                  type="number"
                  className="rounded-xl mt-1"
                  value={sendingRules.default_daily_limit}
                  onChange={(e) => setSendingRules({ ...sendingRules, default_daily_limit: parseInt(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-1">This applies to new accounts</p>
              </div>

              <div>
                <Label>Maximum Retry Attempts</Label>
                <Select
                  value={sendingRules.max_retries.toString()}
                  onValueChange={(value) => setSendingRules({ ...sendingRules, max_retries: parseInt(value) })}
                >
                  <SelectTrigger className="rounded-xl mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 time</SelectItem>
                    <SelectItem value="2">2 times</SelectItem>
                    <SelectItem value="3">3 times</SelectItem>
                    <SelectItem value="5">5 times</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">How many times to retry failed emails</p>
              </div>

              <div>
                <Label>Retry Delay (minutes)</Label>
                <Input
                  type="number"
                  className="rounded-xl mt-1"
                  value={sendingRules.retry_delay_minutes}
                  onChange={(e) =>
                    setSendingRules({ ...sendingRules, retry_delay_minutes: parseInt(e.target.value) })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">Wait time between retry attempts</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div>
                  <Label className="font-semibold">Enable Fallback Accounts</Label>
                  <p className="text-xs text-gray-600 mt-1">
                    If primary account fails or hits limit, automatically switch to backup
                  </p>
                </div>
                <Switch
                  checked={sendingRules.enable_fallback}
                  onCheckedChange={(checked) => setSendingRules({ ...sendingRules, enable_fallback: checked })}
                />
              </div>

              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Error Handling
                </h4>
                <p className="text-sm text-orange-800">
                  Failed emails are logged with detailed error reasons. Bounced emails are automatically marked and
                  excluded from future campaigns.
                </p>
              </div>

              <Button className="gradient-primary rounded-xl">
                <Lock className="w-4 h-4 mr-2" />
                Save Rules
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how and when you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 capitalize">
                        {key.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {key === 'campaign_completed' && 'Get notified when email campaigns finish'}
                        {key === 'follow_up_reply' && 'Alert when leads reply to your emails'}
                        {key === 'weekly_report' && 'Receive weekly performance summaries'}
                        {key === 'login_alerts' && 'Security alerts for account access'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Email</Label>
                      <Switch
                        checked={value.email}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            [key]: { ...value, email: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">In-App</Label>
                      <Switch
                        checked={value.inApp}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            [key]: { ...value, inApp: checked },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button className="gradient-primary rounded-xl">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={user.email} disabled className="rounded-xl mt-1 bg-gray-50" />
              </div>

              <div>
                <Label>Current Password</Label>
                <Input type="password" placeholder="Enter current password" className="rounded-xl mt-1" />
              </div>

              <div>
                <Label>New Password</Label>
                <Input type="password" placeholder="Enter new password" className="rounded-xl mt-1" />
              </div>

              <Button className="gradient-primary rounded-xl">Update Profile</Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Status:</strong> Active and secure
                </p>
                <p className="text-xs text-green-700 mt-1">Last login: {new Date().toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DATA & EXPORT TAB */}
        <TabsContent value="data" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Data Management & Export</CardTitle>
              <CardDescription>Download your data or manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Export Lead History</h4>
                <p className="text-sm text-blue-700 mb-3">Download all your scraped leads as CSV or JSON</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-xl" onClick={handleExportLeads}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" className="rounded-xl" onClick={handleExportLeads}>
                    <Download className="w-4 h-4 mr-2" />
                    Export JSON
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Export Email History</h4>
                <p className="text-sm text-purple-700 mb-3">Download complete campaign and email send history</p>
                <Button variant="outline" className="rounded-xl" onClick={handleExportEmails}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Email History
                </Button>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Danger Zone
                </h4>
                <p className="text-sm text-red-700 mb-3">Permanently delete your account and all associated data</p>
                <Button variant="outline" className="rounded-xl text-red-600" onClick={handleDeleteAllData}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing (Coming Soon)
              </CardTitle>
              <CardDescription>Manage subscriptions and payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Billing and subscription management will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
