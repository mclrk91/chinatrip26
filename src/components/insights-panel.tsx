"use client";

import { useState, useEffect, useCallback } from "react";
import { Lightbulb, ChevronDown, ChevronUp, RefreshCw, Loader2, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Insight {
  id: string;
  content: string;
  type: string;
  severity: "red" | "yellow" | "green";
  related_booking_ids: string[];
  related_dates: string[];
  created_at: string;
}

interface InsightsPanelProps {
  onInsightClick?: (dates: string[], bookingIds: string[]) => void;
}

const SEVERITY_CONFIG = {
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    icon: AlertCircle,
    iconColor: "text-red-500",
    label: "Action needed",
  },
  yellow: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    label: "Heads up",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    icon: CheckCircle2,
    iconColor: "text-green-500",
    label: "All good",
  },
};

export function InsightsPanel({ onInsightClick }: InsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      const res = await fetch("/api/insights");
      const data = await res.json();
      if (Array.isArray(data)) {
        setInsights(data);
      } else {
        setInsights([]);
      }
    } catch {
      // Silently fail - insights are supplementary
    }
  }, []);

  const refreshInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insights", { method: "POST" });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setInsights(data);
      } else {
        setError("Failed to generate insights");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const actionCount = insights.filter((i) => i.severity === "red" || i.severity === "yellow").length;

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-gold" />
          <span className="font-semibold text-base">Trip Insights</span>
          {actionCount > 0 && (
            <span className="bg-china-red text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
              {actionCount}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="border-t border-gray-200 p-4">
          {/* Refresh Button */}
          <div className="flex justify-end mb-3">
            <button
              onClick={refreshInsights}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-china-red transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {loading ? "Analyzing..." : "Refresh Insights"}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-3">{error}</p>
          )}

          {insights.length === 0 && !loading && (
            <div className="text-center py-6">
              <Lightbulb className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-muted-foreground">
                Tap &quot;Refresh Insights&quot; to analyze your itinerary
              </p>
            </div>
          )}

          {loading && insights.length === 0 && (
            <div className="text-center py-6">
              <Loader2 className="h-8 w-8 mx-auto text-china-red animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">
                Analyzing your itinerary...
              </p>
            </div>
          )}

          {/* Insight Cards */}
          <div className="space-y-2">
            {insights.map((insight) => {
              const config = SEVERITY_CONFIG[insight.severity] || SEVERITY_CONFIG.yellow;
              const Icon = config.icon;

              return (
                <button
                  key={insight.id}
                  onClick={() => onInsightClick?.(insight.related_dates, insight.related_booking_ids)}
                  className={`w-full text-left rounded-lg border p-3 transition-all hover:shadow-sm ${config.bg} ${config.border}`}
                >
                  <div className="flex items-start gap-2.5">
                    <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed ${config.text}`}>
                        {insight.content}
                      </p>
                      {insight.related_dates.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {insight.related_dates.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
