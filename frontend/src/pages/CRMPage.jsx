import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Trash2, Mail, Edit, Tag, Plus } from 'lucide-react';
import EditLeadModal from '@/components/EditLeadModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { API } from '@/App';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CRMPage = () => {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    source: '',
  });
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchLeads();
  }, [filters, page]);

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams({
        skip: page * limit,
        limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.source && { source: filters.source }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await axios.get(`${API}/leads?${params}`);
      setLeads(response.data.leads);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedLeads(leads.map((l) => l.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId, checked) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter((id) => id !== leadId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;

    try {
      await axios.post(`${API}/leads/bulk-delete`, selectedLeads);
      toast.success(`Deleted ${selectedLeads.length} leads`);
      setSelectedLeads([]);
      fetchLeads();
    } catch (error) {
      toast.error('Failed to delete leads');
    }
  };

  const updateLeadStatus = async (leadId, status) => {
    try {
      await axios.put(`${API}/leads/${leadId}`, { status });
      toast.success('Status updated');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      New: 'status-badge status-new',
      Emailed: 'status-badge status-emailed',
      'Follow-up': 'status-badge status-follow-up',
      Replied: 'status-badge status-replied',
    };
    return <span className={classes[status] || 'status-badge'}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div data-testid="crm-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">CRM / Leads</h1>
        <p className="text-gray-500">Manage and organize your business leads</p>
      </div>

      {/* Filters & Actions */}
      <Card className="border-0 shadow-lg mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by business name or email..."
                  className="pl-10 rounded-xl"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  data-testid="crm-search-input"
                />
              </div>
            </div>

            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger className="w-full md:w-48 rounded-xl" data-testid="status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Emailed">Emailed</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Replied">Replied</SelectItem>
              </SelectContent>
            </Select>

            {selectedLeads.length > 0 && (
              <Button variant="destructive" className="rounded-xl" onClick={handleBulkDelete} data-testid="bulk-delete-button">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedLeads.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leads ({total})</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedLeads.length === leads.length && leads.length > 0}
                onCheckedChange={handleSelectAll}
                data-testid="select-all-checkbox"
              />
              <span className="text-sm text-gray-500">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No leads found. Start scraping to get leads!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 w-12"></th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Business</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rating</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Source</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={(checked) => handleSelectLead(lead.id, checked)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{lead.business_name}</p>
                          <p className="text-xs text-gray-500">{lead.address}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{lead.email || '-'}</p>
                          <p className="text-gray-500">{lead.phone || '-'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Select value={lead.status} onValueChange={(value) => updateLeadStatus(lead.id, value)}>
                          <SelectTrigger className="w-32 h-8 text-xs rounded-lg">
                            <SelectValue>{getStatusBadge(lead.status)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Emailed">Emailed</SelectItem>
                            <SelectItem value="Follow-up">Follow-up</SelectItem>
                            <SelectItem value="Replied">Replied</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {lead.rating ? `⭐ ${lead.rating}` : '-'}
                        </span>
                        <p className="text-xs text-gray-500">{lead.review_count || 0} reviews</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{lead.source}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateLeadStatus(lead.id, 'Emailed')}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Showing {page * limit + 1} - {Math.min((page + 1) * limit, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  data-testid="prev-page-button"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={(page + 1) * limit >= total}
                  onClick={() => setPage(page + 1)}
                  data-testid="next-page-button"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMPage;
