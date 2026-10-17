import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { fallbackLng, languageOptions, normalizeLanguage } from "@/i18n/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

// ISO 3166-1 alpha-2 country codes mapped to local flag images in public/flags/
export const LANGUAGE_COUNTRY_CODES: Record<string, string> = {
  en: "us",
  "zh-CN": "cn",
  es: "es",
  ar: "sa",
  de: "de",
  fr: "fr",
  ja: "jp",
  pt: "br",
  ru: "ru",
  it: "it",
  hi: "in",
  ko: "kr",
  nl: "nl",
  id: "id",
  tr: "tr",
  "zh-TW": "tw",
  pl: "pl",
  vi: "vn",
  sv: "se",
  th: "th",
};

type LanguageSwitcherProps = {
  className?: string;
};

const FlagIcon = ({ langCode, className }: { langCode: string; className?: string }) => {
  const countryCode = LANGUAGE_COUNTRY_CODES[langCode] ?? "us";
  return (
    <img
      src={`/flags/${countryCode}.png`}
      alt={langCode}
      className={cn("h-3.5 w-5 rounded-[2px] object-cover shadow-xs border border-border/40 shrink-0", className)}
      loading="eager"
    />
  );
};

export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const { t, i18n } = useTranslation();

  const currentLanguage =
    normalizeLanguage(i18n.resolvedLanguage ?? i18n.language) ?? fallbackLng;

  const handleValueChange = (selected: string) => {
    void i18n.changeLanguage(selected);
  };

  const getLanguageLabel = (value: string, defaultLabel: string) => {
    const key = `languages.${value}`;
    const translated = t(key);
    return translated && translated !== key ? translated : defaultLabel;
  };

  const currentOption = languageOptions.find((opt) => opt.value === currentLanguage);
  const currentLabel = currentOption
    ? getLanguageLabel(currentOption.value, currentOption.label)
    : currentLanguage;

  return (
    <Select value={currentLanguage} onValueChange={handleValueChange}>
      <SelectTrigger
        className={cn(
          "h-9 min-w-[134px] rounded-lg border border-border/80 bg-background/80 px-2.5 text-xs font-medium shadow-sm backdrop-blur transition-colors hover:bg-accent/50 focus:ring-1 focus:ring-primary/40",
          className
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <FlagIcon langCode={currentLanguage} />
          <span className="truncate">
            {currentLabel}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-72 min-w-[160px] z-50">
        {languageOptions.map((language) => (
          <SelectItem
            key={language.value}
            value={language.value}
            className="text-xs py-2 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <FlagIcon langCode={language.value} />
              <span className="font-medium">
                {getLanguageLabel(language.value, language.label)}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;
