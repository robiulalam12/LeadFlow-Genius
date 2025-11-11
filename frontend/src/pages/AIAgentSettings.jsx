import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Zap, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { API } from '@/App';

const AIAgentSettings = () => {
  const [tone, setTone] = useState('Friendly');
  const [testData, setTestData] = useState({
    lead_name: 'John Smith',
    business_name: 'Elite Dental Clinic',
    previous_email: '',
  });
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTestAgent = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${API}/ai/generate-follow-up`, {
        lead_name: testData.lead_name,
        business_name: testData.business_name,
        previous_email: testData.previous_email,
        tone: tone,
      });

      setGeneratedEmail(response.data);
      toast.success('Email generated successfully!');
    } catch (error) {
      toast.error('Failed to generate email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="ai-agent-settings-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Agent Settings</h1>
        <p className="text-gray-500">Configure AI-powered email generation and automation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              AI Configuration
            </CardTitle>
            <CardDescription>Set up your AI assistant preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="email-tone">Email Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="rounded-xl mt-1" id="email-tone" data-testid="tone-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Friendly">Friendly</SelectItem>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Direct">Direct</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Choose how the AI should write emails</p>
            </div>

            <div>
              <Label htmlFor="follow-up-delay">Auto Follow-up Delay</Label>
              <Input
                id="follow-up-delay"
                type="number"
                placeholder="3"
                className="rounded-xl mt-1"
                defaultValue="3"
                data-testid="follow-up-delay-input"
              />
              <p className="text-xs text-gray-500 mt-1">Days before sending automatic follow-up</p>
            </div>

            <div>
              <Label>AI Model</Label>
              <div className="mt-2 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-gray-900">GPT-4o (OpenAI)</span>
                </div>
                <p className="text-sm text-gray-600">Using Emergent LLM Key for AI generation</p>
              </div>
            </div>

            <div className="pt-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Smart Features</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Auto-personalization with business details
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Context-aware follow-up suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Adaptive tone matching
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Agent */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Test AI Agent
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
                data-testid="test-lead-name-input"
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
                data-testid="test-business-name-input"
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
                data-testid="previous-email-input"
              />
            </div>

            <Button
              onClick={handleTestAgent}
              className="w-full gradient-primary rounded-xl"
              disabled={loading}
              data-testid="test-agent-button"
            >
              {loading ? 'Generating...' : 'Generate Test Email'}
            </Button>

            {/* Generated Email */}
            {generatedEmail && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200"
                data-testid="generated-email-result"
              >
                <h4 className="font-semibold text-gray-900 mb-3">Generated Email</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500">Subject:</Label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{generatedEmail.subject}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Body:</Label>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{generatedEmail.body}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="border-0 shadow-lg card-hover">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Smart Personalization</h3>
            <p className="text-sm text-gray-600">AI automatically personalizes emails with lead-specific details and context</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg card-hover">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Auto Follow-ups</h3>
            <p className="text-sm text-gray-600">Intelligent follow-up timing based on recipient behavior and engagement</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg card-hover">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Tone Adaptation</h3>
            <p className="text-sm text-gray-600">AI adjusts writing style to match your preferred tone and brand voice</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAgentSettings;
