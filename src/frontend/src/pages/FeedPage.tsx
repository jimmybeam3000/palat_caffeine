import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Edit2,
  Layers,
  Pencil,
  Plus,
  Save,
  Search,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddTimelineEvent,
  useAnomalyRules,
  useCreateAnomalyRule,
  useCreateIncident,
  useDeleteAnomalyRule,
  useDeleteIncident,
  useEntities,
  useIncidents,
  useUpdateAnomalyRule,
  useUpdateIncident,
} from "../hooks/useBackend";
import {
  cn,
  formatTimestamp,
  relativeTime,
  severityClass,
  statusBadgeClass,
} from "../lib/utils";
import type {
  AnomalyAction,
  AnomalyRule,
  AnomalyRuleId,
  EntityId,
  EntityType,
  Incident,
  IncidentStatus,
  Severity,
} from "../types";
import {
  AnomalyActionEnum,
  EntityTypeEnum,
  IncidentStatusEnum,
  SeverityEnum,
} from "../types";

// ─── Seed data ───────────────────────────────────────────────────────────────

const SEED_INCIDENTS: Incident[] = [
  {
    id: 1n,
    title: "Anomalous data exfiltration detected on FINSERV-NET",
    description:
      "Unusual outbound traffic pattern detected on the financial services network segment. Volume 14x above baseline, targeting unknown external IPs.",
    severity: SeverityEnum.Critical,
    status: IncidentStatusEnum.Investigating,
    relatedEntityIds: [1n, 3n],
    notes: "Elevated to CIRT. Packet capture initiated.",
    timeline: [
      {
        timestamp: BigInt(Date.now() - 3_600_000) * 1_000_000n,
        eventType: "Detection",
        note: "IDS alert triggered on FINSERV-NET segment",
      },
      {
        timestamp: BigInt(Date.now() - 1_800_000) * 1_000_000n,
        eventType: "Escalation",
        note: "Escalated to CIRT team for packet analysis",
      },
    ],
    createdAt: BigInt(Date.now() - 3_600_000) * 1_000_000n,
    updatedAt: BigInt(Date.now() - 1_800_000) * 1_000_000n,
  },
  {
    id: 2n,
    title: "Suspicious login pattern — org account compromised",
    description:
      "Multiple failed logins followed by a successful one from a foreign IP not associated with the user's normal geolocation.",
    severity: SeverityEnum.High,
    status: IncidentStatusEnum.Open,
    relatedEntityIds: [4n],
    notes: "",
    timeline: [
      {
        timestamp: BigInt(Date.now() - 5_400_000) * 1_000_000n,
        eventType: "Detection",
        note: "SIEM correlation rule triggered on failed auth",
      },
    ],
    createdAt: BigInt(Date.now() - 5_400_000) * 1_000_000n,
    updatedAt: BigInt(Date.now() - 5_400_000) * 1_000_000n,
  },
  {
    id: 3n,
    title: "Asset inventory mismatch in APAC region",
    description:
      "12 assets in APAC inventory are not responding to polling. Last known state was 2 days ago.",
    severity: SeverityEnum.Medium,
    status: IncidentStatusEnum.Open,
    relatedEntityIds: [5n, 10n],
    notes: "",
    timeline: [],
    createdAt: BigInt(Date.now() - 86_400_000) * 1_000_000n,
    updatedAt: BigInt(Date.now() - 86_400_000) * 1_000_000n,
  },
  {
    id: 4n,
    title: "Routine certificate expiry — internal CA",
    description:
      "Internal certificate authority cert expires in 7 days. Renewal workflow must be initiated.",
    severity: SeverityEnum.Low,
    status: IncidentStatusEnum.Closed,
    relatedEntityIds: [],
    notes: "Renewal ticket #7291 opened.",
    timeline: [
      {
        timestamp: BigInt(Date.now() - 86_400_000 * 2) * 1_000_000n,
        eventType: "Detection",
        note: "Expiry alert from cert monitor",
      },
      {
        timestamp: BigInt(Date.now() - 86_400_000) * 1_000_000n,
        eventType: "Resolution",
        note: "Ticket raised, renewal in progress",
      },
    ],
    createdAt: BigInt(Date.now() - 86_400_000 * 2) * 1_000_000n,
    updatedAt: BigInt(Date.now() - 86_400_000) * 1_000_000n,
  },
  {
    id: 5n,
    title: "Unauthorized API access attempt — data connector",
    description:
      "REST API connector received 312 unauthorized requests from a single IP over a 4-hour window.",
    severity: SeverityEnum.High,
    status: IncidentStatusEnum.Investigating,
    relatedEntityIds: [2n, 7n],
    notes: "IP blocked at perimeter. Origin under investigation.",
    timeline: [
      {
        timestamp: BigInt(Date.now() - 7_200_000) * 1_000_000n,
        eventType: "Detection",
        note: "Rate limit triggered on API gateway",
      },
      {
        timestamp: BigInt(Date.now() - 3_000_000) * 1_000_000n,
        eventType: "Containment",
        note: "IP blocked at edge firewall",
      },
    ],
    createdAt: BigInt(Date.now() - 7_200_000) * 1_000_000n,
    updatedAt: BigInt(Date.now() - 3_000_000) * 1_000_000n,
  },
];

