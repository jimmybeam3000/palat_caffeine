import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Database,
  FolderOpen,
  Link2,
  Plus,
  Save,
  Search,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateInvestigation,
  useDeleteInvestigation,
  useEntities,
  useIncidents,
  useInvestigations,
} from "../hooks/useBackend";
import {
  cn,
  entityTypeClass,
  formatTimestamp,
  relativeTime,
  severityClass,
  statusBadgeClass,
} from "../lib/utils";
import type { Entity, Investigation } from "../types";
import { EntityTypeEnum, SeverityEnum } from "../types";

// ─── Seed data ───────────────────────────────────────────────────────────────

const SEED_INVESTIGATIONS: Investigation[] = [
  {
    id: 1n,
    name: "Operation Nexus Breach",
    entityIds: [1n, 2n, 3n, 7n],
    createdAt: BigInt(Date.now() - 86_400_000 * 3) * 1_000_000n,
  },
  {
    id: 2n,
    name: "APAC Shell Network",
    entityIds: [4n, 6n, 8n, 9n],
    createdAt: BigInt(Date.now() - 86_400_000 * 7) * 1_000_000n,
  },
  {
    id: 3n,
    name: "Sokolov Associates",
    entityIds: [9n, 6n],
    createdAt: BigInt(Date.now() - 86_400_000 * 14) * 1_000_000n,
  },
];

