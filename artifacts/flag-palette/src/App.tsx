import React, { useState, useMemo, useRef, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Search, X, Globe2, BookmarkPlus, BookmarkCheck, Download, Copy, FileImage, Trash2, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { countries, Country, CONTINENTS, COLOR_LABELS, COLOR_HEX } from "@/data/countries";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const queryClient = new QueryClient();

// Custom flag images for countries not supported by flagcdn
const CUSTOM_FLAGS: Record<string, string> = {
  AN: "/an.png",
};

function getFlagSrc(iso: string, size: number): string {
  if (CUSTOM_FLAGS[iso]) return CUSTOM_FLAGS[iso];
  return `https://flagcdn.com/w${size}/${iso.toLowerCase()}.png`;
}

const I18N = {
  ko: {
    appTitle: "국기 팔레트",
    subtitle: "색으로 만나는 세계의 국기",
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
    isoKey: "ISO 코드",
    colorThreshold: "색상 면적 기준",
    threshold30: "30% 이상",
    threshold50: "50% 이상",
    threshold80: "80% 이상",
    addToPalette: "팔레트에 담기",
    removeFromPalette: "팔레트에서 제거",
    myPalette: "나만의 팔레트",
    paletteName: "팔레트 이름",
    paletteNamePlaceholder: "팔레트 이름을 입력하세요...",
    paletteMemo: "메모",
    paletteMemoPlaceholder: "이 팔레트에 대한 메모를 남겨보세요...",
    exportJPG: "JPG 저장",
    exportPDF: "PDF 저장",
    copyClipboard: "클립보드 복사",
    paletteEmpty: "국기 카드를 클릭해 팔레트에 담아보세요!",
    paletteCount: (n: number) => `국기 ${n}개`,
    copied: "클립보드에 복사됨!",
    exportSuccess: "저장 완료!",
    clearAll: "전체 비우기",
  },
  en: {
    appTitle: "Flag Palette",
    subtitle: "Discover world flags through colors",
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
    colorThreshold: "Color area threshold",
    threshold30: "≥ 30%",
    threshold50: "≥ 50%",
    threshold80: "≥ 80%",
    addToPalette: "Add to Palette",
    removeFromPalette: "Remove from Palette",
    myPalette: "My Palette",
    paletteName: "Palette Name",
    paletteNamePlaceholder: "Enter palette name...",
    paletteMemo: "Memo",
    paletteMemoPlaceholder: "Write a memo for this palette...",
    exportJPG: "Save as JPG",
    exportPDF: "Save as PDF",
    copyClipboard: "Copy to Clipboard",
    paletteEmpty: "Click flag cards to add them to your palette!",
    paletteCount: (n: number) => `${n} flag${n !== 1 ? "s" : ""}`,
    copied: "Copied to clipboard!",
    exportSuccess: "Saved!",
    clearAll: "Clear All",
  },
  ja: {
    appTitle: "国旗パレット",
    subtitle: "色で旅する世界の国旗",
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
    colorThreshold: "色の面積基準",
    threshold30: "30% 以上",
    threshold50: "50% 以上",
    threshold80: "80% 以上",
    addToPalette: "パレットに追加",
    removeFromPalette: "パレットから削除",
    myPalette: "マイパレット",
    paletteName: "パレット名",
    paletteNamePlaceholder: "パレット名を入力...",
    paletteMemo: "メモ",
    paletteMemoPlaceholder: "このパレットについてメモを残しましょう...",
    exportJPG: "JPGで保存",
    exportPDF: "PDFで保存",
    copyClipboard: "クリップボードにコピー",
    paletteEmpty: "国旗カードをクリックしてパレットに追加しましょう！",
    paletteCount: (n: number) => `国旗 ${n}枚`,
    copied: "クリップボードにコピーしました！",
    exportSuccess: "保存しました！",
    clearAll: "全て削除",
  },
  zh: {
    appTitle: "国旗调色板",
    subtitle: "用颜色探索世界国旗",
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
    colorThreshold: "颜色面积阈值",
    threshold30: "≥ 30%",
    threshold50: "≥ 50%",
    threshold80: "≥ 80%",
    addToPalette: "加入调色板",
    removeFromPalette: "从调色板移除",
    myPalette: "我的调色板",
    paletteName: "调色板名称",
    paletteNamePlaceholder: "输入调色板名称...",
    paletteMemo: "备注",
    paletteMemoPlaceholder: "为这个调色板写下备注...",
    exportJPG: "保存为JPG",
    exportPDF: "保存为PDF",
    copyClipboard: "复制到剪贴板",
    paletteEmpty: "点击国旗卡片添加到调色板！",
    paletteCount: (n: number) => `${n} 面国旗`,
    copied: "已复制到剪贴板！",
    exportSuccess: "保存成功！",
    clearAll: "清空全部",
  },
};

type LangKey = "ko" | "en" | "ja" | "zh";
type Threshold = "30" | "50" | "80";

const FILTER_COLORS = ["red", "blue", "yellow", "green", "white", "black", "orange", "purple"];

function getColorsByThreshold(country: Country, threshold: Threshold): string[] {
  const colors = country.colors;
  if (threshold === "80") return colors.slice(0, 1);
  if (threshold === "50") return colors.slice(0, 2);
  return colors;
}

function FlagCard({
  country,
  lang,
  onClick,
  onTogglePalette,
  inPalette,
}: {
  country: Country;
  lang: LangKey;
  onClick: (c: Country) => void;
  onTogglePalette: (c: Country, e: React.MouseEvent) => void;
  inPalette: boolean;
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
      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer flex flex-col gap-3 group relative"
      onClick={() => onClick(country)}
      data-testid={`card-country-${country.iso}`}
      layout
    >
      <button
        onClick={(e) => onTogglePalette(country, e)}
        className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm border ${
          inPalette
            ? "bg-primary text-white border-primary"
            : "bg-white text-slate-400 border-slate-200 hover:border-primary hover:text-primary opacity-0 group-hover:opacity-100"
        }`}
        title={inPalette ? t.removeFromPalette : t.addToPalette}
        data-testid={`btn-palette-${country.iso}`}
      >
        {inPalette ? <BookmarkCheck size={15} /> : <BookmarkPlus size={15} />}
      </button>

      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center relative">
        {imgError ? (
          <div className="flex flex-col items-center text-slate-400 gap-1">
            <span className="text-2xl">🏳️</span>
            <span className="text-xs font-medium">{t.imageLoading}</span>
          </div>
        ) : (
          <img
            src={getFlagSrc(country.iso, 160)}
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
        {country.colors.slice(0, 5).map((c) => (
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

function PaletteFlagItem({ country, lang, onRemove }: { country: Country; lang: LangKey; onRemove: (iso: string) => void }) {
  const [imgError, setImgError] = useState(false);
  const t = I18N[lang];
  const name = country[lang as keyof Country] as string;
  return (
    <div className="relative group rounded-xl overflow-hidden border border-slate-100 bg-white shadow-sm">
      <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center">
        {imgError ? (
          <span className="text-xs text-slate-400">{t.imageLoading}</span>
        ) : (
          <img
            src={getFlagSrc(country.iso, 80)}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="px-2 py-1.5 text-center">
        <p className="text-xs font-bold text-slate-700 break-words leading-tight">{name}</p>
      </div>
      <button
        onClick={() => onRemove(country.iso)}
        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
        data-testid={`btn-remove-palette-${country.iso}`}
      >
        <X size={12} />
      </button>
    </div>
  );
}

function App() {
  const [lang, setLang] = useState<LangKey>("ko");
  const [search, setSearch] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("name-asc");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [threshold, setThreshold] = useState<Threshold>("30");
  const [palette, setPalette] = useState<Country[]>([]);
  const [showPalette, setShowPalette] = useState(false);
  const [paletteName, setPaletteName] = useState("");
  const [paletteMemo, setPaletteMemo] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const paletteExportRef = useRef<HTMLDivElement>(null);
  const t = I18N[lang];

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const togglePalette = useCallback((country: Country, e: React.MouseEvent) => {
    e.stopPropagation();
    setPalette((prev) => {
      const exists = prev.some((c) => c.iso === country.iso);
      if (exists) return prev.filter((c) => c.iso !== country.iso);
      return [...prev, country];
    });
  }, []);

  const removeFromPalette = useCallback((iso: string) => {
    setPalette((prev) => prev.filter((c) => c.iso !== iso));
  }, []);

  // Compute which colors have at least 1 country at the current threshold
  const activeColors = useMemo(() => {
    const set = new Set<string>();
    countries.forEach((c) => {
      getColorsByThreshold(c, threshold).forEach((col) => set.add(col));
    });
    return set;
  }, [threshold]);

  const filteredAndSortedCountries = useMemo(() => {
    let result = countries;

    if (selectedColor) {
      result = result.filter((c) =>
        getColorsByThreshold(c, threshold).includes(selectedColor)
      );
    }

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (c) =>
          (c[lang as keyof Country] as string).toLowerCase().includes(s) ||
          c.en.toLowerCase().includes(s) ||
          c.iso.toLowerCase().includes(s)
      );
    }

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
  }, [lang, search, selectedColor, sortOrder, threshold]);

  const paletteInSet = useMemo(() => new Set(palette.map((c) => c.iso)), [palette]);

  const captureCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    if (!paletteExportRef.current) return null;
    const canvas = await html2canvas(paletteExportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#f8fafc",
      logging: false,
    });
    return canvas;
  }, []);

  const exportJPG = useCallback(async () => {
    const canvas = await captureCanvas();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${paletteName || "flag-palette"}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
    showToast(t.exportSuccess);
  }, [captureCanvas, paletteName, t, showToast]);

  const exportPDF = useCallback(async () => {
    const canvas = await captureCanvas();
    if (!canvas) return;
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
    pdf.addImage(imgData, "JPEG", 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`${paletteName || "flag-palette"}.pdf`);
    showToast(t.exportSuccess);
  }, [captureCanvas, paletteName, t, showToast]);

  const copyToClipboard = useCallback(async () => {
    const canvas = await captureCanvas();
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        showToast(t.copied);
      } catch {
        showToast("클립보드 복사를 지원하지 않는 브라우저입니다.");
      }
    }, "image/png");
  }, [captureCanvas, t, showToast]);

  const thresholds: { value: Threshold; label: string }[] = [
    { value: "30", label: t.threshold30 },
    { value: "50", label: t.threshold50 },
    { value: "80", label: t.threshold80 },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPalette(true)}
                  className="relative flex items-center gap-2 h-9 px-4 rounded-full bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors border border-primary/20"
                  data-testid="btn-open-palette"
                >
                  <Layers size={16} />
                  <span className="hidden sm:inline">{t.myPalette}</span>
                  {palette.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow">
                      {palette.length}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <span className="material-icons text-slate-400 text-sm">language</span>
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value as LangKey)}
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
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">

            {/* Color Palette Filters */}
            <section className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="font-bold text-lg text-slate-700 flex items-center gap-2">
                  🎨 {t.colors}
                </h2>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">{t.colorThreshold}</span>
                  <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                    {thresholds.map((th) => (
                      <button
                        key={th.value}
                        onClick={() => {
                          setThreshold(th.value);
                          // Clear selected color if it becomes invalid for new threshold
                          if (selectedColor) {
                            const stillValid = countries.some(c =>
                              getColorsByThreshold(c, th.value).includes(selectedColor)
                            );
                            if (!stillValid) setSelectedColor(null);
                          }
                        }}
                        className={`px-3 py-1.5 text-xs font-bold transition-all ${
                          threshold === th.value
                            ? "bg-primary text-white"
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                        data-testid={`btn-threshold-${th.value}`}
                      >
                        {th.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Color buttons - centered, only show colors with results */}
              <div className="flex flex-wrap justify-center gap-3">
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

                {FILTER_COLORS.filter((c) => activeColors.has(c)).map((c) => {
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
                        className={`w-6 h-6 rounded-full border shadow-inner ${c === "white" ? "border-slate-300" : "border-transparent"}`}
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
                  onChange={(e) => setSearch(e.target.value)}
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
                    onChange={(e) => setSortOrder(e.target.value)}
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
                    {filteredAndSortedCountries.map((country) => (
                      <FlagCard
                        key={country.iso}
                        country={country}
                        lang={lang}
                        onClick={setSelectedCountry}
                        onTogglePalette={togglePalette}
                        inPalette={paletteInSet.has(country.iso)}
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
                    data-testid="btn-close-modal"
                  >
                    <X size={20} />
                  </button>

                  <div className="w-full aspect-[3/2] bg-slate-100 flex items-center justify-center p-8">
                    <img
                      src={getFlagSrc(selectedCountry.iso, 320)}
                      alt="Flag"
                      className="max-w-full max-h-full object-contain drop-shadow-md rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.parentElement!.innerHTML = `<div class="flex flex-col items-center text-slate-400 gap-2"><span class="text-4xl">🏳️</span><span class="font-medium">${t.imageLoading}</span></div>`;
                      }}
                    />
                  </div>

                  <div className="p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto">
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h2 className="text-3xl font-extrabold text-slate-800">
                          {selectedCountry[lang as keyof Country] as string}
                        </h2>
                        <span className="px-2.5 py-1 bg-primary/10 text-primary text-sm font-bold font-mono rounded-lg">
                          {selectedCountry.iso}
                        </span>
                        <button
                          onClick={(e) => togglePalette(selectedCountry, e)}
                          className={`ml-auto flex items-center gap-2 h-9 px-4 rounded-full text-sm font-bold border-2 transition-all ${
                            paletteInSet.has(selectedCountry.iso)
                              ? "border-primary bg-primary text-white"
                              : "border-primary/30 text-primary hover:bg-primary/10"
                          }`}
                          data-testid="btn-modal-palette"
                        >
                          {paletteInSet.has(selectedCountry.iso) ? (
                            <><BookmarkCheck size={16} /> {t.removeFromPalette}</>
                          ) : (
                            <><BookmarkPlus size={16} /> {t.addToPalette}</>
                          )}
                        </button>
                      </div>
                      {lang !== "en" && (
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
                        {selectedCountry.colors.map((c) => (
                          <div
                            key={c}
                            className="flex items-center gap-2 pl-2 pr-4 h-10 rounded-full border border-slate-200 bg-white shadow-sm"
                          >
                            <div
                              className={`w-6 h-6 rounded-full border shadow-inner ${c === "white" ? "border-slate-300" : "border-transparent"}`}
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

          {/* Palette Slide Panel */}
          <AnimatePresence>
            {showPalette && (
              <div className="fixed inset-0 z-50 flex justify-end">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm cursor-pointer"
                  onClick={() => setShowPalette(false)}
                />

                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full z-10"
                  data-testid="panel-palette"
                >
                  {/* Panel header */}
                  <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Layers size={20} className="text-primary" />
                      <h2 className="font-extrabold text-xl text-slate-800">{t.myPalette}</h2>
                      {palette.length > 0 && (
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                          {t.paletteCount(palette.length)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowPalette(false)}
                      className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                      data-testid="btn-close-palette"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Palette name + memo inputs */}
                  <div className="px-5 pt-4 pb-3 flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        {t.paletteName}
                      </label>
                      <input
                        type="text"
                        value={paletteName}
                        onChange={(e) => setPaletteName(e.target.value)}
                        placeholder={t.paletteNamePlaceholder}
                        className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:outline-none text-slate-700 font-semibold placeholder:font-normal placeholder:text-slate-400"
                        data-testid="input-palette-name"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        {t.paletteMemo}
                      </label>
                      <textarea
                        value={paletteMemo}
                        onChange={(e) => setPaletteMemo(e.target.value)}
                        placeholder={t.paletteMemoPlaceholder}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:outline-none text-slate-700 font-medium placeholder:font-normal placeholder:text-slate-400 resize-none text-sm leading-relaxed"
                        data-testid="input-palette-memo"
                      />
                    </div>
                  </div>

                  {/* Flag grid */}
                  <div className="flex-1 overflow-y-auto px-5 py-2">
                    {palette.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                        <Layers size={48} className="opacity-20" />
                        <p className="text-sm font-medium text-center leading-relaxed max-w-xs">
                          {t.paletteEmpty}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3 pb-4">
                        <AnimatePresence>
                          {palette.map((country) => (
                            <motion.div
                              key={country.iso}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              layout
                            >
                              <PaletteFlagItem
                                country={country}
                                lang={lang}
                                onRemove={removeFromPalette}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Export buttons */}
                  <div className="p-5 border-t border-slate-100 flex flex-col gap-3">
                    {palette.length > 0 && (
                      <button
                        onClick={() => setPalette([])}
                        className="flex items-center gap-2 text-xs text-red-400 hover:text-red-600 font-semibold self-end transition-colors mb-1"
                        data-testid="btn-clear-palette"
                      >
                        <Trash2 size={13} /> {t.clearAll}
                      </button>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={exportJPG}
                        disabled={palette.length === 0}
                        className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-600 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-sky-200"
                        data-testid="btn-export-jpg"
                      >
                        <FileImage size={18} />
                        {t.exportJPG}
                      </button>
                      <button
                        onClick={exportPDF}
                        disabled={palette.length === 0}
                        className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-red-200"
                        data-testid="btn-export-pdf"
                      >
                        <Download size={18} />
                        {t.exportPDF}
                      </button>
                      <button
                        onClick={copyToClipboard}
                        disabled={palette.length === 0}
                        className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-600 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-violet-200"
                        data-testid="btn-export-clipboard"
                      >
                        <Copy size={18} />
                        {t.copyClipboard}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Hidden export canvas */}
          <div
            ref={paletteExportRef}
            style={{
              position: "fixed",
              left: "-9999px",
              top: "-9999px",
              width: "900px",
              padding: "40px",
              backgroundColor: "#f8fafc",
              fontFamily: "'Pretendard', 'Inter', sans-serif",
            }}
            aria-hidden="true"
          >
            <div style={{ marginBottom: "24px" }}>
              <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#1e293b", margin: 0, lineHeight: 1.2 }}>
                {paletteName || t.myPalette}
              </h1>
              <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "6px" }}>
                {t.appTitle} · {t.paletteCount(palette.length)}
              </p>
            </div>

            {/* Memo section in export */}
            {paletteMemo && (
              <div style={{
                marginBottom: "24px",
                padding: "16px 20px",
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}>
                <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {paletteMemo}
                </p>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: "16px",
              }}
            >
              {palette.map((country) => (
                <div
                  key={country.iso}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ aspectRatio: "4/3", overflow: "hidden", backgroundColor: "#f1f5f9" }}>
                    <img
                      src={getFlagSrc(country.iso, 80)}
                      alt={country.en}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div style={{ padding: "8px 10px 10px" }}>
                    <p style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#334155",
                      margin: 0,
                      wordBreak: "break-word",
                      lineHeight: 1.4,
                    }}>
                      {country[lang as keyof Country] as string}
                    </p>
                    <p style={{ fontSize: "10px", color: "#94a3b8", margin: "3px 0 0", fontFamily: "monospace" }}>
                      {country.iso}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "24px", fontSize: "11px", color: "#cbd5e1", textAlign: "right" }}>
              Flag Palette · flagcdn.com
            </div>
          </div>

          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold"
              >
                {toast}
              </motion.div>
            )}
          </AnimatePresence>

          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
