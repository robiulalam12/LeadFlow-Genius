import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, MapPin, Download, Save, Trash2, Filter, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { API } from '@/App';

const LeadScraper = () => {
  const [formData, setFormData] = useState({
    keyword: '',
    location: '',
    has_website: false,
    has_email: false,
    min_reviews: '',
    data_sources: ['Google Maps'],
  });

  const availableSources = ['Google Maps', 'Yelp', 'Facebook Pages', 'Trustpilot'];
  const [currentJob, setCurrentJob] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentJob?.id) {
      const interval = setInterval(() => fetchJobStatus(), 1000);
      return () => clearInterval(interval);
    }
  }, [currentJob]);

  const fetchJobStatus = async () => {
    try {
      const response = await axios.get(`${API}/scraper/status/${currentJob.id}`);
      setCurrentJob(response.data);

      if (response.data.status === 'completed') {
        fetchLeads(response.data.results);
      }
    } catch (error) {
      console.error('Error fetching job status:', error);
    }
  };

  const fetchLeads = async (leadIds) => {
    try {
      const promises = leadIds.slice(0, 20).map((id) => axios.get(`${API}/leads/${id}`));
      const responses = await Promise.all(promises);
      setLeads(responses.map((r) => r.data));
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const handleStartScraping = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/scraper/start`, {
        keyword: formData.keyword,
        location: formData.location,
        has_website: formData.has_website || null,
        has_email: formData.has_email || null,
        min_reviews: formData.min_reviews ? parseInt(formData.min_reviews) : null,
        data_sources: formData.data_sources,
      });

      setCurrentJob({ id: response.data.job_id, status: 'running', progress: 0 });
      setLeads([]);
      toast.success('Scraping started!');
    } catch (error) {
      toast.error('Failed to start scraping');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const csv = [
      ['Business Name', 'Email', 'Phone', 'Website', 'Rating', 'Reviews', 'Address'].join(','),
      ...leads.map((lead) =>
        [
          lead.business_name,
          lead.email || '',
          lead.phone || '',
          lead.website || '',
          lead.rating || '',
          lead.review_count || '',
          lead.address || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${Date.now()}.csv`;
    a.click();
    toast.success('Leads exported!');
  };

  const clearResults = () => {
    setCurrentJob(null);
    setLeads([]);
    toast.success('Results cleared');
  };

  return (
    <div data-testid="lead-scraper-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Lead Scraper</h1>
        <p className="text-gray-500">Scrape business leads from multiple sources</p>
      </div>

      {/* Scraper Form */}
      <Card className="border-0 shadow-lg mb-8">
        <CardHeader>
          <CardTitle>Scrape Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStartScraping} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="keyword">Keyword</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="keyword"
                    placeholder="e.g., dentist, plumber, lawyer"
                    className="pl-10 rounded-xl"
                    value={formData.keyword}
                    onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                    required
                    data-testid="scraper-keyword-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="location"
                    placeholder="e.g., New York, NY"
                    className="pl-10 rounded-xl"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    data-testid="scraper-location-input"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Data Sources</Label>
              <div className="flex flex-wrap gap-4">
                {availableSources.map((source) => (
                  <div key={source} className="flex items-center gap-2">
                    <Checkbox
                      id={source}
                      checked={formData.data_sources.includes(source)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ ...formData, data_sources: [...formData.data_sources, source] });
                        } else {
                          setFormData({ ...formData, data_sources: formData.data_sources.filter((s) => s !== source) });
                        }
                      }}
                    />
                    <Label htmlFor={source} className="font-normal cursor-pointer">
                      {source}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="has_website"
                  checked={formData.has_website}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_website: checked })}
                  data-testid="has-website-filter"
                />
                <Label htmlFor="has_website" className="font-normal cursor-pointer">
                  Has Website
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="has_email"
                  checked={formData.has_email}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_email: checked })}
                  data-testid="has-email-filter"
                />
                <Label htmlFor="has_email" className="font-normal cursor-pointer">
                  Has Email
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="min_reviews" className="text-sm">
                  Min Reviews:
                </Label>
                <Input
                  id="min_reviews"
                  type="number"
                  placeholder="0"
                  className="w-20 rounded-xl"
                  value={formData.min_reviews}
                  onChange={(e) => setFormData({ ...formData, min_reviews: e.target.value })}
                  data-testid="min-reviews-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full md:w-auto gradient-primary rounded-xl"
              disabled={loading || currentJob?.status === 'running'}
              data-testid="start-scraping-button"
            >
              <Play className="w-4 h-4 mr-2" />
              {loading || currentJob?.status === 'running' ? 'Scraping...' : 'Start Scraping'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      {currentJob && (
        <Card className="border-0 shadow-lg mb-8" data-testid="scraping-progress-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">Scraping Progress</span>
              <span className="text-sm text-gray-500">
                {currentJob.scraped_leads || 0} / {currentJob.total_leads || 0} leads
              </span>
            </div>
            <Progress value={currentJob.progress || 0} className="h-3" />
            <p className="text-sm text-gray-500 mt-2">
              Status: <span className="font-semibold">{currentJob.status}</span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      {leads.length > 0 && (
        <Card className="border-0 shadow-lg" data-testid="leads-results-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Scraped Leads ({leads.length})</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl" onClick={exportCSV} data-testid="export-csv-button">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={clearResults} data-testid="clear-results-button">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Business</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Website</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{lead.business_name}</p>
                          <p className="text-xs text-gray-500">{lead.address}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{lead.email || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{lead.phone || '-'}</td>
                      <td className="py-3 px-4">
                        {lead.website ? (
                          <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            Visit
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {lead.rating ? `⭐ ${lead.rating}` : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeadScraper;
