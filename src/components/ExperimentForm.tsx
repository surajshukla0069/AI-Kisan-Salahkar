import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { experimentsAPI } from '@/lib/api.js';
import { t } from '@/lib/translations.js';
import type { Language } from '@/hooks/use-user-preferences.js';

interface ExperimentFormProps {
  language: Language;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const crops = [
  'wheat',
  'rice',
  'cotton',
  'sugarcane',
  'corn',
  'soybean',
  'chickpea',
  'onion',
  'tomato',
  'potato',
  'groundnut',
  'sunflower',
];

const seasons = ['kharif', 'rabi', 'zaid'];

export function ExperimentForm({ language, onSuccess, onCancel }: ExperimentFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    crop: 'wheat',
    season: 'kharif',
    sowing_date: '',
    plot_size: '',
    plot_unit: 'acre',
    method_a: '',
    method_b: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sowing_date || !formData.plot_size || !formData.method_a || !formData.method_b) {
      toast.error(language === 'hi' ? 'सभी फ़ील्ड भरें' : 'Fill all fields');
      return;
    }

    setLoading(true);
    try {
      await experimentsAPI.create({
        crop: formData.crop,
        season: formData.season,
        sowing_date: new Date(formData.sowing_date),
        plot_size: parseFloat(formData.plot_size),
        plot_unit: formData.plot_unit,
        method_a: formData.method_a,
        method_b: formData.method_b,
        notes: formData.notes,
      });

      toast.success(language === 'hi' ? 'प्रयोग सफलतापूर्वक बनाया गया' : 'Experiment created successfully');
      setFormData({
        crop: 'wheat',
        season: 'kharif',
        sowing_date: '',
        plot_size: '',
        plot_unit: 'acre',
        method_a: '',
        method_b: '',
        notes: '',
      });
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || (language === 'hi' ? 'प्रयोग बनाने में विफल' : 'Failed to create experiment'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{language === 'hi' ? 'नया प्रयोग' : 'New Experiment'}</h2>
        {onCancel && (
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Crop Selection */}
          <div>
            <Label>{language === 'hi' ? 'फसल' : 'Crop'}</Label>
            <select
              value={formData.crop}
              onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
              className="mt-2 w-full px-3 py-2 border border-input bg-background rounded-md"
              disabled={loading}
            >
              {crops.map((crop) => (
                <option key={crop} value={crop}>
                  {crop.charAt(0).toUpperCase() + crop.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Season Selection */}
          <div>
            <Label>{language === 'hi' ? 'मौसम' : 'Season'}</Label>
            <select
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              className="mt-2 w-full px-3 py-2 border border-input bg-background rounded-md"
              disabled={loading}
            >
              {seasons.map((season) => (
                <option key={season} value={season}>
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sowing Date */}
          <div>
            <Label>{language === 'hi' ? 'बुवाई की तारीख' : 'Sowing Date'}</Label>
            <Input
              type="date"
              value={formData.sowing_date}
              onChange={(e) => setFormData({ ...formData, sowing_date: e.target.value })}
              className="mt-2"
              disabled={loading}
            />
          </div>

          {/* Plot Size */}
          <div>
            <Label>{language === 'hi' ? 'प्लॉट का आकार' : 'Plot Size'}</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                step="0.1"
                value={formData.plot_size}
                onChange={(e) => setFormData({ ...formData, plot_size: e.target.value })}
                placeholder="0.00"
                className="flex-1"
                disabled={loading}
              />
              <select
                value={formData.plot_unit}
                onChange={(e) => setFormData({ ...formData, plot_unit: e.target.value })}
                className="px-3 py-2 border border-input bg-background rounded-md"
                disabled={loading}
              >
                <option value="acre">Acre</option>
                <option value="hectare">Hectare</option>
                <option value="sqft">Sq Ft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Method A */}
        <div>
          <Label>{language === 'hi' ? 'विधि एक का विवरण' : 'Method A Description'}</Label>
          <Input
            placeholder={language === 'hi' ? 'परंपरागत तरीका, नई तकनीक, आदि' : 'e.g., Traditional method, New technique, etc.'}
            value={formData.method_a}
            onChange={(e) => setFormData({ ...formData, method_a: e.target.value })}
            className="mt-2"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {language === 'hi' ? 'यह आपके नियंत्रण क्षेत्र का विधि है' : 'This will be your control method'}
          </p>
        </div>

        {/* Method B */}
        <div>
          <Label>{language === 'hi' ? 'विधि दो का विवरण' : 'Method B Description'}</Label>
          <Input
            placeholder={language === 'hi' ? 'परंपरागत तरीका, नई तकनीक, आदि' : 'e.g., Traditional method, New technique, etc.'}
            value={formData.method_b}
            onChange={(e) => setFormData({ ...formData, method_b: e.target.value })}
            className="mt-2"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {language === 'hi' ? 'यह आपके प्रयोगात्मक विधि है' : 'This will be your experimental method'}
          </p>
        </div>

        {/* Notes */}
        <div>
          <Label>{language === 'hi' ? 'नोट्स' : 'Notes'}</Label>
          <Input
            placeholder={language === 'hi' ? 'अतिरिक्त जानकारी (वैकल्पिक)' : 'Additional information (optional)'}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="mt-2"
            disabled={loading}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            type="submit"
            className="flex-1"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === 'hi' ? 'बना रहे हैं...' : 'Creating...'}
              </>
            ) : (
              language === 'hi' ? 'प्रयोग शुरू करें' : 'Start Experiment'
            )}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
