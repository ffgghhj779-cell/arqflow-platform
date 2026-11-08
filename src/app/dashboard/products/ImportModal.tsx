"use client";

import { useState, useRef, useMemo } from "react";
import { 
  Upload, FileText, X, AlertCircle, Trash2, Plus, CheckCircle2, 
  Loader2, Link as LinkIcon, HelpCircle 
} from "lucide-react";
import { Modal, Field, StatCard, Spinner } from "@/components/ui";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/database.types";

type Product = Tables<"products">;

interface ExtractedItem {
  id: string;
  name: string;
  price: string;
  description: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  businessId: string;
  onSuccess: (newProducts: Product[]) => void;
}

export default function ImportModal({ open, onClose, businessId, onSuccess }: Props) {
  const { lang } = useLang();
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState<"source" | "upload" | "processing" | "preview">("source");
  const [sourceType, setSourceType] = useState<"file" | "google">("file");
  const [file, setFile] = useState<File | null>(null);
  const [googleUrl, setGoogleUrl] = useState("");
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [processingState, setProcessingState] = useState<"uploading" | "reading" | "extracting" | "organizing" | "preparing">("uploading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    ar: {
      title: "استيراد المنتجات",
      chooseSource: "اختر مصدر البيانات",
      fileUpload: "رفع ملف محلي",
      fileUploadSub: "Excel, CSV",
      googleLink: "رابط جوجل درايف",
      googleLinkSub: "Google Sheets (عام)",
      dragDrop: "اسحب وأفلت الملف هنا أو اضغط للتصفح",
      fileTypes: "Excel, CSV (حد أقصى 10 ميجابايت)",
      googlePlaceholder: "الصق رابط Google Doc أو Google Sheet هنا...",
      startBtn: "بدء الاستخراج",
      cancelBtn: "إلغاء",
      extracting: "جاري استخراج البيانات...",
      extractedItems: "العناصر المكتشفة",
      missingPrices: "أسعار مفقودة",
      duplicateNames: "أسماء مكررة",
      emptyDescriptions: "وصف مفقود",
      confirmBtn: "تأكيد واستيراد",
      addNewItem: "إضافة عنصر",
      itemName: "اسم العنصر",
      itemPrice: "السعر (ج.م)",
      itemDesc: "الوصف",
      emptyStateTitle: "لم نجد أي عناصر",
      emptyStateBody: "تأكد من محتوى الملف أو الرابط وأعد المحاولة.",
      googleLinkHint: "تأكد من أن الرابط متاح للعامة ليتمكن المساعد من قراءته.",
      statusMessages: {
        uploading: "جاري رفع الملف...",
        reading: "جاري قراءة الملف واستخراج النصوص...",
        extracting: "جاري تحليل البيانات بالذكاء الاصطناعي...",
        organizing: "جاري تنظيم وهيكلة البيانات...",
        preparing: "جاري إعداد المعاينة..."
      },
      saving: "جاري الحفظ...",
      changeSource: "تغيير المصدر"
    },
    en: {
      title: "Import Products",
      chooseSource: "Choose Data Source",
      fileUpload: "Local File Upload",
      fileUploadSub: "Excel, CSV",
      googleLink: "Google Drive Link",
      googleLinkSub: "Google Sheets (Public)",
      dragDrop: "Drag and drop your file here, or click to browse",
      fileTypes: "Excel, CSV (Max 10MB)",
      googlePlaceholder: "Paste your shareable Google Doc or Sheet link here...",
      startBtn: "Start Extraction",
      cancelBtn: "Cancel",
      extracting: "Extracting data...",
      extractedItems: "Detected Items",
      missingPrices: "Missing Prices",
      duplicateNames: "Duplicate Names",
      emptyDescriptions: "Empty Descriptions",
      confirmBtn: "Confirm & Import",
      addNewItem: "Add Item",
      itemName: "Item Name",
      itemPrice: "Price (EGP)",
      itemDesc: "Description",
      emptyStateTitle: "No items found",
      emptyStateBody: "Please verify the file or link content and try again.",
      googleLinkHint: "Make sure the link sharing is set to 'Anyone with the link can view'.",
      statusMessages: {
        uploading: "Uploading file...",
        reading: "Reading file and extracting text...",
        extracting: "Analyzing data with AI...",
        organizing: "Organizing and structuring data...",
        preparing: "Preparing preview..."
      },
      saving: "Saving...",
      changeSource: "Change Source"
    }
  };

  const currentT = lang === "ar" ? t.ar : t.en;

  // Run validation checks on extracted items
  const runValidation = (items: ExtractedItem[]) => {
    const names = items.map((i) => i.name.trim().toLowerCase());
    const duplicates = new Set<string>();
    const seen = new Set<string>();
    names.forEach((name) => {
      if (name && seen.has(name)) {
        duplicates.add(name);
      } else if (name) {
        seen.add(name);
      }
    });

    let missingPriceCount = 0;
    let duplicateCount = 0;
    let emptyDescCount = 0;

    items.forEach((item) => {
      const price = parseFloat(item.price);
      if (!item.price.trim() || isNaN(price) || price === 0) {
        missingPriceCount++;
      }
      if (duplicates.has(item.name.trim().toLowerCase())) {
        duplicateCount++;
      }
      if (!item.description.trim()) {
        emptyDescCount++;
      }
    });

    return {
      total: items.length,
      missingPrices: missingPriceCount,
      duplicates: duplicateCount,
      emptyDescriptions: emptyDescCount,
      duplicateSet: duplicates,
    };
  };

  const stats = runValidation(extractedItems);

  // File Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrorMessage(lang === "ar" ? "حجم الملف يتجاوز 10 ميجابايت" : "File size exceeds 10MB");
        return;
      }
      setFile(selectedFile);
      setErrorMessage(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.size > 10 * 1024 * 1024) {
        setErrorMessage(lang === "ar" ? "حجم الملف يتجاوز 10 ميجابايت" : "File size exceeds 10MB");
        return;
      }
      setFile(droppedFile);
      setErrorMessage(null);
    }
  };

  // Parsing Pipeline Trigger
  const startExtraction = async () => {
    setErrorMessage(null);
    setStep("processing");
    setProcessingState("uploading");

    const fd = new FormData();
    fd.append("importType", "products");
    if (sourceType === "file" && file) {
      fd.append("file", file);
    } else if (sourceType === "google" && googleUrl) {
      fd.append("url", googleUrl);
    } else {
      setErrorMessage(lang === "ar" ? "يرجى اختيار ملف أو إدخال رابط" : "Please select a file or input a link");
      setStep("upload");
      return;
    }

    // Step indicators loop
    const statusSteps: Array<typeof processingState> = ["uploading", "reading", "extracting", "organizing", "preparing"];
    let currentIdx = 0;
    const progressTimer = setInterval(() => {
      if (currentIdx < statusSteps.length - 1) {
        currentIdx++;
        setProcessingState(statusSteps[currentIdx]);
      }
    }, 700);

    try {
      const apiRequest = fetch("/api/import/parse", {
        method: "POST",
        body: fd,
      });

      // Keep screen loaded for at least 2.5s for smooth transitions
      const [response] = await Promise.all([
        apiRequest,
        new Promise((resolve) => setTimeout(resolve, 2500))
      ]);

      clearInterval(progressTimer);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Parsing failed");
      }

      setExtractedItems(data.items || []);
      setStep("preview");
    } catch (err: any) {
      clearInterval(progressTimer);
      setErrorMessage(err.message || "An unexpected error occurred");
      setStep("upload");
    }
  };

  // Inline Edits
  const handleItemChange = (id: string, field: keyof ExtractedItem, value: string) => {
    setExtractedItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === "price") {
          const val = value.replace(/[^\d.]/g, "").slice(0, 50);
          return { ...item, [field]: val };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setExtractedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddNewItem = () => {
    const newItem: ExtractedItem = {
      id: `manual_${Date.now()}`,
      name: "",
      price: "",
      description: "",
    };
    setExtractedItems((prev) => [newItem, ...prev]);
  };

  const confirmImport = async () => {
    const validItems = extractedItems.filter((i) => i.name.trim());
    if (validItems.length === 0) return;

    setSaving(true);
    try {
      // First, get the max sort_order
      const { data: existingProducts } = await supabase
        .from("products")
        .select("sort_order")
        .eq("business_id", businessId);
      
      let nextSortOrder = 0;
      if (existingProducts && existingProducts.length > 0) {
        nextSortOrder = Math.max(...existingProducts.map(p => p.sort_order || 0)) + 1;
      }

      const productsToInsert = validItems.map((item, index) => ({
        business_id: businessId,
        name: item.name.trim(),
        price_egp: item.price ? parseFloat(item.price) : null,
        description: item.description.trim() || null,
        available: true,
        sort_order: nextSortOrder + index,
      }));

      const { data, error } = await supabase
        .from("products")
        .insert(productsToInsert)
        .select();

      if (error) throw error;
      
      if (data) {
        onSuccess(data);
      }
      
      handleReset();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save products to database.");
      setSaving(false);
    }
  };

  const handleReset = () => {
    setStep("source");
    setFile(null);
    setGoogleUrl("");
    setExtractedItems([]);
    setErrorMessage(null);
    setSaving(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleReset} title={currentT.title} wide={step === "preview"}>
      {errorMessage && (
        <div className="mb-6 rounded-xl border border-[rgba(248,113,113,0.4)] bg-[rgba(248,113,113,0.08)] px-4 py-3 flex items-start gap-2.5 text-sm text-[var(--danger)]">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{lang === "ar" ? "حدث خطأ" : "Error"}</p>
            <p className="mt-0.5 opacity-90">{errorMessage}</p>
          </div>
        </div>
      )}

      {step === "source" && (
        <div className="space-y-4">
          <p className="text-sm text-muted font-medium mb-4">{currentT.chooseSource}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setSourceType("file");
                setStep("upload");
              }}
              className="p-5 rounded-xl text-start flex flex-col gap-3 transition-all border border-[var(--border)] hover:border-accent bg-[rgba(14,32,56,0.02)]"
            >
              <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-teal to-brand-sky flex items-center justify-center text-white shrink-0 shadow-sm">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold">{currentT.fileUpload}</h3>
                <p className="text-xs text-muted mt-1">{currentT.fileUploadSub}</p>
              </div>
            </button>

            <button
              onClick={() => {
                setSourceType("google");
                setStep("upload");
              }}
              className="p-5 rounded-xl text-start flex flex-col gap-3 transition-all border border-[var(--border)] hover:border-accent bg-[rgba(14,32,56,0.02)]"
            >
              <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-teal to-brand-sky flex items-center justify-center text-white shrink-0 shadow-sm">
                <LinkIcon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold">{currentT.googleLink}</h3>
                <p className="text-xs text-muted mt-1">{currentT.googleLinkSub}</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {step === "upload" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h2 className="text-base font-bold">
              {sourceType === "file" ? currentT.fileUpload : currentT.googleLink}
            </h2>
            <button
              onClick={() => setStep("source")}
              className="text-xs text-accent hover:underline"
            >
              {currentT.changeSource}
            </button>
          </div>

          {sourceType === "file" ? (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--border)] rounded-2xl flex flex-col items-center justify-center gap-3 py-10 px-4 cursor-pointer hover:border-accent hover:bg-[rgba(14,32,56,0.03)] transition-all bg-[rgba(14,32,56,0.01)]"
              >
                <Upload className="w-8 h-8 text-accent animate-pulse" />
                <p className="font-semibold text-sm">{currentT.dragDrop}</p>
                <p className="text-xs text-muted">{currentT.fileTypes}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </div>

              {file && (
                <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[rgba(14,32,56,0.03)] px-4 py-3">
                  <FileText className="w-5 h-5 text-accent shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" dir="ltr" style={{ textAlign: "start" }}>{file.name}</p>
                    <p className="text-xs text-muted mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="btn-ghost !p-1.5 text-[var(--danger)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Field label={currentT.googlePlaceholder} required>
                <input
                  className="input-base"
                  type="url"
                  value={googleUrl}
                  onChange={(e) => setGoogleUrl(e.target.value)}
                  placeholder="https://docs.google.com/..."
                  dir="ltr"
                  style={{ textAlign: "start" }}
                />
              </Field>
              <p className="text-xs text-muted flex items-start gap-1.5 leading-relaxed bg-[rgba(14,32,56,0.03)] border border-[var(--border)] rounded-xl p-3">
                <HelpCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>{currentT.googleLinkHint}</span>
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setStep("source")} className="btn-outline">
              {currentT.cancelBtn}
            </button>
            <button
              onClick={startExtraction}
              disabled={sourceType === "file" ? !file : !googleUrl.trim()}
              className="btn-primary"
            >
              {currentT.startBtn}
            </button>
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="flex flex-col items-center justify-center gap-5 py-10 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-[var(--border)] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
          <div className="space-y-2">
            <p className="font-bold text-lg">{currentT.extracting}</p>
            <p className="text-sm text-accent animate-pulse">
              {currentT.statusMessages[processingState]}
            </p>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-6">
          {/* stats overview cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[rgba(14,32,56,0.02)] flex flex-col gap-1">
              <span className="text-xs text-muted">{currentT.extractedItems}</span>
              <span className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> {stats.total}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[rgba(14,32,56,0.02)] flex flex-col gap-1">
              <span className="text-xs text-muted">{currentT.missingPrices}</span>
              <span className={cn("text-lg font-bold flex items-center gap-2", stats.missingPrices > 0 && "text-[var(--danger)]")}>
                <AlertCircle className="w-4 h-4" /> {stats.missingPrices}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[rgba(14,32,56,0.02)] flex flex-col gap-1">
              <span className="text-xs text-muted">{currentT.duplicateNames}</span>
              <span className={cn("text-lg font-bold flex items-center gap-2", stats.duplicates > 0 && "text-amber-500")}>
                <AlertCircle className="w-4 h-4" /> {stats.duplicates}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[rgba(14,32,56,0.02)] flex flex-col gap-1">
              <span className="text-xs text-muted">{currentT.emptyDescriptions}</span>
              <span className="text-lg font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-muted" /> {stats.emptyDescriptions}
              </span>
            </div>
          </div>

          {/* list section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-bold">{lang === "ar" ? "مراجعة العناصر وتعديلها" : "Review & Edit Items"}</h2>
              <button
                type="button"
                onClick={handleAddNewItem}
                className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {currentT.addNewItem}
              </button>
            </div>

            {extractedItems.length === 0 ? (
              <div className="text-center py-10 border border-[var(--border)] rounded-xl">
                <AlertCircle className="w-10 h-10 text-muted mx-auto mb-3 opacity-60" />
                <p className="font-bold text-base">{currentT.emptyStateTitle}</p>
                <p className="text-muted text-sm mt-1">{currentT.emptyStateBody}</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {extractedItems.map((item, index) => {
                  const isDupe = stats.duplicateSet.has(item.name.trim().toLowerCase());
                  const priceVal = parseFloat(item.price);
                  const isMissingPrice = !item.price.trim() || isNaN(priceVal) || priceVal === 0;

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-xl border p-4 relative",
                        (isDupe || isMissingPrice) 
                          ? "border-l-4 border-[var(--border)] border-l-[var(--danger)] bg-[rgba(248,113,113,0.02)]" 
                          : "border-[var(--border)] bg-[rgba(14,32,56,0.02)]"
                      )}
                    >
                      <button
                        type="button"
                        aria-label="Remove"
                        onClick={() => handleRemoveItem(item.id)}
                        className="absolute top-2 end-2 btn-ghost !p-1.5 text-[var(--danger)]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid sm:grid-cols-[2fr_1fr] gap-3 pe-8">
                        <Field
                          label={`${currentT.itemName}`}
                          error={isDupe ? (lang === "ar" ? "اسم مكرر" : "Duplicate name") : undefined}
                        >
                          <input
                            className="input-base"
                            value={item.name}
                            onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                            placeholder={lang === "ar" ? "مثال: بيتزا خضروات" : "e.g. Vegetarian Pizza"}
                            maxLength={200}
                          />
                        </Field>

                        <Field
                          label={currentT.itemPrice}
                          error={isMissingPrice ? (lang === "ar" ? "السعر مطلوب" : "Price required") : undefined}
                        >
                          <input
                            className="input-base"
                            dir="ltr"
                            style={{ textAlign: "start", direction: "ltr" }}
                            inputMode="decimal"
                            value={item.price}
                            onChange={(e) => handleItemChange(item.id, "price", e.target.value)}
                            placeholder="100"
                            maxLength={50}
                          />
                        </Field>
                      </div>

                      <div className="mt-3">
                        <Field label={currentT.itemDesc}>
                          <input
                            className="input-base"
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                            placeholder={lang === "ar" ? "مثال: الحجم وسط مع جبنة إضافية" : "e.g. Medium size with extra cheese"}
                            maxLength={500}
                          />
                        </Field>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Confirm / Cancel actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-[var(--border)]">
            <button onClick={handleReset} className="btn-outline">
              {currentT.cancelBtn}
            </button>
            <button
              onClick={confirmImport}
              disabled={extractedItems.length === 0 || saving}
              className="btn-primary"
            >
              {saving ? (
                <><Spinner className="w-4 h-4" /> {currentT.saving}</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> {currentT.confirmBtn}</>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
