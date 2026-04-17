import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sprout, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { t } from '@/lib/translations.js';
import type { Language } from '@/hooks/use-user-preferences.js';

interface Experiment {
  _id: string;
  crop: string;
  season: string;
  sowing_date: string | Date;
  status: 'active' | 'completed' | 'cancelled';
  plot_size: number;
  plot_unit: string;
  method_a: string;
  method_b: string;
  harvest_date?: string | Date;
  harvest_amount_a?: number;
  harvest_amount_b?: number;
  profit_a?: number;
  profit_b?: number;
  notes?: string;
}

interface ExperimentCardProps {
  experiment: Experiment;
  language: Language;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export function ExperimentCard({
  experiment,
  language,
  onEdit,
  onDelete,
  onViewDetails,
}: ExperimentCardProps) {
  const statusColors: Record<string, string> = {
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, Record<Language, string>> = {
    active: { en: 'Active', hi: 'सक्रिय', pa: 'ਸਕਿਰਿਆ', mr: 'सक्रिय' },
    completed: { en: 'Completed', hi: 'पूर्ण', pa: 'ਪੂਰਾ', mr: 'पूर्ण' },
    cancelled: { en: 'Cancelled', hi: 'रद्द', pa: 'ਰੱਦ', mr: 'रद्द' },
  };

  const sowingDate = new Date(experiment.sowing_date);
  const daysGrowing = Math.floor((new Date().getTime() - sowingDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Sprout className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg capitalize">{experiment.crop}</h3>
            <p className="text-sm text-muted-foreground">
              {language === 'hi' ? 'मौसम' : 'Season'}: {experiment.season}
            </p>
          </div>
        </div>
        <Badge className={statusColors[experiment.status]}>
          {statusLabels[experiment.status][language]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-muted-foreground">{language === 'hi' ? 'बुवाई की तारीख' : 'Sowing Date'}</p>
          <p className="font-medium">{format(sowingDate, 'MMM dd, yyyy')}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{language === 'hi' ? 'दिन में बढ़ रहा है' : 'Days Growing'}</p>
          <p className="font-medium">{daysGrowing} {language === 'hi' ? 'दिन' : 'days'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{language === 'hi' ? 'प्लॉट का आकार' : 'Plot Size'}</p>
          <p className="font-medium">
            {experiment.plot_size} {experiment.plot_unit}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">{language === 'hi' ? 'तुलना' : 'Comparison'}</p>
          <p className="font-medium text-truncate text-xs">
            {experiment.method_a.substring(0, 20)}... v/s {experiment.method_b.substring(0, 20)}...
          </p>
        </div>
      </div>

      {experiment.status === 'completed' && experiment.profit_a !== undefined && experiment.profit_b !== undefined && (
        <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <p className="font-medium text-sm">{language === 'hi' ? 'परिणाम' : 'Results'}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">{language === 'hi' ? 'विधि एक' : 'Method A'}</p>
              <p className="font-semibold">₹{experiment.profit_a.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{language === 'hi' ? 'विधि दो' : 'Method B'}</p>
              <p className="font-semibold">₹{experiment.profit_b.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {experiment.notes && (
        <div className="mb-4 p-3 rounded-lg bg-muted">
          <p className="text-xs text-muted-foreground mb-1">{language === 'hi' ? 'नोट्स' : 'Notes'}</p>
          <p className="text-sm">{experiment.notes}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onViewDetails?.(experiment._id)}
        >
          {language === 'hi' ? 'विवरण देखें' : 'View Details'}
        </Button>
        {experiment.status === 'active' && onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(experiment._id)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              if (window.confirm(language === 'hi' ? 'क्या आप निश्चित हैं?' : 'Are you sure?')) {
                onDelete(experiment._id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
