import { useState, useEffect, useMemo, useCallback } from "react";
import { Moon, ArrowLeft, ChevronLeft, ChevronRight, Save, TrendingUp, Calendar, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, startOfWeek, addDays, subWeeks, addWeeks, startOfMonth, startOfYear } from "date-fns";
import { Progress } from "@/components/ui/progress";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const HABITS = [
  { key: "outside_20_min", label: "Got outside for 20 min" },
  { key: "morning_sunlight", label: "Got 10+ min morning sunlight" },
  { key: "no_eating_2hr", label: "No eating 2hr before bed" },
  { key: "no_caffeine_after_2pm", label: "No caffeine after 2pm" },
  { key: "phone_out_bedroom", label: "Phone out of the bedroom" },
  { key: "no_screens_1hr", label: "No screens 1hr before bed" },
] as const;

type HabitKey = typeof HABITS[number]["key"];

interface DayEntry {
  id?: string;
  entry_date: string;
  day_of_week: string;
  target_wake_time: string;
  target_bedtime: string;
  hours_in_bed: string;
  times_woke_up: string;
  hours_asleep: string;
  sleep_efficiency: string;
  outside_20_min: boolean;
  morning_sunlight: boolean;
  no_eating_2hr: boolean;
  no_caffeine_after_2pm: boolean;
  phone_out_bedroom: boolean;
  no_screens_1hr: boolean;
}

const emptyEntry = (date: Date, dayName: string): DayEntry => ({
  entry_date: format(date, "yyyy-MM-dd"),
  day_of_week: dayName,
  target_wake_time: "",
  target_bedtime: "",
  hours_in_bed: "",
  times_woke_up: "",
  hours_asleep: "",
  sleep_efficiency: "",
  outside_20_min: false,
  morning_sunlight: false,
  no_eating_2hr: false,
  no_caffeine_after_2pm: false,
  phone_out_bedroom: false,
  no_screens_1hr: false,
});

interface StatsData {
  avgHoursAsleep: number;
  avgEfficiency: number;
  avgTimesWokeUp: number;
  avgHoursInBed: number;
  totalEntries: number;
  habitRates: { key: string; label: string; rate: number }[];
}

function computeStats(entries: any[]): StatsData | null {
  if (!entries || entries.length === 0) return null;
  const withSleep = entries.filter((e) => e.hours_asleep && parseFloat(e.hours_asleep) > 0);
  const withEff = entries.filter((e) => e.sleep_efficiency && parseFloat(e.sleep_efficiency) > 0);
  const withWoke = entries.filter((e) => e.times_woke_up && parseFloat(e.times_woke_up) >= 0);
  const withBed = entries.filter((e) => e.hours_in_bed && parseFloat(e.hours_in_bed) > 0);
  const avg = (arr: any[], field: string) =>
    arr.length > 0 ? arr.reduce((s: number, e: any) => s + parseFloat(e[field]), 0) / arr.length : 0;
  const habitRates = HABITS.map(({ key, label }) => ({
    key, label,
    rate: entries.length > 0 ? (entries.filter((e) => e[key]).length / entries.length) * 100 : 0,
  }));
  return {
    avgHoursAsleep: Math.round(avg(withSleep, "hours_asleep") * 10) / 10,
    avgEfficiency: Math.round(avg(withEff, "sleep_efficiency") * 10) / 10,
    avgTimesWokeUp: Math.round(avg(withWoke, "times_woke_up") * 10) / 10,
    avgHoursInBed: Math.round(avg(withBed, "hours_in_bed") * 10) / 10,
    totalEntries: entries.length,
    habitRates,
  };
}

