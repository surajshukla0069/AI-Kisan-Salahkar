import { Sprout } from "lucide-react";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { t } from "@/lib/translations";

export function AppHeader({ title }: { title?: string }) {
  const { preferences } = useUserPreferences();
  const lang = preferences?.language || 'en';
  const displayTitle = title || t('app.title', lang);

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md">
          <Sprout className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-display text-lg font-bold leading-tight text-foreground">
            {displayTitle}
          </h1>
        </div>
      </div>
    </header>
  );
}
