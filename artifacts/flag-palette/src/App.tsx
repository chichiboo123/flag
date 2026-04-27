import React, { useState, useMemo } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Search, X, Globe2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { countries, Country, CONTINENTS, COLOR_LABELS, COLOR_HEX } from "@/data/countries";

const queryClient = new QueryClient();

const I18N = {
  ko: {
    appTitle: "국기 팔레트",
    subtitle: "세계의 국기로 색깔을 배워요",
    all: "전체",
    searchPlaceholder: "국가 이름으로 찾기...",
    sortLabel: "정렬",
    sortISOAsc: "ISO 코드 (A→Z)",
    sortISODesc: "ISO 코드 (Z→A)",
    sortNameAsc: "국가명 (가→하)",
    sortNameDesc: "국가명 (하→가)",
    showingCount: (count: number, total: number) => `${total}개국 중 ${count}개`,
    imageLoading: "이미지 준비 중",
    capital: "수도",
    continent: "대륙",
    closeBtn: "닫기",
    colors: "색상",
    noResults: "검색 결과가 없어요",
    isoKey: "언어 키",
  },
  en: {
    appTitle: "Colors of Flags",
    subtitle: "Learn colors through world flags",
    all: "All",
    searchPlaceholder: "Search country name...",
    sortLabel: "Sort",
    sortISOAsc: "ISO Code (A→Z)",
    sortISODesc: "ISO Code (Z→A)",
    sortNameAsc: "Name (A→Z)",
    sortNameDesc: "Name (Z→A)",
    showingCount: (count: number, total: number) => `Showing ${count} of ${total}`,
    imageLoading: "Image loading...",
    capital: "Capital",
    continent: "Continent",
    closeBtn: "Close",
    colors: "Colors",
    noResults: "No results found",
    isoKey: "ISO",
  },
  ja: {
    appTitle: "国旗パレット",
    subtitle: "世界の国旗で色を学ぼう",
    all: "すべて",
    searchPlaceholder: "国名で検索...",
    sortLabel: "並び替え",
    sortISOAsc: "ISOコード (A→Z)",
    sortISODesc: "ISOコード (Z→A)",
    sortNameAsc: "国名 (A→Z)",
    sortNameDesc: "国名 (Z→A)",
    showingCount: (count: number, total: number) => `全${total}カ国中 ${count}カ国`,
    imageLoading: "画像読み込み中...",
    capital: "首都",
    continent: "大陸",
    closeBtn: "閉じる",
    colors: "色",
    noResults: "結果がありません",
    isoKey: "ISO",
  },
  zh: {
    appTitle: "国旗调色板",
    subtitle: "通过世界国旗学习颜色",
    all: "全部",
    searchPlaceholder: "搜索国家名称...",
    sortLabel: "排序",
    sortISOAsc: "ISO 代码 (A→Z)",
    sortISODesc: "ISO 代码 (Z→A)",
    sortNameAsc: "国家名称 (A→Z)",
    sortNameDesc: "国家名称 (Z→A)",
    showingCount: (count: number, total: number) => `显示 ${total} 个国家中的 ${count} 个`,
    imageLoading: "图片加载中...",
    capital: "首都",
    continent: "大洲",
    closeBtn: "关闭",
    colors: "颜色",
    noResults: "没有找到结果",
    isoKey: "ISO",
  },
};

type LangKey = "ko" | "en" | "ja" | "zh";

// Array of base colors we have filter buttons for
const FILTER_COLORS = ["red", "blue", "yellow", "green", "white", "black", "orange", "purple"];

