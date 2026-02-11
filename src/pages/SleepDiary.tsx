import { useState, useEffect, useMemo } from "react";
import { Moon, ArrowLeft, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, startOfWeek, addDays, subWeeks, addWeeks } from "date-fns";

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

const SleepDiary = () => {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);

  const weekDates = useMemo(
    () => DAYS.map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Load entries for the week
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const startDate = format(weekStart, "yyyy-MM-dd");
      const endDate = format(addDays(weekStart, 6), "yyyy-MM-dd");

      const { data } = await supabase
        .from("sleep_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("entry_date", startDate)
        .lte("entry_date", endDate);

      const week = DAYS.map((day, i) => {
        const date = weekDates[i];
        const dateStr = format(date, "yyyy-MM-dd");
        const existing = data?.find((e: any) => e.entry_date === dateStr);
        if (existing) {
          return {
            id: existing.id,
            entry_date: existing.entry_date,
            day_of_week: existing.day_of_week,
            target_wake_time: existing.target_wake_time || "",
            target_bedtime: existing.target_bedtime || "",
            hours_in_bed: existing.hours_in_bed || "",
            times_woke_up: existing.times_woke_up || "",
            hours_asleep: existing.hours_asleep || "",
            sleep_efficiency: existing.sleep_efficiency || "",
            outside_20_min: existing.outside_20_min,
            morning_sunlight: existing.morning_sunlight,
            no_eating_2hr: existing.no_eating_2hr,
            no_caffeine_after_2pm: existing.no_caffeine_after_2pm,
            phone_out_bedroom: existing.phone_out_bedroom,
            no_screens_1hr: existing.no_screens_1hr,
          } as DayEntry;
        }
        return emptyEntry(date, day);
      });
      setEntries(week);
    };
    load();
  }, [user, weekStart, weekDates]);

  const updateField = (dayIndex: number, field: keyof DayEntry, value: string | boolean) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === dayIndex ? { ...e, [field]: value } : e))
    );
  };

  const saveAll = async () => {
    if (!user) return;
    setSaving(true);
    try {
      for (const entry of entries) {
        const payload = {
          user_id: user.id,
          entry_date: entry.entry_date,
          day_of_week: entry.day_of_week,
          target_wake_time: entry.target_wake_time || null,
          target_bedtime: entry.target_bedtime || null,
          hours_in_bed: entry.hours_in_bed || null,
          times_woke_up: entry.times_woke_up || null,
          hours_asleep: entry.hours_asleep || null,
          sleep_efficiency: entry.sleep_efficiency || null,
          outside_20_min: entry.outside_20_min,
          morning_sunlight: entry.morning_sunlight,
          no_eating_2hr: entry.no_eating_2hr,
          no_caffeine_after_2pm: entry.no_caffeine_after_2pm,
          phone_out_bedroom: entry.phone_out_bedroom,
          no_screens_1hr: entry.no_screens_1hr,
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          <Button onClick={saveAll} disabled={saving} size="sm" className="rounded-xl">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </header>

      <main className="section-container py-6 space-y-6">
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="font-serif text-lg font-semibold text-foreground">{weekLabel}</h2>
          <Button variant="ghost" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Day Tabs */}
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
            {/* Sleep Questions */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="font-serif text-lg font-semibold text-foreground">Sleep Log</h3>

              {[
                { key: "target_wake_time", label: "Target wake-up time?" },
                { key: "target_bedtime", label: "What's your target bedtime?" },
                { key: "hours_in_bed", label: "How many hours were you in bed last night?" },
                { key: "times_woke_up", label: "How many times did you wake up?" },
                { key: "hours_asleep", label: "How many hours were you asleep for?" },
                { key: "sleep_efficiency", label: "What was your Sleep Efficiency?" },
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

            {/* Habit Checklist */}
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
      </main>
    </div>
  );
};

export default SleepDiary;
