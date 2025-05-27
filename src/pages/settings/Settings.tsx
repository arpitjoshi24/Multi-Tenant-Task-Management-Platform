import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle, Save, Copy, Check } from 'lucide-react';
import { getOrganization, updateOrganization } from '../../services/organizationService';
import { Organization } from '../../types';

const settingsSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  description: z.string().optional(),
  settings: z.object({
    theme: z.enum(['light', 'dark']),
  }),
});

type SettingsFormInputs = z.infer<typeof settingsSchema>;

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormInputs>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    fetchOrganizationSettings();
  }, []);

  const fetchOrganizationSettings = async () => {
    try {
      setLoading(true);
      const org = await getOrganization();
      setOrganization(org);
      reset({
        name: org.name,
        description: org.description,
        settings: {
          theme: org.settings?.theme || 'light',
        },
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching organization settings:', err);
      setError('Failed to load organization settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SettingsFormInputs) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      await updateOrganization(data);
      setSuccess('Settings updated successfully');
    } catch (err) {
      console.error('Error updating organization settings:', err);
      setError('Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const copyCode = async () => {
    if (organization?.code) {
      await navigator.clipboard.writeText(organization.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
        <span className="ml-2 text-lg">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organization Settings</h1>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Save className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Organization Code</h2>
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 px-4 py-2 rounded-md font-mono text-lg">
              {organization?.code}
            </div>
            <button
              onClick={copyCode}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5 text-gray-500" />
              )}
              <span className="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Share this code with team members to let them join your organization
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              className={`mt-1 input ${errors.name ? 'border-red-300' : ''}`}
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="mt-1 input"
              placeholder="Brief description of your organization"
              {...register('description')}
            ></textarea>
          </div>

          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
              Theme
            </label>
            <select
              id="theme"
              className="mt-1 input"
              {...register('settings.theme')}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;