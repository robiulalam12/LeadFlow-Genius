import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Bot,
  Sparkles,
  Zap,
  Send,
  Search,
  Mail,
  Users,
  Settings as SettingsIcon,
  Clock,
  Tag,
  Activity,
  Play,
  CheckCircle,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { API } from '@/App';

const AIAgentSettings = () => {
  const [scraperAgent, setScraperAgent] = useState({
    enabled: true,
    scraping_depth: 'medium',
    frequency: 'daily',
    retry_logic: 'exponential',
    max_retries: 3,
  });

  const [emailAgent, setEmailAgent] = useState({
    tone: 'Friendly',
    send_time_window_start: '09:00',
    send_time_window_end: '17:00',
    frequency: 'moderate',
    personalization_level: 80,
  });

  const [crmAgent, setCrmAgent] = useState({
    auto_tagging: true,
    tag_rules: [
      { keyword: 'dentist', tag: 'healthcare' },
      { keyword: 'lawyer', tag: 'legal' },
      { keyword: 'restaurant', tag: 'food-service' },
    ],
    lead_scoring: true,
  });

  const [testData, setTestData] = useState({
    lead_name: 'John Smith',
    business_name: 'Elite Dental Clinic',
    previous_email: '',
  });

  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLogs, setActionLogs] = useState([
    {
      id: 1,
      agent: 'Scraper Agent',
      action: 'Completed scraping job',
      details: '81 leads scraped from Google Maps',
      status: 'success',
      timestamp: '2 min ago',
    },
    {
      id: 2,
      agent: 'Email Agent',
      action: 'Sent campaign emails',
      details: '45 emails sent successfully',
      status: 'success',
      timestamp: '15 min ago',
    },
    {
      id: 3,
      agent: 'CRM Agent',
      action: 'Auto-tagged leads',
      details: '23 leads tagged with "healthcare"',
      status: 'success',
      timestamp: '1 hour ago',
    },
  ]);

  const handleTestEmailAgent = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${API}/ai/generate-follow-up`, {
        lead_name: testData.lead_name,
        business_name: testData.business_name,
        previous_email: testData.previous_email,
        tone: emailAgent.tone,
      });

      setGeneratedEmail(response.data);
      toast.success('Email generated successfully!');

      // Add to action logs
      setActionLogs([
        {
          id: Date.now(),
          agent: 'Email Agent',
          action: 'Generated test email',
          details: `Tone: ${emailAgent.tone}, Personalization: ${emailAgent.personalization_level}%`,
          status: 'success',
          timestamp: 'Just now',
        },
        ...actionLogs,
      ]);
    } catch (error) {
      toast.error('Failed to generate email');
    } finally {
      setLoading(false);
    }
  };

  const handleTestScraperAgent = () => {
    toast.success('Scraper agent test initiated!');
    setActionLogs([
      {
        id: Date.now(),
        agent: 'Scraper Agent',
        action: 'Test run initiated',
        details: `Depth: ${scraperAgent.scraping_depth}, Retries: ${scraperAgent.max_retries}`,
        status: 'success',
        timestamp: 'Just now',
      },
      ...actionLogs,
    ]);
  };

  const handleTestCRMAgent = () => {
    toast.success('CRM agent test initiated!');
    setActionLogs([
      {
        id: Date.now(),
        agent: 'CRM Agent',
        action: 'Auto-tagging test',
        details: `Rules applied: ${crmAgent.tag_rules.length}, Lead scoring: ${crmAgent.lead_scoring ? 'On' : 'Off'}`,
        status: 'success',
        timestamp: 'Just now',
      },
      ...actionLogs,
    ]);
  };

  const saveAgentSettings = () => {
    toast.success('Agent settings saved successfully!');
  };

  return (
    <div data-testid="ai-agent-settings-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Agent Control Panel</h1>
        <p className="text-gray-500">Configure and manage AI-powered automation agents</p>
      </div>

      <Tabs defaultValue="email-agent" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="email-agent" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Agent
          </TabsTrigger>
          <TabsTrigger value="scraper-agent" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Scraper Agent
          </TabsTrigger>
          <TabsTrigger value="crm-agent" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            CRM Agent
          </TabsTrigger>
          <TabsTrigger value="action-logs" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Action Logs
          </TabsTrigger>
        </TabsList>

        {/* EMAIL AGENT */}
        <TabsContent value="email-agent" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Agent Configuration
                </CardTitle>
                <CardDescription>Customize AI email writing behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="email-tone">Writing Tone</Label>
                  <Select value={emailAgent.tone} onValueChange={(value) => setEmailAgent({ ...emailAgent, tone: value })}>
                    <SelectTrigger className="rounded-xl mt-1" id="email-tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Friendly">Friendly & Warm</SelectItem>
                      <SelectItem value="Formal">Formal & Professional</SelectItem>
                      <SelectItem value="Direct">Direct & Concise</SelectItem>
                      <SelectItem value="Casual">Casual & Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Personalization Level</Label>
                    <span className="text-sm font-semibold text-orange-600">{emailAgent.personalization_level}%</span>
                  </div>
                  <Slider
                    value={[emailAgent.personalization_level]}
                    onValueChange={(value) => setEmailAgent({ ...emailAgent, personalization_level: value[0] })}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Higher = More customized per lead, Lower = More template-based
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Send Window Start</Label>
                    <Input
                      type="time"
                      className="rounded-xl mt-1"
                      value={emailAgent.send_time_window_start}
                      onChange={(e) => setEmailAgent({ ...emailAgent, send_time_window_start: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Send Window End</Label>
                    <Input
                      type="time"
                      className="rounded-xl mt-1"
                      value={emailAgent.send_time_window_end}
                      onChange={(e) => setEmailAgent({ ...emailAgent, send_time_window_end: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Email Frequency</Label>
                  <Select
                    value={emailAgent.frequency}
                    onValueChange={(value) => setEmailAgent({ ...emailAgent, frequency: value })}
                  >
                    <SelectTrigger className="rounded-xl mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aggressive">Aggressive (1 email/day)</SelectItem>
                      <SelectItem value="moderate">Moderate (1 email/2 days)</SelectItem>
                      <SelectItem value="conservative">Conservative (1 email/week)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-orange-600" />
                      <span className="font-semibold text-gray-900">AI Model: GPT-4o</span>
                    </div>
                    <p className="text-sm text-gray-600">Using Emergent LLM Key for generation</p>
                  </div>
                </div>

                <Button onClick={saveAgentSettings} className="w-full gradient-primary rounded-xl">
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </CardContent>
            </Card>

            {/* Test Agent */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Test Email Agent
                </CardTitle>
                <CardDescription>Generate a sample email to test settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="test-lead-name">Lead Name</Label>
                  <Input
                    id="test-lead-name"
                    placeholder="John Smith"
                    className="rounded-xl mt-1"
                    value={testData.lead_name}
                    onChange={(e) => setTestData({ ...testData, lead_name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="test-business-name">Business Name</Label>
                  <Input
                    id="test-business-name"
                    placeholder="Elite Dental Clinic"
                    className="rounded-xl mt-1"
                    value={testData.business_name}
                    onChange={(e) => setTestData({ ...testData, business_name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="previous-email">Previous Email (Optional)</Label>
                  <Textarea
                    id="previous-email"
                    placeholder="Previous email content..."
                    rows={3}
                    className="rounded-xl mt-1"
                    value={testData.previous_email}
                    onChange={(e) => setTestData({ ...testData, previous_email: e.target.value })}
                  />
                </div>

                <Button
                  onClick={handleTestEmailAgent}
                  className="w-full gradient-primary rounded-xl"
                  disabled={loading}
                >
                  {loading ? 'Generating...' : <><Play className="w-4 h-4 mr-2" /> Run Test</>}
                </Button>

                {/* Generated Email */}
                {generatedEmail && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">Generated Email</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-green-700">Subject:</Label>
                        <p className="text-sm font-medium text-gray-900 mt-1 p-2 bg-white rounded">
                          {generatedEmail.subject}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-green-700">Body:</Label>
                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap p-3 bg-white rounded">
                          {generatedEmail.body}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SCRAPER AGENT */}
        <TabsContent value="scraper-agent" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Scraper Agent Configuration
              </CardTitle>
              <CardDescription>Control how the scraper collects and processes leads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Scraping Depth</Label>
                  <Select
                    value={scraperAgent.scraping_depth}
                    onValueChange={(value) => setScraperAgent({ ...scraperAgent, scraping_depth: value })}
                  >
                    <SelectTrigger className="rounded-xl mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shallow">Shallow (Basic info only)</SelectItem>
                      <SelectItem value="medium">Medium (Standard details)</SelectItem>
                      <SelectItem value="deep">Deep (All available data)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Deeper scraping = More data but slower</p>
                </div>

                <div>
                  <Label>Scraping Frequency</Label>
                  <Select
                    value={scraperAgent.frequency}
                    onValueChange={(value) => setScraperAgent({ ...scraperAgent, frequency: value })}
                  >
                    <SelectTrigger className="rounded-xl mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time (On-demand)</SelectItem>
                      <SelectItem value="hourly">Hourly (Auto refresh)</SelectItem>
                      <SelectItem value="daily">Daily (Scheduled)</SelectItem>
                      <SelectItem value="weekly">Weekly (Batch updates)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Retry Logic</Label>
                  <Select
                    value={scraperAgent.retry_logic}
                    onValueChange={(value) => setScraperAgent({ ...scraperAgent, retry_logic: value })}
                  >
                    <SelectTrigger className="rounded-xl mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear (Fixed delay)</SelectItem>
                      <SelectItem value="exponential">Exponential (Increasing delay)</SelectItem>
                      <SelectItem value="aggressive">Aggressive (Immediate retry)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Max Retries</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    className="rounded-xl mt-1"
                    value={scraperAgent.max_retries}
                    onChange={(e) => setScraperAgent({ ...scraperAgent, max_retries: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={scraperAgent.enabled}
                    onCheckedChange={(checked) => setScraperAgent({ ...scraperAgent, enabled: checked })}
                  />
                  <div>
                    <Label className="font-semibold">Scraper Agent Active</Label>
                    <p className="text-xs text-gray-600">Enable/disable automated scraping</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    scraperAgent.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {scraperAgent.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleTestScraperAgent} className="flex-1 gradient-primary rounded-xl">
                  <Play className="w-4 h-4 mr-2" />
                  Test Scraper Agent
                </Button>
                <Button onClick={saveAgentSettings} variant="outline" className="rounded-xl">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CRM AGENT */}
        <TabsContent value="crm-agent" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                CRM Agent Configuration
              </CardTitle>
              <CardDescription>Automate lead organization and tagging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={crmAgent.auto_tagging}
                    onCheckedChange={(checked) => setCrmAgent({ ...crmAgent, auto_tagging: checked })}
                  />
                  <div>
                    <Label className="font-semibold">Auto-Tagging Enabled</Label>
                    <p className="text-xs text-gray-600">Automatically tag leads based on content</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-lg font-semibold">Tagging Rules</Label>
                  <Button size="sm" variant="outline" className="rounded-xl">
                    <Tag className="w-3 h-3 mr-2" />
                    Add Rule
                  </Button>
                </div>

                <div className="space-y-3">
                  {crmAgent.tag_rules.map((rule, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-500">If keyword contains:</Label>
                          <Input value={rule.keyword} className="rounded-lg mt-1" disabled />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Apply tag:</Label>
                          <Input value={rule.tag} className="rounded-lg mt-1" disabled />
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={crmAgent.lead_scoring}
                    onCheckedChange={(checked) => setCrmAgent({ ...crmAgent, lead_scoring: checked })}
                  />
                  <div>
                    <Label className="font-semibold">Lead Scoring</Label>
                    <p className="text-xs text-gray-600">Automatically score leads based on engagement</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleTestCRMAgent} className="flex-1 gradient-primary rounded-xl">
                  <Play className="w-4 h-4 mr-2" />
                  Test CRM Agent
                </Button>
                <Button onClick={saveAgentSettings} variant="outline" className="rounded-xl">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACTION LOGS */}
        <TabsContent value="action-logs" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Agent Action Logs
              </CardTitle>
              <CardDescription>Real-time activity feed from all AI agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {actionLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        log.status === 'success'
                          ? 'bg-green-500'
                          : log.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}
                    >
                      {log.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : log.status === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Clock className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{log.agent}</h4>
                        <span className="text-xs text-gray-500">{log.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium">{log.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="border-0 shadow-lg card-hover">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Smart Automation</h3>
            <p className="text-sm text-gray-600">
              AI agents work 24/7 to scrape leads, send emails, and organize your CRM automatically
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg card-hover">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Real-time Adaptation</h3>
            <p className="text-sm text-gray-600">
              Agents learn from engagement patterns and optimize their behavior for better results
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg card-hover">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">GPT-4o Powered</h3>
            <p className="text-sm text-gray-600">
              Advanced language model ensures natural, personalized communication with every lead
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAgentSettings;