const SEED_ENTITIES: Entity[] = [
  {
    id: 1n,
    name: "Viktor Sokolov",
    entityType: EntityTypeEnum.Person,
    lastUpdated: BigInt(Date.now() - 86_400_000 * 2) * 1_000_000n,
    attributes: [
      { key: "Nationality", value: "Russian" },
      { key: "DOB", value: "1971-03-14" },
      { key: "Last Location", value: "Geneva, Switzerland" },
      { key: "Risk Score", value: "87" },
    ],
    relationships: [
      { targetId: 4n, relationshipType: "Controls" },
      { targetId: 9n, relationshipType: "Associate" },
      { targetId: 2n, relationshipType: "Owner" },
    ],
    sourceId: 1n,
  },
  {
    id: 2n,
    name: "Nexus Holdings Ltd",
    entityType: EntityTypeEnum.Organization,
    lastUpdated: BigInt(Date.now() - 86_400_000 * 5) * 1_000_000n,
    attributes: [
      { key: "Jurisdiction", value: "British Virgin Islands" },
      { key: "Registered", value: "2019-08-01" },
      { key: "Director", value: "John L. Smith (nominee)" },
    ],
    relationships: [
      { targetId: 1n, relationshipType: "Owned By" },
      { targetId: 3n, relationshipType: "Subsidiary" },
    ],
    sourceId: 1n,
  },
  {
    id: 3n,
    name: "Meridian Asset Trust",
    entityType: EntityTypeEnum.Asset,
    lastUpdated: BigInt(Date.now() - 86_400_000 * 1) * 1_000_000n,
    attributes: [
      { key: "Type", value: "Real Estate Portfolio" },
      { key: "Value", value: "$12.4M" },
      { key: "Location", value: "Cyprus, Malta" },
    ],
    relationships: [
      { targetId: 2n, relationshipType: "Held By" },
      { targetId: 7n, relationshipType: "Linked Event" },
    ],
    sourceId: 2n,
  },
  {
    id: 4n,
    name: "Pacific Rim LLC",
    entityType: EntityTypeEnum.Organization,
    lastUpdated: BigInt(Date.now() - 86_400_000 * 10) * 1_000_000n,
    attributes: [
      { key: "Jurisdiction", value: "Cayman Islands" },
      { key: "Sector", value: "Financial Services" },
    ],
    relationships: [
      { targetId: 1n, relationshipType: "Controlled By" },
      { targetId: 6n, relationshipType: "Partner" },
    ],
  },
  {
    id: 5n,
    name: "Anna Petrov",
    entityType: EntityTypeEnum.Person,
    lastUpdated: BigInt(Date.now() - 86_400_000 * 3) * 1_000_000n,
    attributes: [
      { key: "Nationality", value: "Ukrainian" },
      { key: "Role", value: "Financial Analyst" },
    ],
    relationships: [{ targetId: 9n, relationshipType: "Colleague" }],
    sourceId: 3n,
  },
  {
    id: 6n,
    name: "Zheng Wei Corp",
    entityType: EntityTypeEnum.Organization,
    lastUpdated: BigInt(Date.now() - 86_400_000 * 4) * 1_000_000n,
    attributes: [
      { key: "Jurisdiction", value: "Hong Kong SAR" },
      { key: "Listed", value: "No" },
    ],
    relationships: [
      { targetId: 4n, relationshipType: "Partner" },
      { targetId: 9n, relationshipType: "Client" },
    ],
  },
  {
    id: 7n,
    name: "Geneva Wire Transfer",
    entityType: EntityTypeEnum.Event,
    lastUpdated: BigInt(Date.now() - 86_400_000 * 6) * 1_000_000n,
    attributes: [
      { key: "Amount", value: "$3.2M" },
      { key: "Date", value: "2024-11-18" },
      { key: "Flags", value: "Structuring, High-risk jurisdiction" },
    ],
    relationships: [
      { targetId: 1n, relationshipType: "Initiated By" },
      { targetId: 3n, relationshipType: "Beneficiary" },
    ],
    sourceId: 2n,
  },
  {
    id: 8n,
    name: "Shell Account #4471",
    entityType: EntityTypeEnum.Asset,
    lastUpdated: BigInt(Date.now() - 86_400_000 * 8) * 1_000_000n,
    attributes: [
      { key: "Bank", value: "Eurobank Cyprus" },
      { key: "Balance", value: "$890K" },
    ],
    relationships: [{ targetId: 6n, relationshipType: "Operated By" }],
    sourceId: 1n,
  },
  {
    id: 9n,
    name: "Ibrahim Al-Rashid",
    entityType: EntityTypeEnum.Person,
    lastUpdated: BigInt(Date.now() - 86_400_000 * 1) * 1_000_000n,
    attributes: [
      { key: "Nationality", value: "Emirati" },
      { key: "Occupation", value: "Investment Manager" },
      { key: "Risk Score", value: "62" },
    ],
    relationships: [
      { targetId: 1n, relationshipType: "Associate" },
      { targetId: 5n, relationshipType: "Colleague" },
      { targetId: 6n, relationshipType: "Client" },
    ],
    sourceId: 3n,
  },
];

const SOURCE_NAMES: Record<string, string> = {
  "1": "Sentinel REST API",
  "2": "SWIFT JSON Feed",
  "3": "OSINT CSV Export",
};

const SEVERITY_ORDER = [
  SeverityEnum.Critical,
  SeverityEnum.High,
  SeverityEnum.Medium,
  SeverityEnum.Low,
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  [EntityTypeEnum.Person]: "oklch(0.62 0.15 265)",
  [EntityTypeEnum.Organization]: "oklch(0.65 0.18 310)",
  [EntityTypeEnum.Asset]: "oklch(0.7 0.2 50)",
  [EntityTypeEnum.Event]: "oklch(0.62 0.22 25)",
};

const TYPE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  [EntityTypeEnum.Person]: User,
  [EntityTypeEnum.Organization]: Shield,
  [EntityTypeEnum.Asset]: Database,
  [EntityTypeEnum.Event]: BookOpen,
};

