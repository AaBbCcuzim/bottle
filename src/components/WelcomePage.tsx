import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";

interface WelcomePageProps {
  onOpenFile: () => void;
  onOpenFolder: () => void;
}

export function WelcomePage({ onOpenFile, onOpenFolder }: WelcomePageProps) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5">
      <img src="/icon.png" alt="bottle icon" className="w-20 h-20" />
      <h1 className="text-xl font-semibold text-foreground">{t("appName")}</h1>
      <p className="text-sm text-muted-foreground -mt-2">{t("tagline")}</p>
      <div className="flex flex-col gap-2 mt-1 w-48">
        <Button variant="outline" className="w-full" onClick={onOpenFile}>
          {t("openFile")}
        </Button>
        <Button variant="default" className="w-full" onClick={onOpenFolder}>
          {t("openFolder")}
        </Button>
      </div>
    </div>
  );
}
