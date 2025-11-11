import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SequenceBuilder = ({ steps, onChange, onGenerateWithAI }) => {
  const addStep = () => {
    onChange([
      ...steps,
      {
        id: Date.now(),
        type: 'follow-up',
        delay_days: 3,
        subject: '',
        body: '',
      },
    ]);
  };

  const removeStep = (id) => {
    onChange(steps.filter((s) => s.id !== id));
  };

  const updateStep = (id, updates) => {
    onChange(steps.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Email Sequence</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addStep}
          className="rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Step
        </Button>
      </div>

      {steps.map((step, index) => (
        <Card key={step.id} className="border-2 border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Step {index + 1}
                {index > 0 && (
                  <span className="text-gray-500 font-normal">
                    (Send after {step.delay_days} days if no reply)
                  </span>
                )}
              </CardTitle>
              {index > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeStep(step.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {index > 0 && (
              <div>
                <Label>Delay (days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={step.delay_days}
                  onChange={(e) => updateStep(step.id, { delay_days: parseInt(e.target.value) })}
                  className="rounded-xl mt-1 w-24"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Subject</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onGenerateWithAI(step.id)}
                  className="h-7 text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Generate
                </Button>
              </div>
              <Input
                value={step.subject}
                onChange={(e) => updateStep(step.id, { subject: e.target.value })}
                placeholder={index === 0 ? 'Initial email subject' : 'Follow-up subject'}
                className="rounded-xl"
              />
            </div>

            <div>
              <Label>Body</Label>
              <Textarea
                value={step.body}
                onChange={(e) => updateStep(step.id, { body: e.target.value })}
                placeholder="Email content...\n\nUse {'{'}{'{'}}business_name{'}'}{'}'}  for personalization"
                rows={4}
                className="rounded-xl mt-1"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SequenceBuilder;