function TypeIcon({ type, className }: { type: string; className?: string }) {
  const Icon = TYPE_ICONS[type] ?? User;
  return <Icon className={className} />;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function EntityListItem({
  entity,
  selected,
  onClick,
}: {
  entity: Entity;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth border border-transparent cursor-pointer",
        selected ? "bg-primary/10 border-primary/30" : "hover:bg-muted/40",
        entityTypeClass(entity.entityType),
      )}
      data-ocid={`entity-row-${entity.id}`}
    >
      <span
        className="h-6 w-6 rounded flex items-center justify-center shrink-0"
        style={{ background: `${TYPE_COLORS[entity.entityType]}20` }}
      >
        <TypeIcon
          type={entity.entityType}
          className="h-3.5 w-3.5"
          // @ts-expect-error color via style
          style={{ color: TYPE_COLORS[entity.entityType] }}
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">
          {entity.name}
        </p>
        <p className="text-xs text-muted-foreground">{entity.entityType}</p>
      </div>
    </button>
  );
}

interface EntityDetailProps {
  entity: Entity;
  allEntities: Entity[];
  onNavigate: (entity: Entity) => void;
  onBack: () => void;
}

function EntityDetail({
  entity,
  allEntities,
  onNavigate,
  onBack,
}: EntityDetailProps) {
  const { data: incidents } = useIncidents();
  const displayIncidents = incidents ?? [];

  const relatedIncidents = displayIncidents.filter((inc) =>
    inc.relatedEntityIds.includes(entity.id),
  );

  const sourceName = entity.sourceId
    ? (SOURCE_NAMES[entity.sourceId.toString()] ?? `Source #${entity.sourceId}`)
    : "Manual Entry";

  const connected = entity.relationships
    .map((r) => ({
      rel: r,
      target: allEntities.find((e) => e.id === r.targetId),
    }))
    .filter((c) => c.target !== undefined) as Array<{
    rel: (typeof entity.relationships)[0];
    target: Entity;
  }>;

  return (
    <div className="flex flex-col h-full">
      {/* Detail header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-7 w-7 p-0 shrink-0"
          aria-label="Back to entity list"
          data-ocid="entity-detail-back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span
            className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${TYPE_COLORS[entity.entityType]}20` }}
          >
            <TypeIcon
              type={entity.entityType}
              className="h-4 w-4"
              // @ts-expect-error color via style
              style={{ color: TYPE_COLORS[entity.entityType] }}
            />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold font-display text-foreground truncate">
              {entity.name}
            </p>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 h-4 mt-0.5"
              style={{
                borderColor: `${TYPE_COLORS[entity.entityType]}50`,
                color: TYPE_COLORS[entity.entityType],
              }}
            >
              {entity.entityType}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="attributes"
        className="flex flex-col flex-1 overflow-hidden"
      >
        <TabsList className="mx-4 mt-3 mb-0 grid grid-cols-3 h-8 bg-muted/40">
          <TabsTrigger value="attributes" className="text-xs">
            Attributes
          </TabsTrigger>
          <TabsTrigger value="connections" className="text-xs">
            Connections
            {connected.length > 0 && (
              <span className="ml-1 text-[10px] bg-primary/20 text-primary rounded px-1">
                {connected.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="provenance" className="text-xs">
            Provenance
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Attributes Tab */}
          <TabsContent value="attributes" className="p-4 mt-0 space-y-4">
            {/* Key/value table */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Attributes
              </p>
              {entity.attributes.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No attributes recorded
                </p>
              ) : (
                <div className="border border-border/50 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <tbody>
                      {entity.attributes.map((attr, i) => (
                        <tr
                          key={`${attr.key}-${i}`}
                          className={cn(
                            "border-b border-border/30 last:border-0",
                            i % 2 === 0 ? "bg-background" : "bg-muted/20",
                          )}
                        >
                          <td className="px-3 py-2 font-medium text-muted-foreground w-2/5 break-words">
                            {attr.key}
                          </td>
                          <td className="px-3 py-2 text-foreground break-words">
                            {attr.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Associated incidents */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Associated Incidents ({relatedIncidents.length})
              </p>
              {relatedIncidents.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No incidents linked
                </p>
              ) : (
                <div className="space-y-1.5">
                  {relatedIncidents
                    .sort(
                      (a, b) =>
                        SEVERITY_ORDER.indexOf(a.severity as SeverityEnum) -
                        SEVERITY_ORDER.indexOf(b.severity as SeverityEnum),
                    )
                    .map((inc) => (
                      <div
                        key={String(inc.id)}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-background border border-border/40"
                        data-ocid={`incident-row-${inc.id}`}
                      >
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5",
                            severityClass(inc.severity),
                            "bg-current/10",
                          )}
                          style={{
                            background: "currentColor",
                            WebkitTextFillColor: "unset",
                          }}
                        >
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-1.5 h-4 border-0",
                              severityClass(inc.severity),
                            )}
                          >
                            {inc.severity}
                          </Badge>
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {inc.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {relativeTime(inc.createdAt)} ·{" "}
                            <span
                              className={cn(
                                "text-[10px]",
                                statusBadgeClass(inc.status),
                                "px-1 py-0.5 rounded",
                              )}
                            >
                              {inc.status}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Last updated */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                Last Updated
              </p>
              <p className="text-xs text-foreground">
                {formatTimestamp(entity.lastUpdated)}
              </p>
            </div>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="p-4 mt-0">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Relationships ({connected.length})
            </p>
            {connected.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <Link2 className="h-8 w-8 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  No connections mapped
                </p>
              </div>
            ) : (
              <div className="space-y-2" data-ocid="connections-list">
                {connected.map(({ rel, target }) => (
                  <button
                    key={`${rel.targetId}-${rel.relationshipType}`}
                    type="button"
                    onClick={() => onNavigate(target)}
                    className={cn(
                      "w-full text-left flex items-center gap-3 p-3 rounded-lg bg-background border border-border/40 transition-smooth hover:border-primary/50 hover:bg-muted/20 cursor-pointer",
                      entityTypeClass(target.entityType),
                    )}
                    data-ocid={`connection-${target.id}`}
                  >
                    <span
                      className="h-7 w-7 rounded flex items-center justify-center shrink-0"
                      style={{
                        background: `${TYPE_COLORS[target.entityType]}20`,
                      }}
                    >
                      <TypeIcon
                        type={target.entityType}
                        className="h-3.5 w-3.5"
                        // @ts-expect-error color via style
                        style={{ color: TYPE_COLORS[target.entityType] }}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">
                        {target.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {target.entityType}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 h-5 shrink-0 border-border/60 text-muted-foreground"
                    >
                      {rel.relationshipType}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Provenance Tab */}
          <TabsContent value="provenance" className="p-4 mt-0 space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                Data Provenance
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/40">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs font-medium text-foreground">
                      Data Source
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{sourceName}</p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/40">
                  <p className="text-xs font-medium text-foreground">
                    Last Synced
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(entity.lastUpdated)}
                  </p>
                </div>
                {entity.sourceId ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/40">
                    <p className="text-xs font-medium text-foreground">
                      Source ID
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      src-{entity.sourceId.toString().padStart(4, "0")}
                    </p>
                  </div>
                ) : null}
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground">
                    {entity.sourceId
                      ? "Entity was ingested automatically via the integration pipeline. Attribute values reflect the last successful sync."
                      : "Entity was created manually. No automated sync history available."}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function InvestigationPage() {
  const { data: investigations, isLoading: invLoading } = useInvestigations();
  const { data: entities, isLoading: entLoading } = useEntities();

  const createMutation = useCreateInvestigation();
  const deleteMutation = useDeleteInvestigation();

  const displayInvestigations =
    investigations && investigations.length > 0
      ? investigations
      : SEED_INVESTIGATIONS;
  const displayEntities =
    entities && entities.length > 0 ? entities : SEED_ENTITIES;

  // Entity browser state
  const [entitySearch, setEntitySearch] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [navStack, setNavStack] = useState<Entity[]>([]);

  // Investigation state
  const [activeInv, setActiveInv] = useState<Investigation | null>(null);
  const [invDropdownOpen, setInvDropdownOpen] = useState(false);

  // Save dialog
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveEntityIds, setSaveEntityIds] = useState<Set<bigint>>(new Set());

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Investigation | null>(null);

  // Mobile view toggle
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const filteredEntities = displayEntities.filter(
    (e) =>
      e.name.toLowerCase().includes(entitySearch.toLowerCase()) ||
      e.entityType.toLowerCase().includes(entitySearch.toLowerCase()),
  );

  function navigateTo(entity: Entity) {
    if (selectedEntity) setNavStack((s) => [...s, selectedEntity]);
    setSelectedEntity(entity);
    setMobileView("detail");
  }

  function handleBack() {
    if (navStack.length > 0) {
      const prev = navStack[navStack.length - 1];
      setNavStack((s) => s.slice(0, -1));
      setSelectedEntity(prev);
    } else {
      setSelectedEntity(null);
      setMobileView("list");
    }
  }

  function selectEntityFromList(entity: Entity) {
    setNavStack([]);
    setSelectedEntity(entity);
    setMobileView("detail");
  }

  function loadInvestigation(inv: Investigation) {
    setActiveInv(inv);
    setInvDropdownOpen(false);
    // Select the first entity in the investigation if available
    const first = displayEntities.find((e) => inv.entityIds.includes(e.id));
    if (first) {
      setNavStack([]);
      setSelectedEntity(first);
      setMobileView("detail");
    }
    toast.success(`Loaded: ${inv.name}`);
  }

  function openSaveDialog() {
    setSaveName(activeInv?.name ?? "");
    setSaveEntityIds(new Set(selectedEntity ? [selectedEntity.id] : []));
    setSaveDialogOpen(true);
  }

  async function handleSave() {
    if (!saveName.trim()) return;
    try {
      await createMutation.mutateAsync({
        name: saveName.trim(),
        entityIds: Array.from(saveEntityIds),
      });
      toast.success("Investigation saved");
      setSaveDialogOpen(false);
    } catch {
      toast.error("Failed to save investigation");
    }
  }

  async function handleDelete(inv: Investigation) {
    try {
      await deleteMutation.mutateAsync(inv.id);
      toast.success("Investigation deleted");
      if (activeInv?.id === inv.id) setActiveInv(null);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete");
    }
  }

  const isLoading = invLoading || entLoading;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 md:px-6 py-3 border-b border-border bg-card shrink-0 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-display font-semibold text-foreground">
            Investigation Tools
          </h1>
          {activeInv && (
            <p className="text-xs text-primary truncate">
              Active: {activeInv.name}
            </p>
          )}
        </div>

        {/* Investigation toolbar actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Load dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={() => setInvDropdownOpen((v) => !v)}
              data-ocid="investigation-load-btn"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Load</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
            {invDropdownOpen && (
              <div className="absolute right-0 top-9 z-50 w-64 bg-popover border border-border rounded-lg shadow-lg py-1 overflow-hidden">
                {isLoading ? (
                  <div className="px-3 py-2">
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : displayInvestigations.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-3 py-2">
                    No saved investigations
                  </p>
                ) : (
                  displayInvestigations.map((inv) => (
                    <div
                      key={String(inv.id)}
                      className="flex items-center group"
                    >
                      <button
                        type="button"
                        onClick={() => loadInvestigation(inv)}
                        className={cn(
                          "flex-1 text-left px-3 py-2 text-xs hover:bg-muted/40 transition-smooth",
                          activeInv?.id === inv.id
                            ? "text-primary font-medium"
                            : "text-foreground",
                        )}
                        data-ocid={`inv-load-${inv.id}`}
                      >
                        <p className="truncate">{inv.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {inv.entityIds.length} entities ·{" "}
                          {relativeTime(inv.createdAt)}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(inv)}
                        className="p-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-smooth"
                        aria-label="Delete investigation"
                        data-ocid={`inv-delete-${inv.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Save button */}
          <Button
            size="sm"
            className="gap-1.5 text-xs h-8"
            onClick={openSaveDialog}
            data-ocid="investigation-save-btn"
          >
            <Save className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Save Investigation</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </div>

      {/* Split panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: Entity browser */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-72 xl:w-80 shrink-0 flex flex-col border-r border-border bg-card",
            // Mobile: hide when in detail view
            mobileView === "detail" ? "hidden md:flex" : "flex",
          )}
        >
          <div className="p-3 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={entitySearch}
                onChange={(e) => setEntitySearch(e.target.value)}
                placeholder="Search entities…"
                className="pl-8 h-8 text-xs bg-background border-border"
                data-ocid="entity-search"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 px-0.5">
              {filteredEntities.length} entities
              {activeInv && ` · ${activeInv.entityIds.length} in investigation`}
            </p>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5" data-ocid="entity-list">
              {isLoading ? (
                ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
                  <Skeleton key={k} className="h-12 rounded-lg mx-1" />
                ))
              ) : filteredEntities.length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-2">
                  <Search className="h-8 w-8 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    No entities found
                  </p>
                </div>
              ) : (
                filteredEntities.map((entity) => (
                  <EntityListItem
                    key={String(entity.id)}
                    entity={entity}
                    selected={selectedEntity?.id === entity.id}
                    onClick={() => selectEntityFromList(entity)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right panel: Entity detail */}
        <div
          className={cn(
            "flex-1 overflow-hidden flex flex-col bg-background",
            mobileView === "list" && selectedEntity === null
              ? "hidden md:flex"
              : "flex",
          )}
        >
          {!selectedEntity ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-4 px-8">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Search className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Select an entity
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click any entity from the browser to view details,
                  connections, and provenance.
                </p>
              </div>
              {activeInv && (
                <div className="mt-2 p-3 rounded-lg border border-primary/20 bg-primary/5 text-center max-w-xs">
                  <p className="text-xs text-primary font-medium">
                    {activeInv.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {activeInv.entityIds.length} entities in this investigation
                  </p>
                </div>
              )}
            </div>
          ) : (
            <EntityDetail
              entity={selectedEntity}
              allEntities={displayEntities}
              onNavigate={navigateTo}
              onBack={handleBack}
            />
          )}
        </div>
      </div>

      {/* Save Investigation Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-base">
              Save Investigation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div>
              <Label className="text-xs text-muted-foreground">
                Investigation Name
              </Label>
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Operation Codename…"
                className="mt-1.5 bg-background border-border text-sm"
                data-ocid="save-investigation-name"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Include Entities ({saveEntityIds.size} selected)
              </Label>
              <ScrollArea className="mt-1.5 h-44 border border-border rounded-lg p-2">
                <div className="space-y-0.5">
                  {displayEntities.map((e) => (
                    <button
                      type="button"
                      key={String(e.id)}
                      onClick={() => {
                        const next = new Set(saveEntityIds);
                        next.has(e.id) ? next.delete(e.id) : next.add(e.id);
                        setSaveEntityIds(next);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-smooth",
                        saveEntityIds.has(e.id)
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                      )}
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ background: TYPE_COLORS[e.entityType] }}
                      />
                      <span className="truncate">{e.name}</span>
                      <Badge
                        variant="outline"
                        className="ml-auto text-[10px] px-1 h-4 shrink-0 border-0 bg-muted/40"
                      >
                        {e.entityType}
                      </Badge>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSaveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!saveName.trim() || createMutation.isPending}
                data-ocid="save-investigation-submit"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Investigation?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              "{deleteTarget?.name}" will be permanently removed. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="delete-inv-cancel">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              data-ocid="delete-inv-confirm"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Click-away for dropdown */}
      {invDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setInvDropdownOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setInvDropdownOpen(false)}
          role="button"
          tabIndex={-1}
          aria-label="Close dropdown"
        />
      )}
    </div>
  );
}

import type React from "react";