const SEED_ANOMALY_RULES: AnomalyRule[] = [
  {
    id: 1n,
    name: "High-volume entity activity",
    entityType: EntityTypeEnum.Person,
    threshold: 50,
    action: AnomalyActionEnum.Alert,
  },
  {
    id: 2n,
    name: "Org relationship spike",
    entityType: EntityTypeEnum.Organization,
    threshold: 30,
    action: AnomalyActionEnum.Flag,
  },
  {
    id: 3n,
    name: "Critical asset offline",
    entityType: EntityTypeEnum.Asset,
    threshold: 1,
    action: AnomalyActionEnum.Alert,
  },
];

const SEVERITY_ORDER: Record<string, number> = {
  [SeverityEnum.Critical]: 0,
  [SeverityEnum.High]: 1,
  [SeverityEnum.Medium]: 2,
  [SeverityEnum.Low]: 3,
};

const ALL_SEVERITIES = [
  SeverityEnum.Critical,
  SeverityEnum.High,
  SeverityEnum.Medium,
  SeverityEnum.Low,
] as const;

const ALL_STATUSES = [
  IncidentStatusEnum.Open,
  IncidentStatusEnum.Investigating,
  IncidentStatusEnum.Closed,
] as const;

const ENTITY_TYPES = [
  EntityTypeEnum.Person,
  EntityTypeEnum.Organization,
  EntityTypeEnum.Asset,
  EntityTypeEnum.Event,
] as const;

const EVENT_TYPES = [
  "Detection",
  "Escalation",
  "Containment",
  "Resolution",
  "Update",
  "Note",
] as const;

// ─── Severity accent stripe helper ───────────────────────────────────────────

function severityStripe(sev: string) {
  if (sev === SeverityEnum.Critical)
    return "border-l-[3px] border-l-[oklch(var(--severity-critical))]";
  if (sev === SeverityEnum.High)
    return "border-l-[3px] border-l-[oklch(var(--severity-high))]";
  if (sev === SeverityEnum.Medium)
    return "border-l-[3px] border-l-[oklch(var(--severity-medium))]";
  return "border-l-[3px] border-l-[oklch(var(--severity-low))]";
}

// ─── Severity badge (colored pill) ───────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const bg =
    severity === SeverityEnum.Critical
      ? "bg-[oklch(var(--severity-critical)/.12)] text-[oklch(var(--severity-critical))] border-[oklch(var(--severity-critical)/.3)]"
      : severity === SeverityEnum.High
        ? "bg-[oklch(var(--severity-high)/.12)] text-[oklch(var(--severity-high))] border-[oklch(var(--severity-high)/.3)]"
        : severity === SeverityEnum.Medium
          ? "bg-[oklch(var(--severity-medium)/.12)] text-[oklch(var(--severity-medium))] border-[oklch(var(--severity-medium)/.3)]"
          : "bg-[oklch(var(--severity-low)/.12)] text-[oklch(var(--severity-low))] border-[oklch(var(--severity-low)/.3)]";
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide",
        bg,
      )}
    >
      {String(severity)}
    </span>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide",
        statusBadgeClass(String(status)),
      )}
    >
      {String(status)}
    </span>
  );
}

// ─── Multiselect filter ───────────────────────────────────────────────────────

