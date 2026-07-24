'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { X, HardDrive, Plus, Trash2, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const deviceSchema = z.object({
  name: z.string().min(1, 'Device name is required'),
  category: z.enum(['PC_DESKTOP', 'LAPTOP', 'MONITOR', 'KEYBOARD', 'MOUSE', 'HEADSET']),
  workload_intensity: z.enum(['LIGHT', 'MEDIUM', 'HEAVY']),
  estimated_price: z.number().min(0, 'Estimated price must be a positive number'),
  purchase_date: z.string().optional(),
  parts: z.array(
    z.object({
      part_type: z.enum(['CPU', 'GPU', 'RAM', 'STORAGE', 'PSU', 'COOLER', 'MOTHERBOARD']),
      name: z.string().min(1, 'Part name is required'),
      purchase_date: z.string().optional(),
      warranty_expires_at: z.string().optional(),
    })
  ).optional(),
});

type DeviceFormValues = z.infer<typeof deviceSchema>;

export default function AddDeviceModal({ workspaceId, isOpen, onClose }: { workspaceId: string; isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      category: 'PC_DESKTOP',
      workload_intensity: 'MEDIUM',
      estimated_price: 0,
      parts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: 'parts',
    control,
  });

  const onSubmit = async (data: DeviceFormValues) => {
    setError(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = {
        ...data,
        purchase_date: data.purchase_date ? new Date(data.purchase_date).toISOString() : undefined,
        parts: data.parts?.map(p => ({
          ...p,
          purchase_date: p.purchase_date ? new Date(p.purchase_date).toISOString() : undefined,
          warranty_expires_at: p.warranty_expires_at ? new Date(p.warranty_expires_at).toISOString() : undefined,
        })),
        workspace_id: workspaceId,
      };

      const res = await fetch('http://localhost:8080/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create device');
      }

      reset();
      onClose();
      router.refresh();
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md pb-4 border-b border-slate-100 dark:border-neutral-800/50 z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-500" />
            Register New Device
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-slate-500 dark:text-neutral-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Device Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-neutral-200 uppercase tracking-wider">Device Info</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Device Name</label>
                <input
                  {...register('name')}
                  placeholder="e.g., Frontend Dev Laptop"
                  className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Category</label>
                <select
                  {...register('category')}
                  className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                >
                  <option value="PC_DESKTOP">PC Desktop</option>
                  <option value="LAPTOP">Laptop</option>
                  <option value="MONITOR">Monitor</option>
                  <option value="KEYBOARD">Keyboard</option>
                  <option value="MOUSE">Mouse</option>
                  <option value="HEADSET">Headset</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Workload Intensity</label>
                <select
                  {...register('workload_intensity')}
                  className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                >
                  <option value="LIGHT">Light (Office/Web)</option>
                  <option value="MEDIUM">Medium (Development/Design)</option>
                  <option value="HEAVY">Heavy (Gaming/Rendering)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Estimated Price (IDR)</label>
                <input
                  type="number"
                  {...register('estimated_price', { valueAsNumber: true })}
                  placeholder="25000000"
                  className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                {errors.estimated_price && <p className="mt-1 text-xs text-red-500">{errors.estimated_price.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Purchase Date (Optional)</label>
                <input
                  type="date"
                  {...register('purchase_date')}
                  className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Parts Array */}
          <div className="pt-4 border-t border-slate-200 dark:border-neutral-800/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-neutral-200 uppercase tracking-wider">Hardware Components (Parts)</h3>
              <button
                type="button"
                onClick={() => append({ part_type: 'CPU', name: '' })}
                className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-500 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Part
              </button>
            </div>

            <div className="space-y-4">
              {fields.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 dark:bg-neutral-900/30 rounded-xl border border-dashed border-slate-200 dark:border-neutral-800 text-sm text-slate-500 dark:text-neutral-500">
                  No parts added yet. Click &quot;+ Add Part&quot; to add CPU, RAM, etc.
                </div>
              ) : (
                fields.map((field, index) => (
                  <div key={field.id} className="relative p-4 bg-slate-50 dark:bg-neutral-800/30 border border-slate-200 dark:border-neutral-800/80 rounded-xl">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1">Part Type</label>
                        <select
                          {...register(`parts.${index}.part_type`)}
                          className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                          <option value="CPU">CPU / Processor</option>
                          <option value="GPU">GPU / Graphics Card</option>
                          <option value="RAM">RAM / Memory</option>
                          <option value="STORAGE">Storage (SSD/HDD)</option>
                          <option value="MOTHERBOARD">Motherboard</option>
                          <option value="PSU">Power Supply</option>
                          <option value="COOLER">Cooler</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1">Part Name</label>
                        <input
                          {...register(`parts.${index}.name`)}
                          placeholder="e.g., Intel Core i9-13900K"
                          className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        {errors.parts?.[index]?.name && <p className="mt-1 text-xs text-red-500">{errors.parts[index].name.message}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1">Purchase Date (Optional)</label>
                        <input
                          type="date"
                          {...register(`parts.${index}.purchase_date`)}
                          className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1">Warranty Expires At (Optional)</label>
                        <input
                          type="date"
                          {...register(`parts.${index}.warranty_expires_at`)}
                          className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-neutral-800/50">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Registering Device...</>
              ) : (
                'Save Device & Parts'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
