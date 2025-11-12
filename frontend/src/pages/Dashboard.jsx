import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, Mail, TrendingUp, Activity, Search, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { API } from '@/App';
import { toast } from 'sonner';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState({
    total_leads: 0,
    active_campaigns: 0,
    emails_sent: 0,
    open_rate: 0,
    reply_rate: 0,
    leads_by_date: [],
    leads_by_source: [],
    recent_campaigns: [],
  });

  const COLORS = ['#FF4500', '#FFC300', '#8B5CF6', '#3B82F6', '#10B981'];
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
  //     const [summaryRes, sourcesRes, engagementRes, dashRes] = await Promise.all([
        axios.get(`${API}/analytics/summary`),
        axios.get(`${API}/analytics/sources`),
   
              const [summaryRes, sourcesRes, engagementRes, dashRes] = await Promise.all([
      axios.get(`${API}/analytics/summary`),
      axios.get(`${API}/analytics/sources`),
      axios.get(`${API}/analytics/engagement`),
      axios.get(`${API}/analytics/dashboard`),
    ]);
    setAnalytics({
      total_leads: summaryRes.data.total_leads,
      total_campaigns: summaryRes.data.total_campaigns,
      emails_sent: engagementRes.data.emails_sent,
      open_rate: engagementRes.data.open_rate,
      reply_rate: engagementRes.data.reply_rate,
      leads_by_date: dashRes.data.leads_by_date,
      leads_by_source: sourcesRes.data.leads_by_source,
      recent_campaigns: dashRes.data.recent_campaigns || [],
    });
    return;
const fetchAnalytics = async () => {
  try {
    const [summaryRes, sourcesRes, engagementRes, dashRes] = await Promise.all([
      axios.get(`${API}/analytics/summary`),
      axios.get(`${API}/analytics/sources`),
      axios.get(`${API}/analytics/engagement`),
      axios.get(`${API}/analytics/dashboard`),
    ]);
    setAnalytics({
      total_leads: summaryRes.data.total_leads,
      total_campaigns: summaryRes.data.total_campaigns,
      emails_sent: engagementRes.data.emails_sent,
      open_rate: engagementRes.data.open_rate,
      reply_rate: engagementRes.data.reply_rate,
      leads_by_date: dashRes.data.leads_by_date,
      leads_by_source: sourcesRes.data.leads_by_source,
      recent_campaigns: dashRes.data.recent_campaigns || [],
    });
  } catch (error) {
    // Uncomment this if you want to show an error toast
    // toast.error('Failed to load analytics');
  } finally {
    setLoading(false);
  }
};


  const stats = [
  {
    title: 'Total Leads',
    value: analytics.total_leads.toLocaleString(),
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    change: '',
  },
  {
    title: 'Open Rate',
    value: `${analytics.open_rate}%`,
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
    change: '',
  },
  {
    title: 'Reply Rate',
    value: `${analytics.reply_rate}%`,
    icon: Activity,
    color: 'from-purple-500 to-pink-500',
    change: '',
  },
];
 

  const emailEngagementData = [
    { name: 'Sent', value: analytics.emails_sent },
    { name: 'Opened', value: Math.round((analytics.emails_sent * analytics.open_rate) / 100) },
    { name: 'Clicked', value: Math.round((analytics.emails_sent * analytics.open_rate * 0.4) / 100) },
    { name: 'Replied', value: Math.round((analytics.emails_sent * analytics.reply_rate) / 100) },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's your lead generation overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="card-hover border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                      {stat.change}
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Leads Over Time */}
        <Card className="border-0 shadow-lg" data-testid="leads-chart-card">
          <CardHeader>
            <CardTitle>Leads Scraped (Last 7 Days)</CardTitle>
            <CardDescription>Daily lead generation trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.leads_by_date}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="url(#colorGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#FF4500', r: 4 }}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FF4500" />
                    <stop offset="100%" stopColor="#FFC300" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Email Engagement */}
        <Card className="border-0 shadow-lg" data-testid="email-engagement-chart-card">
          <CardHeader>
            <CardTitle>Email Engagement</CardTitle>
            <CardDescription>Campaign performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={emailEngagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF4500" />
                    <stop offset="100%" stopColor="#FFC300" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leads by Source - Pie Chart */}
        <Card className="border-0 shadow-lg" data-testid="leads-source-chart-card">
          <CardHeader>
            <CardTitle>Leads by Source</CardTitle>
            <CardDescription>Distribution across data sources</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.leads_by_source}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.leads_by_source.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card className="border-0 shadow-lg" data-testid="recent-campaigns-card">
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>Latest email outreach activities</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recent_campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No campaigns yet. Start your first campaign!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.recent_campaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                    <p className="text-sm text-gray-500">{campaign.total_emails} emails • {campaign.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {campaign.sent_count}/{campaign.total_emails} sent
                    </p>
                    <p className="text-xs text-gray-500">
                      {((campaign.opened_count / campaign.sent_count) * 100 || 0).toFixed(1)}% opened
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
