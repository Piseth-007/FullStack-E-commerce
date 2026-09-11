import { useState } from "react";
import { Tag as TagIcon, Sparkles } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import CategoriesPanel from "./CategoriesPanel";
import SkinTypesPanel from "./SkinTypesPanel";

export default function Categories() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("categories");

  const tabs = [
    { key: "categories", label: t("admin_cat_tab_categories"), icon: TagIcon },
    { key: "skin-types", label: t("admin_cat_tab_skin_types"), icon: Sparkles },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-[28px] font-medium text-ink">
          {activeTab === "categories"
            ? t("admin_cat_tab_categories")
            : t("admin_cat_tab_skin_types")}
        </h1>

        <div className="inline-flex items-center gap-1 rounded-lg border border-hairline bg-surface p-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium transition-all ${
                activeTab === key
                  ? "bg-moss text-white shadow-[0_2px_8px_rgba(63,88,67,0.15)]"
                  : "text-stone hover:text-ink hover:bg-paper"
              }`}
            >
              <Icon size={15} strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "categories" ? <CategoriesPanel /> : <SkinTypesPanel />}
    </div>
  );
}
