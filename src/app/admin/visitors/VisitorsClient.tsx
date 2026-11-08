"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Globe, Calendar, CalendarRange, Sun, Eye } from "lucide-react";
import { useT } from "@/lib/i18n";
import { StatCard } from "@/components/ui";

type AnalyticsData = {
  total: number;
  month: number;
  week: number;
  today: number;
  history: { date: string; count: number }[];
  locations: Record<string, number>;
};

interface Props {
  analyticsData: AnalyticsData;
}

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "rgba(17,39,66,0.95)",
    border: "1px solid rgba(184,144,99,0.15)",
    borderRadius: "0.75rem",
    color: "#eeedd2",
    fontSize: 12,
  },
  cursor: { fill: "rgba(13,34,54,0.04)" },
};

const AXIS_PROPS = {
  tick: { fill: "#8fb3bd", fontSize: 11 },
  axisLine: false as const,
  tickLine: false as const,
};

export default function VisitorsClient({ analyticsData }: Props) {
  const t = useT({
    ar: {
      title: "زوار الموقع",
      subtitle: "زوار فريدون من العملاء الحقيقيين",
      total: "الإجمالي",
      month: "الشهر",
      week: "الأسبوع",
      today: "اليوم",
      historyTitle: "الزوار — آخر 14 يوم",
      locationTitle: "الزوار حسب المحافظة",
    },
    en: {
      title: "Site Visitors",
      subtitle: "Unique visitors from real customers",
      total: "Total",
      month: "Month",
      week: "Week",
      today: "Today",
      historyTitle: "Visitors — Last 14 days",
      locationTitle: "Visitors by Governorate",
    },
  });

  // Sort locations by count descending
  const sortedLocations = Object.entries(analyticsData.locations || {})
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const maxLocationCount = sortedLocations.length > 0 ? sortedLocations[0].count : 1;

  // Format history for charts
  const historyData = analyticsData.history || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-start">
          <div className="w-12 h-12 rounded-2xl bg-[rgba(184,144,99,0.12)] text-accent flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-app">{t.title}</h2>
            <p className="text-muted text-sm mt-0.5">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label={t.total}
          value={analyticsData.total.toLocaleString("ar-EG")}
          icon={<Globe className="w-5 h-5" />}
        />
        <StatCard
          label={t.month}
          value={analyticsData.month.toLocaleString("ar-EG")}
          icon={<CalendarRange className="w-5 h-5" />}
        />
        <StatCard
          label={t.week}
          value={analyticsData.week.toLocaleString("ar-EG")}
          icon={<Calendar className="w-5 h-5" />}
        />
        <StatCard
          label={t.today}
          value={analyticsData.today.toLocaleString("ar-EG")}
          icon={<Sun className="w-5 h-5" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Chart (Recharts BarChart of daily visitors) */}
        <div className="card p-6 lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base flex items-center gap-2 text-app">
              <span>📈</span>
              <span>{t.historyTitle}</span>
            </h3>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,34,54,0.07)" vertical={false} />
                <XAxis dataKey="date" {...AXIS_PROPS} />
                <YAxis {...AXIS_PROPS} allowDecimals={false} />
                <Tooltip
                  {...TOOLTIP_STYLE}
                  formatter={(v: number) => [`${v.toLocaleString()} زائر / visitor`, "الزوار"]}
                />
                <Bar
                  dataKey="count"
                  fill="#9c542b"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Locations (Progress Bars styled identically to mockup) */}
        <div className="card p-6 lg:col-span-2 space-y-4">
          <h3 className="font-extrabold text-base flex items-center gap-2 text-app">
            <span>📍</span>
            <span>{t.locationTitle}</span>
          </h3>

          <div className="space-y-4 overflow-y-auto max-h-72 pr-1">
            {sortedLocations.map((loc) => {
              const percentage = (loc.count / maxLocationCount) * 100;
              return (
                <div key={loc.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-muted">{loc.name}</span>
                    <span className="text-app font-bold">{loc.count.toLocaleString("ar-EG")}</span>
                  </div>
                  <div className="w-full h-2.5 bg-[rgba(13,34,54,0.04)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#9c542b] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