function MultiFilter<T extends string>({
  label,
  options,
  selected,
  onChange,
  ocid,
}: {
  label: string;
  options: readonly T[];
  selected: T[];
  onChange: (v: T[]) => void;
  ocid: string;
}) {
  const toggle = (v: T) =>
    selected.includes(v)
      ? onChange(selected.filter((x) => x !== v))
      : onChange([...selected, v]);
  const allSelected = selected.length === 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-border/60 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-smooth"
          data-ocid={ocid}
        >
          {label}
          {!allSelected && (
            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-2 bg-card border-border" align="start">
        <div className="space-y-1">
          {options.map((opt) => (
            <button
              type="button"
              key={opt}
              className="w-full flex items-center gap-2 px-1 py-0.5 rounded hover:bg-muted/40 cursor-pointer text-left"
              onClick={() => toggle(opt)}
            >
              <Checkbox
                checked={selected.includes(opt)}
                onCheckedChange={() => toggle(opt)}
                className="h-3 w-3 pointer-events-none"
                id={`filter-${String(opt)}`}
              />
              <span className="text-xs text-foreground capitalize">
                {String(opt).toLowerCase()}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Incident detail panel ────────────────────────────────────────────────────

function IncidentDetail({
  incident,
  entities,
  onBack,
}: {
  incident: Incident;
  entities: { id: bigint; name: string }[];
  onBack?: () => void;
}) {
  const updateMutation = useUpdateIncident();
  const addEventMutation = useAddTimelineEvent();
  const deleteMutation = useDeleteIncident();
  const navigate = useNavigate();

  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes] = useState(incident.notes);
  const [newEventNote, setNewEventNote] = useState("");
  const [newEventType, setNewEventType] = useState<string>(EVENT_TYPES[0]);

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    try {
      await updateMutation.mutateAsync({
        id: incident.id,
        title: incident.title,
        description: incident.description,
        severity: incident.severity as Severity,
        status: newStatus,
        notes: incident.notes,
      });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSeverityChange = async (newSev: Severity) => {
    try {
      await updateMutation.mutateAsync({
        id: incident.id,
        title: incident.title,
        description: incident.description,
        severity: newSev,
        status: incident.status as IncidentStatus,
        notes: incident.notes,
      });
      toast.success("Severity updated");
    } catch {
      toast.error("Failed to update severity");
    }
  };

  const handleSaveNotes = async () => {
    try {
      await updateMutation.mutateAsync({
        id: incident.id,
        title: incident.title,
        description: incident.description,
        severity: incident.severity as Severity,
        status: incident.status as IncidentStatus,
        notes,
      });
      toast.success("Notes saved");
      setEditNotes(false);
    } catch {
      toast.error("Failed to save notes");
    }
  };

  const handleAddEvent = async () => {
    if (!newEventNote.trim()) return;
    try {
      await addEventMutation.mutateAsync({
        id: incident.id,
        eventType: newEventType,
        note: newEventNote.trim(),
      });
      toast.success("Event added");
      setNewEventNote("");
    } catch {
      toast.error("Failed to add event");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(incident.id);
      toast.success("Incident deleted");
      if (onBack) onBack();
    } catch {
      toast.error("Failed to delete incident");
    }
  };

  const relatedEntities = entities.filter((e) =>
    incident.relatedEntityIds.some((rid) => rid === e.id),
  );

  const sortedTimeline = [...incident.timeline].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  return (
    <div className="flex flex-col h-full">
      {/* Detail header */}
      <div className="px-4 pt-4 pb-3 border-b border-border/40 bg-card">
        <div className="flex items-start gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mt-0.5 p-1 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-smooth shrink-0"
              aria-label="Back to incident list"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-display font-semibold text-foreground leading-snug">
              {incident.title}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] text-muted-foreground">
                Created {formatTimestamp(incident.createdAt)}
              </span>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="text-[10px] text-muted-foreground">
                Updated {relativeTime(incident.updatedAt)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-smooth shrink-0"
            aria-label="Delete incident"
            data-ocid="feed-delete-incident-btn"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Inline status + severity editors */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Status</p>
            <div className="flex gap-1">
              {ALL_STATUSES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-medium transition-smooth border",
                    incident.status === s
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/30",
                  )}
                  data-ocid={`feed-status-${String(s).toLowerCase()}`}
                >
                  {String(s)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Severity</p>
            <div className="flex gap-1">
              {ALL_SEVERITIES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => handleSeverityChange(s)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-medium transition-smooth border",
                    incident.severity === s
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/30",
                  )}
                  data-ocid={`feed-severity-${String(s).toLowerCase()}`}
                >
                  {String(s)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="details" className="flex flex-col h-full">
          <TabsList className="w-full rounded-none border-b border-border/40 bg-card h-9 shrink-0 justify-start gap-0 px-3">
            <TabsTrigger
              value="details"
              className="text-xs h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="text-xs h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Timeline ({incident.timeline.length})
            </TabsTrigger>
          </TabsList>

          {/* Details tab */}
          <TabsContent
            value="details"
            className="flex-1 overflow-y-auto p-4 space-y-4 mt-0"
            data-ocid="feed-incident-detail"
          >
            {/* Description */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                Description
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {incident.description}
              </p>
            </div>

            {/* Related entities */}
            {relatedEntities.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                  Related Entities ({relatedEntities.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {relatedEntities.map((e) => (
                    <button
                      type="button"
                      key={String(e.id)}
                      onClick={() => navigate({ to: "/investigation" })}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-primary/30 bg-primary/5 text-xs text-primary hover:bg-primary/10 transition-smooth"
                      data-ocid={`feed-entity-chip-${e.id}`}
                    >
                      <Layers className="h-3 w-3" />
                      {e.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {incident.relatedEntityIds.length > 0 &&
              relatedEntities.length === 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                    Related Entities
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {incident.relatedEntityIds.map((eid) => (
                      <button
                        type="button"
                        key={String(eid)}
                        onClick={() => navigate({ to: "/investigation" })}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-primary/30 bg-primary/5 text-xs text-primary hover:bg-primary/10 transition-smooth"
                        data-ocid={`feed-entity-chip-${eid}`}
                      >
                        <Layers className="h-3 w-3" />
                        Entity #{String(eid)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Notes */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Notes
                </p>
                {!editNotes ? (
                  <button
                    type="button"
                    onClick={() => {
                      setNotes(incident.notes);
                      setEditNotes(true);
                    }}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-smooth"
                    data-ocid="feed-notes-edit-btn"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditNotes(false)}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-smooth"
                    >
                      <X className="h-3 w-3" />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-smooth"
                      data-ocid="feed-notes-save-btn"
                    >
                      <Save className="h-3 w-3" />
                      Save
                    </button>
                  </div>
                )}
              </div>
              {editNotes ? (
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this incident..."
                  className="resize-none text-xs bg-background border-border h-24"
                  data-ocid="feed-notes-textarea"
                />
              ) : (
                <div className="bg-muted/20 border border-border/30 rounded-lg p-3 min-h-[3rem]">
                  {notes ? (
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {notes}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No notes yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Timeline tab */}
          <TabsContent
            value="timeline"
            className="flex-1 overflow-y-auto p-4 space-y-4 mt-0"
            data-ocid="feed-timeline-tab"
          >
            {/* Add event form */}
            <div className="bg-muted/20 border border-border/30 rounded-lg p-3 space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Add Event
              </p>
              <div className="flex gap-2 flex-wrap">
                {EVENT_TYPES.map((et) => (
                  <button
                    type="button"
                    key={et}
                    onClick={() => setNewEventType(et)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-medium transition-smooth border",
                      newEventType === et
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "border-border/40 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {et}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newEventNote}
                  onChange={(e) => setNewEventNote(e.target.value)}
                  placeholder="Describe what happened..."
                  className="flex-1 text-xs bg-background border-border h-8"
                  data-ocid="feed-timeline-note-input"
                  onKeyDown={(e) => e.key === "Enter" && handleAddEvent()}
                />
                <Button
                  size="sm"
                  onClick={handleAddEvent}
                  disabled={!newEventNote.trim() || addEventMutation.isPending}
                  data-ocid="feed-add-event-btn"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Timeline events */}
            {sortedTimeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Clock className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No timeline events yet
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  Add the first event above
                </p>
              </div>
            ) : (
              <div className="relative space-y-0">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border/40" />
                {sortedTimeline.map((ev) => {
                  const evKey = `${String(ev.timestamp)}-${ev.eventType}`;
                  return (
                    <div key={evKey} className="flex items-start gap-3 pb-4">
                      <div className="mt-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-card shrink-0 z-10" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">
                            {ev.eventType}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatTimestamp(ev.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-foreground mt-0.5 leading-relaxed">
                          {ev.note}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Anomaly Rules Panel ──────────────────────────────────────────────────────

function AnomalyRulesPanel({ seedRules }: { seedRules: AnomalyRule[] }) {
  const { data: backendRules } = useAnomalyRules();
  const createRule = useCreateAnomalyRule();
  const updateRule = useUpdateAnomalyRule();
  const deleteRule = useDeleteAnomalyRule();

  const rules =
    backendRules && backendRules.length > 0 ? backendRules : seedRules;

  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AnomalyRule | null>(null);
  const [ruleName, setRuleName] = useState("");
  const [ruleEntityType, setRuleEntityType] = useState<EntityType>(
    EntityTypeEnum.Person,
  );
  const [ruleThreshold, setRuleThreshold] = useState("10");
  const [ruleAction, setRuleAction] = useState<AnomalyAction>(
    AnomalyActionEnum.Flag,
  );

  const openCreate = () => {
    setEditTarget(null);
    setRuleName("");
    setRuleEntityType(EntityTypeEnum.Person);
    setRuleThreshold("10");
    setRuleAction(AnomalyActionEnum.Flag);
    setDialogOpen(true);
  };

  const openEdit = (rule: AnomalyRule) => {
    setEditTarget(rule);
    setRuleName(rule.name);
    setRuleEntityType(rule.entityType as EntityType);
    setRuleThreshold(String(rule.threshold));
    setRuleAction(rule.action as AnomalyAction);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const threshold = Number.parseInt(ruleThreshold, 10);
    if (!ruleName.trim() || Number.isNaN(threshold)) return;
    try {
      if (editTarget) {
        await updateRule.mutateAsync({
          id: editTarget.id as AnomalyRuleId,
          name: ruleName.trim(),
          entityType: ruleEntityType,
          threshold,
          action: ruleAction,
        });
        toast.success("Rule updated");
      } else {
        await createRule.mutateAsync({
          name: ruleName.trim(),
          entityType: ruleEntityType,
          threshold,
          action: ruleAction,
        });
        toast.success("Rule created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save rule");
    }
  };

  const handleDelete = async (id: AnomalyRuleId) => {
    try {
      await deleteRule.mutateAsync(id);
      toast.success("Rule deleted");
    } catch {
      toast.error("Failed to delete rule");
    }
  };

  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen}>
        <Card className="card-elevated">
          <CollapsibleTrigger asChild>
            <CardHeader
              className="py-3 px-4 cursor-pointer select-none hover:bg-muted/20 transition-smooth"
              data-ocid="feed-anomaly-rules-toggle"
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Anomaly Rules ({rules.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 bg-primary/10 text-primary border-primary/20"
                  >
                    {rules.length} Active
                  </Badge>
                  {open ? (
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent
              className="px-4 pb-4 space-y-2"
              data-ocid="feed-anomaly-rules-list"
            >
              {rules.map((rule) => (
                <div
                  key={String(rule.id)}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-background border border-border/40 hover:border-primary/20 transition-smooth"
                  data-ocid={`feed-rule-row-${rule.id}`}
                >
                  <Bell className="h-3.5 w-3.5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {rule.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {String(rule.entityType)} · threshold {rule.threshold} ·{" "}
                      <span className="text-primary">
                        {String(rule.action)}
                      </span>
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] border-[oklch(var(--severity-low)/.3)] text-[oklch(var(--severity-low))] shrink-0"
                  >
                    Active
                  </Badge>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(rule)}
                      className="p-1 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-smooth"
                      aria-label="Edit rule"
                      data-ocid={`feed-rule-edit-${rule.id}`}
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rule.id as AnomalyRuleId)}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-smooth"
                      aria-label="Delete rule"
                      data-ocid={`feed-rule-delete-${rule.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1.5 text-xs"
                onClick={openCreate}
                data-ocid="feed-add-rule-btn"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Rule
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Rule dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-sm">
              {editTarget ? "Edit Anomaly Rule" : "New Anomaly Rule"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div>
              <Label className="text-xs">Rule Name</Label>
              <Input
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="e.g. High-volume entity activity"
                className="mt-1 bg-background border-border text-xs h-8"
                data-ocid="feed-rule-name-input"
              />
            </div>
            <div>
              <Label className="text-xs">Entity Type</Label>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {ENTITY_TYPES.map((et) => (
                  <button
                    type="button"
                    key={et}
                    onClick={() => setRuleEntityType(et)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-medium transition-smooth border",
                      ruleEntityType === et
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {String(et)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Threshold</Label>
              <Input
                type="number"
                value={ruleThreshold}
                onChange={(e) => setRuleThreshold(e.target.value)}
                placeholder="10"
                className="mt-1 bg-background border-border text-xs h-8 w-24"
                data-ocid="feed-rule-threshold-input"
              />
            </div>
            <div>
              <Label className="text-xs">Action</Label>
              <div className="flex gap-1.5 mt-1">
                {[AnomalyActionEnum.Flag, AnomalyActionEnum.Alert].map((a) => (
                  <button
                    type="button"
                    key={a}
                    onClick={() => setRuleAction(a)}
                    className={cn(
                      "px-3 py-1 rounded text-xs font-medium transition-smooth border",
                      ruleAction === a
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {String(a)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={
                  !ruleName.trim() ||
                  createRule.isPending ||
                  updateRule.isPending
                }
                data-ocid="feed-rule-save-btn"
              >
                {editTarget ? "Save Changes" : "Create Rule"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Create Incident Dialog ───────────────────────────────────────────────────

function CreateIncidentDialog({
  open,
  onOpenChange,
  entities,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  entities: { id: bigint; name: string }[];
}) {
  const createMutation = useCreateIncident();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [severity, setSeverity] = useState<string>(SeverityEnum.Medium);
  const [selectedEntityIds, setSelectedEntityIds] = useState<bigint[]>([]);

  const toggleEntity = (id: bigint) =>
    setSelectedEntityIds((prev) =>
      prev.some((e) => e === id) ? prev.filter((e) => e !== id) : [...prev, id],
    );

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: desc.trim(),
        severity: severity as SeverityEnum,
        relatedEntityIds: selectedEntityIds as EntityId[],
      });
      toast.success("Incident created");
      onOpenChange(false);
      setTitle("");
      setDesc("");
      setSeverity(SeverityEnum.Medium);
      setSelectedEntityIds([]);
    } catch {
      toast.error("Failed to create incident");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-sm">
            Create Incident
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-xs">Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief incident title..."
              className="mt-1.5 bg-background border-border text-sm"
              data-ocid="feed-create-title"
            />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What was observed? Scope, impact, initial findings..."
              className="mt-1.5 bg-background border-border text-xs resize-none h-20"
              data-ocid="feed-create-desc"
            />
          </div>
          <div>
            <Label className="text-xs">Severity *</Label>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {ALL_SEVERITIES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-medium transition-smooth border",
                    severity === s
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                  data-ocid={`feed-create-severity-${String(s).toLowerCase()}`}
                >
                  {String(s)}
                </button>
              ))}
            </div>
          </div>
          {entities.length > 0 && (
            <div>
              <Label className="text-xs">Related Entities</Label>
              <div className="mt-1.5 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {entities.map((e) => {
                  const selected = selectedEntityIds.some((id) => id === e.id);
                  return (
                    <button
                      type="button"
                      key={String(e.id)}
                      onClick={() => toggleEntity(e.id)}
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs transition-smooth border",
                        selected
                          ? "bg-primary/10 border-primary/40 text-primary"
                          : "border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/20",
                      )}
                      data-ocid={`feed-create-entity-${e.id}`}
                    >
                      {e.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={!title.trim() || createMutation.isPending}
              data-ocid="feed-create-submit"
            >
              Create Incident
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FeedPage() {
  const { data: incidents, isLoading } = useIncidents();
  const { data: entitiesData } = useEntities();

  const displayIncidents =
    incidents && incidents.length > 0 ? incidents : SEED_INCIDENTS;
  const entities = (entitiesData ?? []).map((e) => ({
    id: e.id,
    name: e.name,
  }));

  const [selectedId, setSelectedId] = useState<bigint | null>(
    displayIncidents[0]?.id ?? null,
  );
  const [severityFilters, setSeverityFilters] = useState<
    (typeof ALL_SEVERITIES)[number][]
  >([]);
  const [statusFilters, setStatusFilters] = useState<
    (typeof ALL_STATUSES)[number][]
  >([]);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  // Mobile: show detail vs list
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const filtered = displayIncidents
    .filter(
      (i) =>
        severityFilters.length === 0 ||
        severityFilters.includes(i.severity as (typeof ALL_SEVERITIES)[number]),
    )
    .filter(
      (i) =>
        statusFilters.length === 0 ||
        statusFilters.includes(i.status as (typeof ALL_STATUSES)[number]),
    )
    .filter((i) => i.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  const selectedInc = displayIncidents.find((i) => i.id === selectedId) ?? null;

  const handleSelectIncident = (inc: Incident) => {
    setSelectedId(inc.id);
    setMobileView("detail");
  };

  const handleBack = () => {
    setMobileView("list");
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Operational Feed
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Live incident tracking and anomaly monitoring
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setCreateOpen(true)}
          data-ocid="feed-new-incident-btn"
        >
          <Plus className="h-4 w-4" />
          New Incident
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incidents..."
            className="pl-8 text-xs bg-card border-border h-8 w-52"
            data-ocid="feed-search"
          />
        </div>
        <MultiFilter
          label="Severity"
          options={ALL_SEVERITIES}
          selected={severityFilters}
          onChange={setSeverityFilters}
          ocid="feed-filter-severity"
        />
        <MultiFilter
          label="Status"
          options={ALL_STATUSES}
          selected={statusFilters}
          onChange={setStatusFilters}
          ocid="feed-filter-status"
        />
        {(severityFilters.length > 0 || statusFilters.length > 0) && (
          <button
            type="button"
            onClick={() => {
              setSeverityFilters([]);
              setStatusFilters([]);
            }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-smooth"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} of {displayIncidents.length} incidents
        </span>
      </div>

      {/* Main two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* ─── Incident list (hidden on mobile when detail is shown) ─── */}
        <Card
          className={cn(
            "card-elevated lg:col-span-2 flex flex-col",
            mobileView === "detail" ? "hidden lg:flex" : "flex",
          )}
        >
          <CardHeader className="py-3 px-4 shrink-0">
            <CardTitle className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              {filtered.length} Incidents
            </CardTitle>
          </CardHeader>
          <CardContent
            className="px-3 pb-4 space-y-1.5 flex-1 overflow-y-auto"
            data-ocid="feed-incident-list"
          >
            {isLoading ? (
              ["s1", "s2", "s3", "s4"].map((k) => (
                <Skeleton key={k} className="h-16 rounded" />
              ))
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No incidents match filters
                </p>
              </div>
            ) : (
              filtered.map((inc) => (
                <button
                  type="button"
                  key={String(inc.id)}
                  onClick={() => handleSelectIncident(inc)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg cursor-pointer transition-smooth",
                    severityStripe(inc.severity),
                    selectedInc?.id === inc.id
                      ? "bg-primary/8 border border-primary/25"
                      : "bg-background border border-border/30 hover:border-primary/15 hover:bg-muted/20",
                  )}
                  data-ocid={`feed-incident-row-${inc.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug flex-1">
                      {inc.title}
                    </p>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 mt-0.5 lg:hidden" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <SeverityBadge severity={inc.severity} />
                    <StatusBadge status={inc.status} />
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {relativeTime(inc.updatedAt)}
                    </span>
                  </div>
                  {inc.relatedEntityIds.length > 0 && (
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {inc.relatedEntityIds.length} related{" "}
                      {inc.relatedEntityIds.length === 1
                        ? "entity"
                        : "entities"}
                    </p>
                  )}
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* ─── Detail panel ─── */}
        <Card
          className={cn(
            "card-elevated lg:col-span-3 flex flex-col min-h-[500px]",
            mobileView === "list" ? "hidden lg:flex" : "flex",
          )}
        >
          {!selectedInc ? (
            <CardContent className="flex flex-col items-center justify-center h-full py-20 text-center">
              <Activity className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                Select an incident
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Click any incident in the list to view details
              </p>
            </CardContent>
          ) : (
            <IncidentDetail
              incident={selectedInc}
              entities={entities}
              onBack={handleBack}
            />
          )}
        </Card>
      </div>

      {/* Anomaly Rules collapsible panel */}
      <AnomalyRulesPanel seedRules={SEED_ANOMALY_RULES} />

      {/* Create incident dialog */}
      <CreateIncidentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        entities={entities}
      />
    </div>
  );
}
