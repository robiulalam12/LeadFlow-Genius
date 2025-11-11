import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Plus, Play, Pause, Trash2, TrendingUp, Eye, MousePointer, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { API } from '@/App';

const EmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    follow_up_enabled: true,
    follow_up_delay_days: 3,
  });
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);

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
        subject: '',
        body: '',
        follow_up_enabled: true,
        follow_up_delay_days: 3,
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
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gradient-primary rounded-xl" data-testid="create-campaign-button">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Email Campaign</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCampaign} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g., Q1 Dentist Outreach"
                  className="rounded-xl mt-1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="campaign-name-input"
                />
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
                  data-testid="campaign-subject-input"
                />
              </div>

              <div>
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  placeholder="Hi {'{'}{'{'}}business_name{'}'}{'}'}}...&#10;&#10;Your email content here..."
                  rows={6}
                  className="rounded-xl mt-1"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  required
                  data-testid="campaign-body-input"
                />
                <p className="text-xs text-gray-500 mt-1">Use {'{'}{'{'}}business_name{'}'}{'}'}  for personalization</p>
              </div>

              <div>
                <Label>Select Leads ({selectedLeadIds.length} selected)</Label>
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-xl p-4 space-y-2">
                  {leads.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No leads available</p>
                  ) : (
                    leads.slice(0, 20).map((lead) => (
                      <label key={lead.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
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
                        <span className="text-sm">{lead.business_name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="follow-up"
                  checked={formData.follow_up_enabled}
                  onChange={(e) => setFormData({ ...formData, follow_up_enabled: e.target.checked })}
                  data-testid="follow-up-checkbox"
                />
                <Label htmlFor="follow-up" className="font-normal cursor-pointer">
                  Enable automatic follow-up after
                </Label>
                <Input
                  type="number"
                  min="1"
                  className="w-20 rounded-xl"
                  value={formData.follow_up_delay_days}
                  onChange={(e) => setFormData({ ...formData, follow_up_delay_days: parseInt(e.target.value) })}
                />
                <span className="text-sm">days</span>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 gradient-primary rounded-xl" data-testid="create-campaign-submit">
                  Create & Start Campaign
                </Button>
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No campaigns yet. Create your first campaign!</p>
            <Button className="gradient-primary rounded-xl" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
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
                      <CardTitle className="text-xl">{campaign.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{campaign.subject}</p>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          campaign.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : campaign.status === 'running'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {campaign.status}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteCampaign(campaign.id)}
                        data-testid={`delete-campaign-${campaign.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-500">
                        {campaign.sent_count} / {campaign.total_emails} sent
                      </span>
                    </div>
                    <Progress value={getCampaignProgress(campaign)} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Sent</p>
                        <p className="text-lg font-bold text-gray-900">{campaign.sent_count}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Opened</p>
                        <p className="text-lg font-bold text-gray-900">{campaign.opened_count}</p>
                        <p className="text-xs text-gray-500">
                          {campaign.sent_count > 0 ? ((campaign.opened_count / campaign.sent_count) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <MousePointer className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Clicked</p>
                        <p className="text-lg font-bold text-gray-900">{campaign.clicked_count}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                        <Reply className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Replied</p>
                        <p className="text-lg font-bold text-gray-900">{campaign.replied_count}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailCampaigns;
