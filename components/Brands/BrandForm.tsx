"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';

interface Brand {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface BrandFormProps {
  brand?: Brand | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function BrandForm({ brand, onSave, onCancel }: BrandFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name,
        description: brand.description || '',
      });
    }
  }, [brand]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = brand ? `/api/brands/${brand._id}` : '/api/brands';
      const method = brand ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(`Brand ${brand ? 'updated' : 'created'} successfully`);
        onSave();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save brand');
      }
    } catch (error) {
      toast.error('Error saving brand');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Brand Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
          placeholder="e.g., Nike, Adidas, Zara"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          placeholder="Brief description of this brand"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : brand ? 'Update Brand' : 'Create Brand'}
        </Button>
      </div>
    </form>
  );
}