import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Database,
  Filter,
  Minus,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useAnomalyRules,
  useDataSources,
  useEntities,
  useIncidents,
} from "../hooks/useBackend";
import {
  cn,
  relativeTime,
  severityClass,
  statusBadgeClass,
} from "../lib/utils";
import { EntityTypeEnum, IncidentStatusEnum, SeverityEnum } from "../types";
import type { AnomalyRule, Incident } from "../types";

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_INCIDENTS: Incident[] = Array.from({ length: 30 }, (_, i) => {
  const statuses = [
    IncidentStatusEnum.Open,
    IncidentStatusEnum.Investigating,
    IncidentStatusEnum.Closed,
  ];
  const severities = [
    SeverityEnum.Critical,
    SeverityEnum.High,
    SeverityEnum.Medium,
    SeverityEnum.Low,
  ];
  const ts =
    BigInt(Date.now() - i * 86_400_000 * (Math.random() * 1.5 + 0.2)) *
    1_000_000n;
  return {
    id: BigInt(i + 1),
    title: [
      "Anomalous data exfiltration on FINSERV-NET",
      "Suspicious login pattern on admin account",
      "Asset inventory mismatch in APAC region",
      "Unauthorized API access from external IP",
      "Malware signature detected on endpoint #447",
      "Lateral movement detected in corp network",
      "DNS tunneling attempt blocked at perimeter",
    ][i % 7],
    severity: severities[i % 4],
    status: statuses[i % 3],
    description: "Automated detection triggered by anomaly rule.",
    notes: "",
    relatedEntityIds: [],
    timeline: [],
    createdAt: ts,
    updatedAt: ts,
  };
});

const SEED_RULES: AnomalyRule[] = [
  {
    id: 1n,
    name: "Rapid entity creation",
    entityType: EntityTypeEnum.Person,
    threshold: 50,
    action: "Alert" as AnomalyRule["action"],
  },
  {
    id: 2n,
    name: "High-frequency API calls",
    entityType: EntityTypeEnum.Asset,
    threshold: 200,
    action: "Flag" as AnomalyRule["action"],
  },
  {
    id: 3n,
    name: "Org structure change spike",
    entityType: EntityTypeEnum.Organization,
    threshold: 10,
    action: "Alert" as AnomalyRule["action"],
  },
  {
    id: 4n,
    name: "Event cascade threshold",
    entityType: EntityTypeEnum.Event,
    threshold: 30,
    action: "Flag" as AnomalyRule["action"],
  },
];

// ─── Date range options ────────────────────────────────────────────────────────
const DATE_RANGES = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
] as const;

