import React, { useState } from 'react';
import axios from 'axios';
import { X, Save, Tag as TagIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { API } from '@/App';

const EditLeadModal = ({ lead, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    business_name: lead?.business_name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    website: lead?.website || '',
    address: lead?.address || '',
    notes: lead?.notes || '',
    tags: lead?.tags?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update basic info
      await axios.put(`${API}/leads/${lead.id}`, {
        business_name: formData.business_name,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        address: formData.address,
      });

      // Update notes
      if (formData.notes !== lead.notes) {
        await axios.post(`${API}/leads/${lead.id}/notes`, {
          text: formData.notes,
        });
      }

      // Update tags
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);
      if (tagsArray.join(',') !== lead.tags?.join(',')) {
        await axios.post(`${API}/leads/${lead.id}/tags`, {
          tags: tagsArray,
        });
      }

      toast.success('Lead updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to update lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4 max-h-96 overflow-y-auto">
          <div>
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className="rounded-xl mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="rounded-xl mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="rounded-xl mt-1"
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="rounded-xl mt-1"
            />
          </div>

          <div>
            <Label htmlFor="tags" className="flex items-center gap-2">
              <TagIcon className="w-4 h-4" />
              Tags (comma separated)
            </Label>
            <Input
              id="tags"
              placeholder="e.g., hot-lead, follow-up-needed"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="rounded-xl mt-1"
            />
          </div>

          <div>
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this lead..."
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="rounded-xl mt-1"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 gradient-primary rounded-xl"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="rounded-xl"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditLeadModal;
