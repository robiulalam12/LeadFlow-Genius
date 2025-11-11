import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Mail,
  Plus,
  Trash2,
  Eye,
  MousePointer,
  Reply,
  Sparkles,
  Clock,
  Settings,
  Send,
  Pause,
  Play,
  Users,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { API } from '@/App';

const EmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEmailAccountDialog, setShowEmailAccountDialog] = useState(false);
  const [emailAccounts, setEmailAccounts] = useState([
    { id: 1, name: 'Primary Gmail', type: 'Gmail', email: 'primary@gmail.com', daily_limit: 100, status: 'active' },
  ]);
  const [formData, setFormData] = useState({
    name: '',
    email_account_id: 1,
    subject: '',
    body: '',
    follow_up_enabled: true,
    follow_up_delay_days: 3,
    send_time_start: '09:00',
    send_time_end: '17:00',
    max_per_day: 50,
  });
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCampaigns();
    fetchLeads();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`${API}/campaigns`);
      setCampaigns(response.data);
    } catch (error) {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API}/leads?limit=100`);
      setLeads(response.data.leads);
    } catch (error) {
      console.error('Failed to load leads');
    }
  };

  const handleGenerateWithAI = async () => {
    try {
      const response = await axios.post(`${API}/ai/generate-follow-up`, {
        lead_name: 'Business Owner',
        business_name: 'Sample Business',
        tone: 'Friendly',
      });
      setFormData({
        ...formData,
        subject: response.data.subject,
        body: response.data.body,
      });
      toast.success('Email generated with AI!');
    } catch (error) {
      toast.error('Failed to generate email');
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();

    if (selectedLeadIds.length === 0) {
      toast.error('Please select at least one lead');
      return;
    }

    try {
      await axios.post(`${API}/campaigns`, {
        name: formData.name,
        subject: formData.subject,
        body: formData.body,
        lead_ids: selectedLeadIds,
        follow_up_enabled: formData.follow_up_enabled,
        follow_up_delay_days: formData.follow_up_delay_days,
      });

      toast.success('Campaign created and started!');
      setShowCreateDialog(false);
      setFormData({
        name: '',
        email_account_id: 1,
        subject: '',
        body: '',
        follow_up_enabled: true,
        follow_up_delay_days: 3,
        send_time_start: '09:00',
        send_time_end: '17:00',
        max_per_day: 50,
      });
      setSelectedLeadIds([]);
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  const deleteCampaign = async (campaignId) => {
    try {
      await axios.delete(`${API}/campaigns/${campaignId}`);
      toast.success('Campaign deleted');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const getCampaignProgress = (campaign) => {
    return campaign.total_emails > 0 ? (campaign.sent_count / campaign.total_emails) * 100 : 0;
  };

  const totalStats = {
    campaigns: campaigns.length,
    totalSent: campaigns.reduce((acc, c) => acc + c.sent_count, 0),
    avgOpenRate: campaigns.length > 0
      ? campaigns.reduce((acc, c) => acc + (c.sent_count > 0 ? (c.opened_count / c.sent_count) * 100 : 0), 0) / campaigns.length
      : 0,
    avgReplyRate: campaigns.length > 0
      ? campaigns.reduce((acc, c) => acc + (c.sent_count > 0 ? (c.replied_count / c.sent_count) * 100 : 0), 0) / campaigns.length
      : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div data-testid="email-campaigns-page">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Email Campaigns</h1>
          <p className="text-gray-500">Create and manage automated email outreach</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => setShowEmailAccountDialog(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Email Accounts
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gradient-primary rounded-xl" data-testid="create-campaign-button">
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Advanced Email Campaign</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCampaign} className="space-y-6 mt-4">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule & Limits</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="campaign-name">Campaign Name</Label>
                      <Input
                        id="campaign-name"
                        placeholder="e.g., Q1 Dentist Outreach"
                        className="rounded-xl mt-1"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label>Email Account</Label>
                      <Select
                        value={formData.email_account_id.toString()}
                        onValueChange={(value) => setFormData({ ...formData, email_account_id: parseInt(value) })}
                      >
                        <SelectTrigger className="rounded-xl mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {emailAccounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id.toString()}>
                              {acc.name} ({acc.email}) - Limit: {acc.daily_limit}/day
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Select Leads ({selectedLeadIds.length} selected)</Label>
                      <div className="mt-2 max-h-64 overflow-y-auto border rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                          <input
                            type="checkbox"
                            checked={selectedLeadIds.length === leads.length && leads.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLeadIds(leads.map((l) => l.id));
                              } else {
                                setSelectedLeadIds([]);
                              }
                            }}
                          />
                          <span className="font-semibold text-sm">Select All ({leads.length})</span>
                        </div>
                        {leads.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">No leads available</p>
                        ) : (
                          leads.slice(0, 50).map((lead) => (
                            <label
                              key={lead.id}
                              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={selectedLeadIds.includes(lead.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedLeadIds([...selectedLeadIds, lead.id]);
                                  } else {
                                    setSelectedLeadIds(selectedLeadIds.filter((id) => id !== lead.id));
                                  }
                                }}
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium">{lead.business_name}</span>
                                <p className="text-xs text-gray-500">{lead.email}</p>
                              </div>
                              <span className="text-xs text-gray-400">{lead.status}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <Label>Email Content</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateWithAI}
                        className="rounded-xl"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate with AI
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor="subject">Email Subject</Label>
                      <Input
                        id="subject"
                        placeholder="e.g., Grow your practice with..."
                        className="rounded-xl mt-1"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="body">Email Body</Label>
                      <Textarea
                        id="body"
                        placeholder="Hi {'{'}{'{'}}business_name{'}'}{'}'}}...&#10;&#10;Your email content here..."
                        rows={8}
                        className="rounded-xl mt-1"
                        value={formData.body}
                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use {'{'}{'{'}}business_name{'}'}{'}'}} , {'{'}{'{'}}first_name{'}'}{'}'}} , {'{'}{'{'}}website{'}'}{'}'}} for personalization
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-semibold text-sm text-blue-900 mb-2">Follow-up Settings</h4>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={formData.follow_up_enabled}
                          onCheckedChange={(checked) => setFormData({ ...formData, follow_up_enabled: checked })}
                        />
                        <Label className="font-normal">Enable automatic follow-up after</Label>
                        <Input
                          type="number"
                          min="1"
                          className="w-20 rounded-xl"
                          value={formData.follow_up_delay_days}
                          onChange={(e) => setFormData({ ...formData, follow_up_delay_days: parseInt(e.target.value) })}
                        />
                        <span className="text-sm">days if no reply</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule" className="space-y-4 mt-4">
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <h4 className="font-semibold text-sm text-purple-900 mb-3">Sending Schedule</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Send Time Start</Label>
                          <Input
                            type="time"
                            className="rounded-xl mt-1"
                            value={formData.send_time_start}
                            onChange={(e) => setFormData({ ...formData, send_time_start: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Send Time End</Label>
                          <Input
                            type="time"
                            className="rounded-xl mt-1"
                            value={formData.send_time_end}
                            onChange={(e) => setFormData({ ...formData, send_time_end: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <h4 className="font-semibold text-sm text-green-900 mb-3">Rate Limiting</h4>
                      <div>
                        <Label>Maximum emails per day</Label>
                        <Input
                          type="number"
                          min="1"
                          max="500"
                          className="rounded-xl mt-1"
                          value={formData.max_per_day}
                          onChange={(e) => setFormData({ ...formData, max_per_day: parseInt(e.target.value) })}
                        />
                        <p className="text-xs text-green-700 mt-1">Recommended: 50-200 per day to avoid spam filters</p>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <h4 className="font-semibold text-sm text-orange-900 mb-2">Smart Features</h4>
                      <ul className="space-y-1 text-xs text-orange-800">
                        <li>✓ Auto-stop if recipient replies</li>
                        <li>✓ Time zone optimization</li>
                        <li>✓ A/B testing support</li>
                        <li>✓ Bounce detection & cleanup</li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-3 pt-4 border-t">
                  <Button type="submit" className="flex-1 gradient-primary rounded-xl">
                    <Send className="w-4 h-4 mr-2" />
                    Create & Launch Campaign
                  </Button>
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg card-hover">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Active Campaigns</h3>
            <p className="text-3xl font-bold text-gray-900">{totalStats.campaigns}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg card-hover">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Total Sent</h3>
            <p className="text-3xl font-bold text-gray-900">{totalStats.totalSent}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg card-hover">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Avg Open Rate</h3>
            <p className="text-3xl font-bold text-gray-900">{totalStats.avgOpenRate.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg card-hover">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                <Reply className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Avg Reply Rate</h3>
            <p className="text-3xl font-bold text-gray-900">{totalStats.avgReplyRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-6">Create your first email campaign to start reaching out to leads</p>
            <Button className="gradient-primary rounded-xl" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-2xl">{campaign.name}</CardTitle>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            campaign.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : campaign.status === 'running'
                              ? 'bg-blue-100 text-blue-700 animate-pulse'
                              : campaign.status === 'paused'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {campaign.status === 'running' && <Play className="w-3 h-3 inline mr-1" />}
                          {campaign.status === 'paused' && <Pause className="w-3 h-3 inline mr-1" />}
                          {campaign.status}
                        </span>
                      </div>
                      <CardDescription className="mt-2 text-base">{campaign.subject}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => deleteCampaign(campaign.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Campaign Progress
                      </span>
                      <span className="text-sm text-gray-600">
                        {campaign.sent_count} / {campaign.total_emails} sent
                      </span>
                    </div>
                    <Progress value={getCampaignProgress(campaign)} className="h-3" />
                  </div>

                  {/* Detailed Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 font-medium">Sent</p>
                        <p className="text-xl font-bold text-blue-900">{campaign.sent_count}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-medium">Opened</p>
                        <p className="text-xl font-bold text-green-900">{campaign.opened_count}</p>
                        <p className="text-xs text-green-600">
                          {campaign.sent_count > 0 ? ((campaign.opened_count / campaign.sent_count) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                        <MousePointer className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-purple-600 font-medium">Clicked</p>
                        <p className="text-xl font-bold text-purple-900">{campaign.clicked_count}</p>
                        <p className="text-xs text-purple-600">
                          {campaign.sent_count > 0 ? ((campaign.clicked_count / campaign.sent_count) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                        <Reply className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-orange-600 font-medium">Replied</p>
                        <p className="text-xl font-bold text-orange-900">{campaign.replied_count}</p>
                        <p className="text-xs text-orange-600">
                          {campaign.sent_count > 0 ? ((campaign.replied_count / campaign.sent_count) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Campaign Timeline */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Created: {new Date(campaign.created_at).toLocaleDateString()}</span>
                      {campaign.completed_at && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Completed: {new Date(campaign.completed_at).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Email Account Management Dialog */}
      <Dialog open={showEmailAccountDialog} onOpenChange={setShowEmailAccountDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Account Management</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {emailAccounts.map((account) => (
              <Card key={account.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{account.name}</h4>
                        <p className="text-sm text-gray-500">{account.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {account.type} • {account.daily_limit} emails/day
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        account.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {account.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button className="w-full gradient-primary rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Connect New Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailCampaigns;