const StatCard = ({ label, value, unit }: { label: string; value: number; unit: string }) => (
  <div className="glass-card rounded-2xl p-4 text-center">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="text-2xl font-serif font-bold text-foreground">
      {value > 0 ? value : "–"}
      {value > 0 && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
    </p>
  </div>
);

const StatsView = ({ stats, periodLabel }: { stats: StatsData | null; periodLabel: string }) => {
  if (!stats || stats.totalEntries === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No sleep data for {periodLabel}.</p>
        <p className="text-sm text-muted-foreground mt-1">Start logging in the Diary tab!</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground text-center">{stats.totalEntries} entries logged for {periodLabel}</p>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Avg. Hours Asleep" value={stats.avgHoursAsleep} unit="hrs" />
        <StatCard label="Avg. Efficiency" value={stats.avgEfficiency} unit="%" />
        <StatCard label="Avg. Wake-ups" value={stats.avgTimesWokeUp} unit="×" />
        <StatCard label="Avg. Hours in Bed" value={stats.avgHoursInBed} unit="hrs" />
      </div>
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h4 className="font-serif font-semibold text-foreground">Habit Completion</h4>
        {stats.habitRates.map(({ key, label, rate }) => (
          <div key={key} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-foreground font-medium">{Math.round(rate)}%</span>
            </div>
            <Progress value={rate} className="h-2" />
          </div>
        ))}
      </div>
    </div>
  );
};

const SleepDiary = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [activeTab, setActiveTab] = useState("diary");
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"day" | "week" | "month" | "year">("week");
  const [analyticsData, setAnalyticsData] = useState<StatsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const weekDates = useMemo(
    () => DAYS.map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Reset initialized when week changes so entries re-initialize
  useEffect(() => {
    setInitialized(false);
  }, [weekStart]);

  useEffect(() => {
    if (!userId) {
      // No auth — initialize empty entries for the week so the form renders
      if (!initialized) {
        const week = DAYS.map((day, i) => emptyEntry(weekDates[i], day));
        setEntries(week);
        setInitialized(true);
      }
      return;
    }
    const load = async () => {
      const startDate = format(weekStart, "yyyy-MM-dd");
      const endDate = format(addDays(weekStart, 6), "yyyy-MM-dd");
      const { data } = await supabase
        .from("sleep_entries")
        .select("*")
        .eq("user_id", userId)
        .gte("entry_date", startDate)
        .lte("entry_date", endDate);
      const week = DAYS.map((day, i) => {
        const date = weekDates[i];
        const dateStr = format(date, "yyyy-MM-dd");
        const existing = data?.find((e: any) => e.entry_date === dateStr);
        if (existing) {
          return {
            id: existing.id, entry_date: existing.entry_date, day_of_week: existing.day_of_week,
            target_wake_time: existing.target_wake_time || "", target_bedtime: existing.target_bedtime || "",
            hours_in_bed: existing.hours_in_bed || "", times_woke_up: existing.times_woke_up || "",
            hours_asleep: existing.hours_asleep || "", sleep_efficiency: existing.sleep_efficiency || "",
            outside_20_min: existing.outside_20_min, morning_sunlight: existing.morning_sunlight,
            no_eating_2hr: existing.no_eating_2hr, no_caffeine_after_2pm: existing.no_caffeine_after_2pm,
            phone_out_bedroom: existing.phone_out_bedroom, no_screens_1hr: existing.no_screens_1hr,
          } as DayEntry;
        }
        return emptyEntry(date, day);
      });
      setEntries(week);
      setInitialized(true);
    };
    load();
  }, [userId, weekStart, weekDates, initialized]);

  const loadAnalytics = useCallback(async () => {
    if (!userId) return;
    setAnalyticsLoading(true);
    const now = new Date();
    let startDate: string;
    const endDate = format(now, "yyyy-MM-dd");
    switch (analyticsPeriod) {
      case "day": startDate = endDate; break;
      case "week": startDate = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"); break;
      case "month": startDate = format(startOfMonth(now), "yyyy-MM-dd"); break;
      case "year": startDate = format(startOfYear(now), "yyyy-MM-dd"); break;
    }
    const { data } = await supabase
      .from("sleep_entries").select("*").eq("user_id", userId)
      .gte("entry_date", startDate).lte("entry_date", endDate);
    setAnalyticsData(computeStats(data || []));
    setAnalyticsLoading(false);
  }, [userId, analyticsPeriod]);

  useEffect(() => {
    if (activeTab === "analytics") loadAnalytics();
  }, [activeTab, analyticsPeriod, loadAnalytics]);

  const updateField = (dayIndex: number, field: keyof DayEntry, value: string | boolean) => {
    setEntries((prev) => prev.map((e, i) => (i === dayIndex ? { ...e, [field]: value } : e)));
  };

  const saveAll = async () => {
    if (!userId) {
      toast.error("No active session. Data cannot be saved.");
      return;
    }
    setSaving(true);
    try {
      for (const entry of entries) {
        const payload = {
          user_id: userId, entry_date: entry.entry_date, day_of_week: entry.day_of_week,
          target_wake_time: entry.target_wake_time || null, target_bedtime: entry.target_bedtime || null,
          hours_in_bed: entry.hours_in_bed || null, times_woke_up: entry.times_woke_up || null,
          hours_asleep: entry.hours_asleep || null, sleep_efficiency: entry.sleep_efficiency || null,
          outside_20_min: entry.outside_20_min, morning_sunlight: entry.morning_sunlight,
          no_eating_2hr: entry.no_eating_2hr, no_caffeine_after_2pm: entry.no_caffeine_after_2pm,
          phone_out_bedroom: entry.phone_out_bedroom, no_screens_1hr: entry.no_screens_1hr,
        };
        if (entry.id) {
          await supabase.from("sleep_entries").update(payload).eq("id", entry.id);
        } else {
          const { data } = await supabase.from("sleep_entries").insert(payload).select("id").single();
          if (data) entry.id = data.id;
        }
      }
      toast.success("Sleep diary saved! 🌙");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save. Please try again.");
    }
    setSaving(false);
  };

  const currentEntry = entries[selectedDay];
  const weekLabel = `${format(weekStart, "MMM d")} – ${format(addDays(weekStart, 6), "MMM d, yyyy")}`;
  const periodLabels: Record<string, string> = {
    day: "today", week: "this week",
    month: format(new Date(), "MMMM yyyy"), year: format(new Date(), "yyyy"),
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="section-container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Moon className="w-4 h-4 text-primary" />
              </div>
              <span className="font-serif text-lg font-semibold text-foreground">Sleep Diary</span>
            </div>
          </div>
          {activeTab === "diary" && (
            <Button onClick={saveAll} disabled={saving} size="sm" className="rounded-xl">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </header>

      <main className="section-container py-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="diary" className="flex-1 gap-2">
              <Calendar className="w-4 h-4" /> Diary
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1 gap-2">
              <TrendingUp className="w-4 h-4" /> Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diary" className="space-y-6 mt-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="font-serif text-lg font-semibold text-foreground">{weekLabel}</h2>
              <Button variant="ghost" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-2">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(i)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedDay === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div>{day.slice(0, 3)}</div>
                  <div className="text-xs mt-0.5">{format(weekDates[i], "d")}</div>
                </button>
              ))}
            </div>

            {currentEntry && (
              <div className="space-y-6">
                <div className="glass-card rounded-2xl p-6 space-y-4">
                  <h3 className="font-serif text-lg font-semibold text-foreground">Sleep Log</h3>
                  {[
                    { key: "target_wake_time", label: "Target wake-up time?" },
                    { key: "target_bedtime", label: "What's your target bedtime?" },
                    { key: "hours_in_bed", label: "How many hours were you in bed last night?" },
                    { key: "times_woke_up", label: "How many times did you wake up?" },
                    { key: "hours_asleep", label: "How many hours were you asleep for?" },
                    { key: "sleep_efficiency", label: "What was your Sleep Efficiency? (e.g. 1–10)" },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">{label}</label>
                      <Input
                        value={(currentEntry as any)[key] || ""}
                        onChange={(e) => updateField(selectedDay, key as keyof DayEntry, e.target.value)}
                        placeholder="Enter your answer..."
                        className="bg-muted border-border/50 rounded-xl"
                      />
                    </div>
                  ))}
                </div>

                <div className="glass-card rounded-2xl p-6 space-y-4">
                  <h3 className="font-serif text-lg font-semibold text-foreground">Daily Habits</h3>
                  <div className="space-y-3">
                    {HABITS.map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox
                          checked={currentEntry[key as HabitKey]}
                          onCheckedChange={(checked) =>
                            updateField(selectedDay, key as keyof DayEntry, !!checked)
                          }
                        />
                        <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-4">
            <div className="flex gap-2 justify-center">
              {(["day", "week", "month", "year"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setAnalyticsPeriod(p)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    analyticsPeriod === p
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            {analyticsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <StatsView stats={analyticsData} periodLabel={periodLabels[analyticsPeriod]} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SleepDiary;