function FlagCard({ 
  country, 
  lang, 
  onClick 
}: { 
  country: Country; 
  lang: LangKey; 
  onClick: (c: Country) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const t = I18N[lang];
  const name = country[lang as keyof Country] as string;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer flex flex-col gap-3 group"
      onClick={() => onClick(country)}
      data-testid={`card-country-${country.iso}`}
      layout
    >
      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center relative">
        {imgError ? (
          <div className="flex flex-col items-center text-slate-400 gap-1">
            <span className="text-2xl">🏳️</span>
            <span className="text-xs font-medium">{t.imageLoading}</span>
          </div>
        ) : (
          <img
            src={`https://flagcdn.com/w160/${country.iso.toLowerCase()}.png`}
            alt={`${name} flag`}
            className="w-full h-full object-cover object-center"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
      </div>
      
      <div className="flex flex-col gap-1">
        <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md self-start">
          {country.iso}
        </span>
      </div>

      <div className="flex gap-1.5 mt-auto pt-2">
        {country.colors.slice(0, 5).map(c => (
          <div
            key={c}
            className="w-4 h-4 rounded-full border shadow-sm border-black/5"
            style={{ backgroundColor: COLOR_HEX[c] || c }}
            title={COLOR_LABELS[lang]?.[c] || c}
          />
        ))}
        {country.colors.length > 5 && (
          <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] text-slate-500 font-bold border border-slate-200">
            +
          </div>
        )}
      </div>
    </motion.div>
  );
}

function App() {
  const [lang, setLang] = useState<LangKey>("ko");
  const [search, setSearch] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("name-asc");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const t = I18N[lang];

  const filteredAndSortedCountries = useMemo(() => {
    let result = countries;

    // Filter by color
    if (selectedColor) {
      result = result.filter(c => c.colors.includes(selectedColor));
    }

    // Filter by search
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(c => 
        (c[lang as keyof Country] as string).toLowerCase().includes(s) ||
        c.en.toLowerCase().includes(s) ||
        c.iso.toLowerCase().includes(s)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortOrder === "iso-asc") return a.iso.localeCompare(b.iso);
      if (sortOrder === "iso-desc") return b.iso.localeCompare(a.iso);
      
      const nameA = a[lang as keyof Country] as string;
      const nameB = b[lang as keyof Country] as string;
      
      if (sortOrder === "name-asc") return nameA.localeCompare(nameB);
      if (sortOrder === "name-desc") return nameB.localeCompare(nameA);
      
      return 0;
    });

    return result;
  }, [lang, search, selectedColor, sortOrder]);

  return (
    <div className="min-h-[100dvh] w-full bg-background font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
              <Globe2 size={24} />
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-slate-800 leading-tight tracking-tight">
                {t.appTitle}
              </h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                {t.subtitle}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="material-icons text-slate-400 text-sm">language</span>
            <select 
              value={lang}
              onChange={e => setLang(e.target.value as LangKey)}
              className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer pr-2"
              data-testid="select-language"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Color Palette Filters */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-700 flex items-center gap-2">
              🎨 {t.colors}
            </h2>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedColor(null)}
              className={`h-12 px-6 rounded-full font-bold text-sm flex items-center gap-2 transition-all border-2 ${
                selectedColor === null 
                  ? "border-primary bg-primary/10 text-primary shadow-md scale-105" 
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
              data-testid="filter-color-all"
            >
              {t.all}
            </button>
            
            {FILTER_COLORS.map(c => {
              const isSelected = selectedColor === c;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedColor(isSelected ? null : c)}
                  className={`h-12 pl-3 pr-5 rounded-full font-bold text-sm flex items-center gap-2 transition-all border-2 ${
                    isSelected 
                      ? "border-primary bg-white shadow-md scale-105 text-slate-800" 
                      : "border-transparent bg-white text-slate-600 hover:scale-105 shadow-sm"
                  }`}
                  data-testid={`filter-color-${c}`}
                >
                  <div 
                    className={`w-6 h-6 rounded-full border shadow-inner ${c === 'white' ? 'border-slate-300' : 'border-transparent'}`}
                    style={{ backgroundColor: COLOR_HEX[c] }}
                  />
                  {COLOR_LABELS[lang]?.[c] || c}
                </button>
              );
            })}
          </div>
        </section>

        {/* Controls Bar */}
        <section className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative w-full sm:max-w-xs group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 text-slate-700 font-medium placeholder:font-normal placeholder:text-slate-400"
              data-testid="input-search"
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-sm font-semibold text-slate-500 whitespace-nowrap bg-slate-100 px-3 py-1.5 rounded-lg">
              {t.showingCount(filteredAndSortedCountries.length, countries.length)}
            </span>
            
            <div className="relative flex items-center bg-slate-50 rounded-xl h-11 px-3 border border-slate-100 focus-within:ring-2 focus-within:ring-primary/20">
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-600 focus:outline-none cursor-pointer w-full"
                data-testid="select-sort"
              >
                <option value="name-asc">{t.sortNameAsc}</option>
                <option value="name-desc">{t.sortNameDesc}</option>
                <option value="iso-asc">{t.sortISOAsc}</option>
                <option value="iso-desc">{t.sortISODesc}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Flag Grid */}
        <section className="pb-12">
          {filteredAndSortedCountries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="text-6xl mb-4 opacity-50">🌍</div>
              <h3 className="text-xl font-bold">{t.noResults}</h3>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6"
            >
              <AnimatePresence>
                {filteredAndSortedCountries.map(country => (
                  <FlagCard 
                    key={country.iso} 
                    country={country} 
                    lang={lang} 
                    onClick={setSelectedCountry} 
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCountry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
              onClick={() => setSelectedCountry(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[90vh]"
              data-testid="modal-country-detail"
            >
              <button 
                onClick={() => setSelectedCountry(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors z-20"
              >
                <X size={20} />
              </button>

              <div className="w-full aspect-[3/2] bg-slate-100 flex items-center justify-center p-8">
                <img
                  src={`https://flagcdn.com/w320/${selectedCountry.iso.toLowerCase()}.png`}
                  alt="Flag"
                  className="max-w-full max-h-full object-contain drop-shadow-md rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `<div class="flex flex-col items-center text-slate-400 gap-2"><span class="text-4xl">🏳️</span><span class="font-medium">${t.imageLoading}</span></div>`;
                  }}
                />
              </div>

              <div className="p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-extrabold text-slate-800">
                      {selectedCountry[lang as keyof Country] as string}
                    </h2>
                    <span className="px-2.5 py-1 bg-primary/10 text-primary text-sm font-bold font-mono rounded-lg">
                      {selectedCountry.iso}
                    </span>
                  </div>
                  {lang !== 'en' && (
                    <p className="text-slate-500 font-medium">{selectedCountry.en}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {t.capital}
                    </span>
                    <span className="font-bold text-slate-700 text-lg">
                      {selectedCountry.capital || "-"}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {t.continent}
                    </span>
                    <span className="font-bold text-slate-700 text-lg">
                      {CONTINENTS[lang]?.[selectedCountry.continent] || selectedCountry.continent}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                    {t.colors}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedCountry.colors.map(c => (
                      <div 
                        key={c}
                        className="flex items-center gap-2 pl-2 pr-4 h-10 rounded-full border border-slate-200 bg-white shadow-sm"
                      >
                        <div 
                          className={`w-6 h-6 rounded-full border shadow-inner ${c === 'white' ? 'border-slate-300' : 'border-transparent'}`}
                          style={{ backgroundColor: COLOR_HEX[c] || c }}
                        />
                        <span className="text-sm font-bold text-slate-700">
                          {COLOR_LABELS[lang]?.[c] || c}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;