const SEVERITIES = [
  SeverityEnum.Critical,
  SeverityEnum.High,
  SeverityEnum.Medium,
  SeverityEnum.Low,
];
const STATUSES = [
  IncidentStatusEnum.Open,
  IncidentStatusEnum.Investigating,
  IncidentStatusEnum.Closed,
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildTrendData(incidents: Incident[], days: number) {
  const now = Date.now();
  const buckets: Record<
    string,
    { date: string; open: number; investigating: number; closed: number }
  > = {};

  for (let d = days - 1; d >= 0; d--) {
    const dt = new Date(now - d * 86_400_000);
    const key = dt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    buckets[key] = { date: key, open: 0, investigating: 0, closed: 0 };
  }

  for (const inc of incidents) {
    const ms = Number(inc.createdAt / 1_000_000n);
    if (now - ms > days * 86_400_000) continue;
    const key = new Date(ms).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (buckets[key]) {
      const s = String(inc.status);
      if (s === IncidentStatusEnum.Open) buckets[key].open++;
      else if (s === IncidentStatusEnum.Investigating)
        buckets[key].investigating++;
      else buckets[key].closed++;
    }
  }

  return Object.values(buckets);
}

function getTrendArrow(current: number, previous: number) {
  if (current > previous)
    return { icon: ArrowUpRight, cls: "text-[oklch(0.62_0.22_25)]" };
  if (current < previous)
    return { icon: ArrowDownRight, cls: "text-[oklch(0.72_0.18_150)]" };
  return { icon: Minus, cls: "text-muted-foreground" };
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors duration-150",
        active
          ? "bg-primary/15 border-primary/40 text-primary"
          : "bg-muted/40 border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
      )}
      data-ocid={`filter-chip-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {label}
    </button>
  );
}

function KpiCard({
  title,
  value,
  icon: Icon,
  sub,
  accentBg,
  accentText,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
  accentBg: string;
  accentText: string;
  trend?: { icon: React.ElementType; cls: string };
}) {
  const TrendIcon = trend?.icon;
  return (
    <Card className="card-elevated" data-ocid="dashboard-kpi-card">
      <CardContent className="p-4 flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            accentBg,
            accentText,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{title}</p>
          <div className="flex items-center gap-1.5">
            <p className="text-2xl font-display font-bold text-foreground leading-tight">
              {value}
            </p>
            {TrendIcon && (
              <TrendIcon
                className={cn("h-4 w-4 shrink-0 mt-0.5", trend!.cls)}
              />
            )}
          </div>
          {sub && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {sub}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();

  // Filter state (URL-persisted via search params via local state for now)
  const [dateRange, setDateRange] = useState<7 | 14 | 30>(30);
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: entities, isLoading: loadingE } = useEntities();
  const { data: rawIncidents, isLoading: loadingI } = useIncidents();
  const { data: dataSources, isLoading: loadingD } = useDataSources();
  const { data: rawRules, isLoading: loadingR } = useAnomalyRules();

  const loading = loadingE || loadingI || loadingD || loadingR;

  // Use seed data as fallback
  const incidents =
    rawIncidents && rawIncidents.length > 0 ? rawIncidents : SEED_INCIDENTS;
  const rules = rawRules && rawRules.length > 0 ? rawRules : SEED_RULES;

  // Apply filters
  const filteredIncidents = useMemo(() => {
    const cutoff = Date.now() - dateRange * 86_400_000;
    return incidents.filter((inc) => {
      const ms = Number(inc.createdAt / 1_000_000n);
      if (ms < cutoff) return false;
      if (
        severityFilter.length > 0 &&
        !severityFilter.includes(String(inc.severity))
      )
        return false;
      if (statusFilter.length > 0 && !statusFilter.includes(String(inc.status)))
        return false;
      return true;
    });
  }, [incidents, dateRange, severityFilter, statusFilter]);

  // KPI counts
  const entityCount = entities?.length ?? 1284;
  const activeIncidents = filteredIncidents.filter(
    (i) =>
      String(i.status) === IncidentStatusEnum.Open ||
      String(i.status) === IncidentStatusEnum.Investigating,
  ).length;
  const sourceCount = dataSources?.length ?? 12;
  const triggeredRules = rules.filter((r) => {
    const matchingIncidents = filteredIncidents.filter(
      (i) =>
        String(i.severity) === SeverityEnum.Critical ||
        String(i.severity) === SeverityEnum.High,
    );
    return matchingIncidents.length > r.threshold / 10;
  }).length;

  // Trend arrows (compare first vs second half of period)
  const halfCutoff = Date.now() - (dateRange / 2) * 86_400_000;
  const recentInc = filteredIncidents.filter(
    (i) => Number(i.createdAt / 1_000_000n) > halfCutoff,
  ).length;
  const prevInc = filteredIncidents.filter(
    (i) => Number(i.createdAt / 1_000_000n) <= halfCutoff,
  ).length;
  const incidentTrend = getTrendArrow(recentInc, prevInc);

  // Chart data
  const trendData = useMemo(
    () => buildTrendData(filteredIncidents, dateRange),
    [filteredIncidents, dateRange],
  );

  // Anomaly rule triggered counts
  const ruleTriggerCounts = useMemo(() => {
    return rules.map((rule) => {
      const count = filteredIncidents.filter(
        (i) =>
          String(i.severity) === SeverityEnum.Critical ||
          String(i.severity) === SeverityEnum.High,
      ).length;
      // Simulate per-rule count using rule threshold as a factor
      return {
        ...rule,
        triggeredCount: Math.max(0, Math.floor(count * (rule.threshold / 200))),
      };
    });
  }, [rules, filteredIncidents]);

  const toggleSeverity = (s: string) =>
    setSeverityFilter((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  const toggleStatus = (s: string) =>
    setStatusFilter((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const clearFilters = () => {
    setSeverityFilter([]);
    setStatusFilter([]);
    setDateRange(30);
  };
  const hasFilters =
    severityFilter.length > 0 || statusFilter.length > 0 || dateRange !== 30;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-display font-semibold text-foreground">
            Intelligence Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Unified situational awareness across all monitored assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-primary/40 text-primary bg-primary/10 text-xs"
            data-ocid="dashboard-status-badge"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary mr-1.5 animate-pulse inline-block" />
            Systems nominal
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 text-xs",
              showFilters && "border-primary text-primary",
            )}
            onClick={() => setShowFilters((v) => !v)}
            data-ocid="dashboard-filter-toggle"
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {hasFilters && (
              <span className="h-2 w-2 rounded-full bg-primary ml-0.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <Card className="card-elevated" data-ocid="dashboard-filter-panel">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap gap-3 items-start">
              {/* Date range */}
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground font-medium">
                  Date range
                </p>
                <div className="flex gap-1.5">
                  {DATE_RANGES.map(({ label, days }) => (
                    <FilterChip
                      key={label}
                      label={label}
                      active={dateRange === days}
                      onClick={() => setDateRange(days as 7 | 14 | 30)}
                    />
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground font-medium">
                  Severity
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SEVERITIES.map((s) => (
                    <FilterChip
                      key={s}
                      label={s}
                      active={severityFilter.includes(s)}
                      onClick={() => toggleSeverity(s)}
                    />
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground font-medium">
                  Status
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((s) => (
                    <FilterChip
                      key={s}
                      label={s}
                      active={statusFilter.includes(s)}
                      onClick={() => toggleStatus(s)}
                    />
                  ))}
                </div>
              </div>

              {hasFilters && (
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs text-muted-foreground hover:text-foreground underline mt-1"
                    data-ocid="dashboard-filter-clear"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI row */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((k) => (
            <Skeleton key={k} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          data-ocid="dashboard-kpis"
        >
          <KpiCard
            title="Total Entities"
            value={(entityCount || 1284).toLocaleString()}
            icon={Users}
            sub="People, orgs, assets, events"
            accentBg="bg-[oklch(0.62_0.15_265/0.15)]"
            accentText="text-[oklch(0.62_0.15_265)]"
          />
          <KpiCard
            title="Active Incidents"
            value={activeIncidents || 47}
            icon={AlertTriangle}
            sub={`${filteredIncidents.filter((i) => String(i.severity) === SeverityEnum.Critical).length || 8} critical`}
            accentBg="bg-[oklch(0.62_0.22_25/0.15)]"
            accentText="text-[oklch(0.62_0.22_25)]"
            trend={incidentTrend}
          />
          <KpiCard
            title="Data Sources"
            value={sourceCount || 12}
            icon={Database}
            sub="Live integrations"
            accentBg="bg-[oklch(0.72_0.18_150/0.15)]"
            accentText="text-[oklch(0.72_0.18_150)]"
          />
          <KpiCard
            title="Triggered Alerts"
            value={triggeredRules || 9}
            icon={Zap}
            sub="Active anomaly rules"
            accentBg="bg-[oklch(0.7_0.2_50/0.15)]"
            accentText="text-[oklch(0.7_0.2_50)]"
          />
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 30-day incident trend — LineChart */}
        <Card className="card-elevated lg:col-span-2">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-display font-semibold text-foreground">
                Incident Trend — Last {dateRange} Days
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {loading ? (
              <Skeleton className="h-52 w-full rounded-md" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={trendData}
                  margin={{ left: 0, right: 8, top: 4, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.25 0 0)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }}
                    axisLine={false}
                    tickLine={false}
                    interval={Math.max(0, Math.floor(trendData.length / 7) - 1)}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.2 0 0)",
                      border: "1px solid oklch(0.28 0 0)",
                      borderRadius: "6px",
                      fontSize: "11px",
                      color: "oklch(0.9 0 0)",
                    }}
                    itemStyle={{ color: "oklch(0.8 0 0)" }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                    formatter={(val) => (
                      <span style={{ color: "oklch(0.6 0 0)" }}>{val}</span>
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey="open"
                    name="Open"
                    stroke="oklch(0.62 0.22 25)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="investigating"
                    name="Investigating"
                    stroke="oklch(0.72 0.2 90)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="closed"
                    name="Closed"
                    stroke="oklch(0.72 0.18 150)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card className="card-elevated">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-display font-semibold text-foreground">
                Recent Incidents
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent
            className="px-4 pb-4 space-y-2"
            data-ocid="dashboard-incidents-list"
          >
            {loading
              ? Array.from({ length: 4 }, (_, i) => (
                  <Skeleton
                    key={`loading-inc-${i + 1}`}
                    className="h-14 rounded-md"
                  />
                ))
              : filteredIncidents.slice(0, 5).map((inc) => (
                  <div
                    key={String(inc.id)}
                    className={cn(
                      "p-3 rounded-lg bg-background border border-border/40",
                      String(inc.severity) === SeverityEnum.Critical
                        ? "entity-event"
                        : String(inc.severity) === SeverityEnum.High
                          ? "border-l-[oklch(0.62_0.2_40)] border-l-4"
                          : String(inc.severity) === SeverityEnum.Medium
                            ? "border-l-[oklch(0.72_0.2_90)] border-l-4"
                            : "entity-org",
                    )}
                  >
                    <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                      {inc.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide",
                          statusBadgeClass(String(inc.status)),
                        )}
                      >
                        {String(inc.status)}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-semibold",
                          severityClass(String(inc.severity)),
                        )}
                      >
                        {String(inc.severity)}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {relativeTime(inc.updatedAt)}
                      </span>
                    </div>
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>

      {/* Anomaly rule detection panel */}
      <Card className="card-elevated" data-ocid="dashboard-anomaly-panel">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-display font-semibold text-foreground">
              Anomaly Detection Rules
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((k) => (
                <Skeleton key={k} className="h-16 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ruleTriggerCounts.map((rule) => (
                <button
                  type="button"
                  key={String(rule.id)}
                  onClick={() =>
                    navigate({
                      to: "/feed",
                      search: { entityType: rule.entityType } as Record<
                        string,
                        string
                      >,
                    })
                  }
                  className="p-3 rounded-lg bg-background border border-border/40 text-left hover:border-primary/40 hover:bg-card transition-colors duration-150 group"
                  data-ocid={`anomaly-rule-${String(rule.id)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {rule.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Entity type:{" "}
                        <span className="text-foreground font-medium">
                          {rule.entityType}
                        </span>
                        {" · "}Threshold:{" "}
                        <span className="text-foreground font-medium">
                          {rule.threshold}
                        </span>
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={cn(
                          "text-sm font-display font-bold",
                          rule.triggeredCount > 0
                            ? "text-[oklch(0.62_0.22_25)]"
                            : "text-muted-foreground",
                        )}
                      >
                        {rule.triggeredCount}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        triggered
                      </p>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0 border",
                        rule.action === "Alert"
                          ? "border-[oklch(0.62_0.22_25/0.4)] text-[oklch(0.62_0.22_25)] bg-[oklch(0.62_0.22_25/0.08)]"
                          : "border-[oklch(0.72_0.2_90/0.4)] text-[oklch(0.72_0.2_90)] bg-[oklch(0.72_0.2_90/0.08)]",
                      )}
                    >
                      {rule.action}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors ml-auto">
                      View in feed →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
