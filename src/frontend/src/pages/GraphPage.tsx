import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  Filter,
  GitFork,
  RefreshCw,
  Search,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIsMobile } from "../hooks/use-mobile";
import { useEntities } from "../hooks/useBackend";
import {
  cn,
  entityTypeClass,
  formatTimestamp,
  relativeTime,
} from "../lib/utils";
import type { Entity } from "../types";
import { EntityTypeEnum } from "../types";

// ─── Extended seed data (15-20 entities) ─────────────────────────────────────
const SEED_ENTITIES: Entity[] = [
  {
    id: 1n,
    name: "Marcus Chen",
    entityType: EntityTypeEnum.Person,
    attributes: [
      { key: "role", value: "Senior Analyst" },
      { key: "clearance", value: "Level 3" },
    ],
    relationships: [
      { targetId: 2n, relationshipType: "works_for" },
      { targetId: 5n, relationshipType: "owns" },
      { targetId: 8n, relationshipType: "attended" },
    ],
    lastUpdated: BigInt(Date.now() - 3_600_000) * 1_000_000n,
  },
  {
    id: 2n,
    name: "Nexus Capital",
    entityType: EntityTypeEnum.Organization,
    attributes: [
      { key: "sector", value: "Finance" },
      { key: "jurisdiction", value: "Cayman Islands" },
    ],
    relationships: [
      { targetId: 3n, relationshipType: "owns" },
      { targetId: 6n, relationshipType: "funds" },
      { targetId: 11n, relationshipType: "partner_of" },
    ],
    lastUpdated: BigInt(Date.now() - 7_200_000) * 1_000_000n,
  },
  {
    id: 3n,
    name: "FINSERV-NET",
    entityType: EntityTypeEnum.Asset,
    attributes: [
      { key: "type", value: "Network Infrastructure" },
      { key: "ip_range", value: "192.168.10.0/24" },
    ],
    relationships: [{ targetId: 7n, relationshipType: "involved_in" }],
    lastUpdated: BigInt(Date.now() - 14_400_000) * 1_000_000n,
  },
  {
    id: 4n,
    name: "Elena Vasquez",
    entityType: EntityTypeEnum.Person,
    attributes: [
      { key: "role", value: "Compliance Officer" },
      { key: "nationality", value: "Spanish" },
    ],
    relationships: [
      { targetId: 2n, relationshipType: "investigated_by" },
      { targetId: 8n, relationshipType: "attended" },
      { targetId: 13n, relationshipType: "filed_report_on" },
    ],
    lastUpdated: BigInt(Date.now() - 28_800_000) * 1_000_000n,
  },
  {
    id: 5n,
    name: "Server Array 7",
    entityType: EntityTypeEnum.Asset,
    attributes: [
      { key: "location", value: "Data Center SG-01" },
      { key: "capacity", value: "48TB" },
    ],
    relationships: [{ targetId: 7n, relationshipType: "affected_by" }],
    lastUpdated: BigInt(Date.now() - 43_200_000) * 1_000_000n,
  },
  {
    id: 6n,
    name: "Horizon Ventures",
    entityType: EntityTypeEnum.Organization,
    attributes: [
      { key: "sector", value: "Venture Capital" },
      { key: "founded", value: "2018" },
    ],
    relationships: [
      { targetId: 4n, relationshipType: "employs" },
      { targetId: 9n, relationshipType: "backed_by" },
    ],
    lastUpdated: BigInt(Date.now() - 86_400_000) * 1_000_000n,
  },
  {
    id: 7n,
    name: "Data Breach Q2",
    entityType: EntityTypeEnum.Event,
    attributes: [
      { key: "severity", value: "Critical" },
      { key: "records_exposed", value: "2.4M" },
    ],
    relationships: [
      { targetId: 1n, relationshipType: "involves" },
      { targetId: 12n, relationshipType: "triggered" },
    ],
    lastUpdated: BigInt(Date.now() - 172_800_000) * 1_000_000n,
  },
  {
    id: 8n,
    name: "APAC Summit 2025",
    entityType: EntityTypeEnum.Event,
    attributes: [
      { key: "location", value: "Singapore" },
      { key: "attendees", value: "340" },
    ],
    relationships: [{ targetId: 2n, relationshipType: "sponsored_by" }],
    lastUpdated: BigInt(Date.now() - 259_200_000) * 1_000_000n,
  },
  {
    id: 9n,
    name: "Dmitri Sokolov",
    entityType: EntityTypeEnum.Person,
    attributes: [
      { key: "nationality", value: "Russian" },
      { key: "status", value: "Under Surveillance" },
    ],
    relationships: [
      { targetId: 6n, relationshipType: "controls" },
      { targetId: 14n, relationshipType: "wired_funds_to" },
    ],
    lastUpdated: BigInt(Date.now() - 345_600_000) * 1_000_000n,
  },
  {
    id: 10n,
    name: "Vault DB Alpha",
    entityType: EntityTypeEnum.Asset,
    attributes: [
      { key: "classification", value: "Top Secret" },
      { key: "records", value: "18.7M" },
    ],
    relationships: [{ targetId: 7n, relationshipType: "affected_by" }],
    lastUpdated: BigInt(Date.now() - 432_000_000) * 1_000_000n,
  },
  {
    id: 11n,
    name: "Meridian Holdings",
    entityType: EntityTypeEnum.Organization,
    attributes: [
      { key: "sector", value: "Real Estate" },
      { key: "jurisdiction", value: "BVI" },
    ],
    relationships: [{ targetId: 9n, relationshipType: "employs" }],
    lastUpdated: BigInt(Date.now() - 518_400_000) * 1_000_000n,
  },
  {
    id: 12n,
    name: "SEC Investigation",
    entityType: EntityTypeEnum.Event,
    attributes: [
      { key: "case_number", value: "SEC-2025-4821" },
      { key: "status", value: "Active" },
    ],
    relationships: [
      { targetId: 2n, relationshipType: "targets" },
      { targetId: 4n, relationshipType: "involves" },
    ],
    lastUpdated: BigInt(Date.now() - 604_800_000) * 1_000_000n,
  },
  {
    id: 13n,
    name: "SAR Filing #4821",
    entityType: EntityTypeEnum.Asset,
    attributes: [
      { key: "type", value: "Regulatory Document" },
      { key: "amount", value: "$4.2M" },
    ],
    relationships: [{ targetId: 12n, relationshipType: "referenced_in" }],
    lastUpdated: BigInt(Date.now() - 691_200_000) * 1_000_000n,
  },
  {
    id: 14n,
    name: "Shell Corp BVI-33",
    entityType: EntityTypeEnum.Organization,
    attributes: [
      { key: "registered", value: "2021" },
      { key: "purpose", value: "Unknown" },
    ],
    relationships: [
      { targetId: 11n, relationshipType: "subsidiary_of" },
      { targetId: 10n, relationshipType: "accessed" },
    ],
    lastUpdated: BigInt(Date.now() - 777_600_000) * 1_000_000n,
  },
  {
    id: 15n,
    name: "Priya Nair",
    entityType: EntityTypeEnum.Person,
    attributes: [
      { key: "role", value: "Whistleblower" },
      { key: "status", value: "Protected" },
    ],
    relationships: [
      { targetId: 12n, relationshipType: "reported_to" },
      { targetId: 6n, relationshipType: "former_employee_of" },
    ],
    lastUpdated: BigInt(Date.now() - 864_000_000) * 1_000_000n,
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  [EntityTypeEnum.Person]: "oklch(0.62 0.15 265)",
  [EntityTypeEnum.Organization]: "oklch(0.65 0.18 310)",
  [EntityTypeEnum.Asset]: "oklch(0.70 0.20 50)",
  [EntityTypeEnum.Event]: "oklch(0.62 0.22 25)",
};

const TYPE_LABELS: Record<string, string> = {
  [EntityTypeEnum.Person]: "Person",
  [EntityTypeEnum.Organization]: "Organization",
  [EntityTypeEnum.Asset]: "Asset",
  [EntityTypeEnum.Event]: "Event",
};

const NODE_SHAPES: Record<string, "circle" | "rect" | "diamond" | "hex"> = {
  [EntityTypeEnum.Person]: "circle",
  [EntityTypeEnum.Organization]: "rect",
  [EntityTypeEnum.Asset]: "diamond",
  [EntityTypeEnum.Event]: "hex",
};

const GRAPH_W = 900;
const GRAPH_H = 560;

// ─── Force simulation types ───────────────────────────────────────────────────

type SimNode = Entity & {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

function buildInitialNodes(entities: Entity[]): SimNode[] {
  return entities.map((e, i) => {
    const angle = (i / entities.length) * 2 * Math.PI;
    const spread = Math.min(GRAPH_W, GRAPH_H) * 0.33;
    const jitter = (Math.random() - 0.5) * 40;
    const r = 7 + Math.min(e.relationships.length * 2, 12);
    return {
      ...e,
      x: GRAPH_W / 2 + (spread + jitter) * Math.cos(angle),
      y: GRAPH_H / 2 + (spread * 0.75 + jitter) * Math.sin(angle),
      vx: 0,
      vy: 0,
      r,
    };
  });
}

function buildEdges(entities: Entity[]) {
  const edges: { source: bigint; target: bigint; label: string }[] = [];
  const ids = new Set(entities.map((e) => e.id));
  for (const e of entities) {
    for (const rel of e.relationships) {
      if (ids.has(rel.targetId)) {
        edges.push({
          source: e.id,
          target: rel.targetId,
          label: rel.relationshipType,
        });
      }
    }
  }
  return edges;
}

function runSimStep(
  nodes: SimNode[],
  edges: { source: bigint; target: bigint; label: string }[],
  alpha: number,
): SimNode[] {
  const next = nodes.map((n) => ({ ...n }));
  const idx = new Map(next.map((n, i) => [n.id, i]));

  // Repulsion between all pairs
  for (let i = 0; i < next.length; i++) {
    for (let j = i + 1; j < next.length; j++) {
      const dx = next[j].x - next[i].x;
      const dy = next[j].y - next[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const repulse = (2500 / (dist * dist)) * alpha;
      const fx = (dx / dist) * repulse;
      const fy = (dy / dist) * repulse;
      next[i].vx -= fx;
      next[i].vy -= fy;
      next[j].vx += fx;
      next[j].vy += fy;
    }
  }

  // Spring attraction along edges
  for (const edge of edges) {
    const si = idx.get(edge.source);
    const ti = idx.get(edge.target);
    if (si === undefined || ti === undefined) continue;
    const dx = next[ti].x - next[si].x;
    const dy = next[ti].y - next[si].y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const targetDist = 140;
    const stretch = (dist - targetDist) * 0.04 * alpha;
    const fx = (dx / dist) * stretch;
    const fy = (dy / dist) * stretch;
    next[si].vx += fx;
    next[si].vy += fy;
    next[ti].vx -= fx;
    next[ti].vy -= fy;
  }

  // Center gravity
  for (const n of next) {
    n.vx += (GRAPH_W / 2 - n.x) * 0.008 * alpha;
    n.vy += (GRAPH_H / 2 - n.y) * 0.008 * alpha;
  }

  // Apply velocity + damping + boundary
  for (const n of next) {
    n.vx *= 0.75;
    n.vy *= 0.75;
    n.x = Math.max(n.r + 20, Math.min(GRAPH_W - n.r - 20, n.x + n.vx));
    n.y = Math.max(n.r + 20, Math.min(GRAPH_H - n.r - 20, n.y + n.vy));
  }
  return next;
}

// ─── Node shape renderer ─────────────────────────────────────────────────────

function NodeShape({
  node,
  isSelected,
  isHighlighted,
  isDimmed,
}: {
  node: SimNode;
  isSelected: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
}) {
  const color = TYPE_COLORS[node.entityType];
  const shape = NODE_SHAPES[node.entityType];
  const r = node.r;
  const opacity = isDimmed ? 0.2 : isSelected ? 1 : isHighlighted ? 0.9 : 0.75;
  const stroke = isSelected ? "oklch(0.95 0 0)" : isHighlighted ? color : color;
  const strokeWidth = isSelected ? 2.5 : isHighlighted ? 1.5 : 0.8;

  const sharedProps = {
    fill: color,
    fillOpacity: opacity,
    stroke,
    strokeWidth,
    style: { transition: "all 0.18s" } as React.CSSProperties,
  };

  if (shape === "circle") {
    return <circle r={r} {...sharedProps} />;
  }
  if (shape === "rect") {
    const w = r * 2.2;
    const h = r * 1.5;
    return (
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={3}
        {...sharedProps}
      />
    );
  }
  if (shape === "diamond") {
    const s = r * 1.3;
    return (
      <polygon points={`0,${-s} ${s},0 0,${s} ${-s},0`} {...sharedProps} />
    );
  }
  // hex
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3 - Math.PI / 6;
    return `${(r * 1.1 * Math.cos(a)).toFixed(2)},${(r * 1.1 * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
  return <polygon points={pts} {...sharedProps} />;
}

// ─── Relationship edge label ─────────────────────────────────────────────────

function EdgeLabel({
  x1,
  y1,
  x2,
  y2,
  label,
  visible,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  visible: boolean;
}) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  if (!visible) return null;
  return (
    <text
      x={mx}
      y={my}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={8}
      fill="oklch(0.7 0 0)"
      style={{ pointerEvents: "none" }}
    >
      <tspan dy={-4}>{label.replace(/_/g, " ")}</tspan>
    </text>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GraphPage() {
  const { data: rawEntities, isLoading } = useEntities();
  const isMobile = useIsMobile();
  const entities =
    rawEntities && rawEntities.length > 0 ? rawEntities : SEED_ENTITIES;

  // Graph state
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [edges, setEdges] = useState<
    { source: bigint; target: bigint; label: string }[]
  >([]);
  const [selected, setSelected] = useState<SimNode | null>(null);
  const [hoverEdge, setHoverEdge] = useState<string | null>(null);
  const [expandDegree, setExpandDegree] = useState<2 | null>(null);
  const [lastClick, setLastClick] = useState<{
    id: bigint;
    time: number;
  } | null>(null);

  // UI state
  const [search, setSearch] = useState("");
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showDetail, setShowDetail] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number | null>(null);
  const alphaRef = useRef(1);

  // Build graph from entities
  const resetGraph = useCallback(() => {
    const newNodes = buildInitialNodes(entities);
    const newEdges = buildEdges(entities);
    setNodes(newNodes);
    setEdges(newEdges);
    setSelected(null);
    setExpandDegree(null);
    alphaRef.current = 1;
  }, [entities]);

  useEffect(() => {
    resetGraph();
  }, [resetGraph]);

  // Force simulation loop
  useEffect(() => {
    if (nodes.length === 0) return;

    const tick = () => {
      if (alphaRef.current < 0.01) return;
      setNodes((prev) => {
        const next = runSimStep(prev, edges, alphaRef.current);
        alphaRef.current *= 0.96;
        return next;
      });
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [edges, nodes.length]);

  // Derived — which nodes are visible after search + type filter
  const visibleNodeIds = useMemo(() => {
    const q = search.trim().toLowerCase();
    return new Set(
      nodes
        .filter((n) => {
          if (typeFilters.size > 0 && !typeFilters.has(n.entityType))
            return false;
          if (
            q &&
            !n.name.toLowerCase().includes(q) &&
            !TYPE_LABELS[n.entityType].toLowerCase().includes(q)
          )
            return false;
          return true;
        })
        .map((n) => n.id),
    );
  }, [nodes, search, typeFilters]);

  // Highlighted nodes (1st degree from selected)
  const highlightedIds = useMemo(() => {
    if (!selected) return new Set<bigint>();
    const set = new Set<bigint>([selected.id]);
    for (const e of edges) {
      if (e.source === selected.id) set.add(e.target);
      if (e.target === selected.id) set.add(e.source);
    }
    if (expandDegree === 2) {
      // 2nd degree
      const firstDeg = new Set(set);
      for (const fid of firstDeg) {
        for (const e of edges) {
          if (e.source === fid) set.add(e.target);
          if (e.target === fid) set.add(e.source);
        }
      }
    }
    return set;
  }, [selected, edges, expandDegree]);

  const handleNodeClick = useCallback(
    (node: SimNode) => {
      const now = Date.now();
      if (lastClick && lastClick.id === node.id && now - lastClick.time < 400) {
        // Double click — expand 2nd degree
        setExpandDegree((d) => (d === 2 ? null : 2));
      } else {
        setSelected((prev) => (prev?.id === node.id ? null : node));
        setShowDetail(true);
        setExpandDegree(null);
      }
      setLastClick({ id: node.id, time: now });
    },
    [lastClick],
  );

  const toggleTypeFilter = (type: string) => {
    setTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  // Pan handlers
  const onSvgMouseDown = (e: React.MouseEvent) => {
    if ((e.target as SVGElement).closest("[data-node]")) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };
  const onSvgMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };
  const onSvgMouseUp = () => setIsPanning(false);

  const allTypes = Object.values(EntityTypeEnum) as string[];

  // ── Mobile: list view ──────────────────────────────────────────────────────
  if (isMobile) {
    return <MobileListView entities={entities} isLoading={isLoading} />;
  }

  // ── Desktop: graph view ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-0 px-4 md:px-6 py-4 gap-3">
      {/* Top bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-display font-semibold text-foreground leading-tight">
            Entity Graph
          </h1>
          <p className="text-xs text-muted-foreground">
            {entities.length} entities · {edges.length} relationships
          </p>
        </div>

        {/* Search */}
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entities…"
            className="pl-8 h-8 text-xs bg-card border-border"
            data-ocid="graph-search"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 border border-border/60 rounded-md p-0.5 bg-card">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
            data-ocid="graph-zoom-in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <span className="text-[10px] text-muted-foreground w-8 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.3))}
            data-ocid="graph-zoom-out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => {
            setZoom(1);
            setPanOffset({ x: 0, y: 0 });
            resetGraph();
          }}
          data-ocid="graph-reset"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      {/* Type filter legend */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        {allTypes.map((t) => {
          const active = typeFilters.has(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggleTypeFilter(t)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-smooth border",
                active
                  ? "text-foreground border-transparent"
                  : "text-muted-foreground border-border/50 hover:text-foreground hover:bg-muted/40",
              )}
              style={
                active
                  ? {
                      background: `${TYPE_COLORS[t]}20`,
                      borderColor: `${TYPE_COLORS[t]}50`,
                      color: TYPE_COLORS[t],
                    }
                  : {}
              }
              data-ocid={`graph-filter-${t.toLowerCase()}`}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: TYPE_COLORS[t] }}
              />
              {TYPE_LABELS[t]}
            </button>
          );
        })}
        {(typeFilters.size > 0 || search) && (
          <button
            type="button"
            onClick={() => {
              setTypeFilters(new Set());
              setSearch("");
            }}
            className="text-[10px] text-muted-foreground hover:text-foreground ml-1 underline"
          >
            Clear
          </button>
        )}
        {selected && (
          <span className="ml-auto text-[10px] text-muted-foreground">
            Double-click a node to expand 2° connections
          </span>
        )}
      </div>

      {/* Graph + detail panel */}
      <div className="flex gap-3 flex-1 min-h-0">
        {/* SVG Canvas */}
        <div className="flex-1 min-w-0 bg-card border border-border rounded-lg overflow-hidden relative">
          {isLoading ? (
            <Skeleton className="absolute inset-0 rounded-lg" />
          ) : (
            <svg
              ref={svgRef}
              viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`}
              className="w-full h-full"
              style={{
                cursor: isPanning ? "grabbing" : "grab",
                background: "oklch(0.13 0 0)",
              }}
              onMouseDown={onSvgMouseDown}
              onMouseMove={onSvgMouseMove}
              onMouseUp={onSvgMouseUp}
              onMouseLeave={onSvgMouseUp}
              aria-label="Entity relationship graph"
            >
              <title>Entity Relationship Graph</title>

              {/* Defs for glow filter */}
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g
                transform={`translate(${panOffset.x},${panOffset.y}) scale(${zoom})`}
                style={{ transformOrigin: `${GRAPH_W / 2}px ${GRAPH_H / 2}px` }}
              >
                {/* Edges */}
                {edges.map((edge) => {
                  const src = nodes.find((n) => n.id === edge.source);
                  const tgt = nodes.find((n) => n.id === edge.target);
                  if (!src || !tgt) return null;

                  const srcVisible = visibleNodeIds.has(edge.source);
                  const tgtVisible = visibleNodeIds.has(edge.target);
                  if (!srcVisible || !tgtVisible) return null;

                  const edgeId = `${edge.source}-${edge.target}-${edge.label}`;
                  const isActive =
                    selected &&
                    highlightedIds.has(edge.source) &&
                    highlightedIds.has(edge.target);
                  const isHovered = hoverEdge === edgeId;

                  return (
                    <g key={edgeId}>
                      <line
                        x1={src.x}
                        y1={src.y}
                        x2={tgt.x}
                        y2={tgt.y}
                        stroke={
                          isActive
                            ? TYPE_COLORS[src.entityType]
                            : "oklch(0.28 0 0)"
                        }
                        strokeWidth={isActive ? 1.5 : 0.8}
                        strokeOpacity={isActive ? 0.7 : 0.4}
                        style={{ transition: "all 0.2s" }}
                      />
                      {/* Invisible wider hit area for hover */}
                      <line
                        x1={src.x}
                        y1={src.y}
                        x2={tgt.x}
                        y2={tgt.y}
                        stroke="transparent"
                        strokeWidth={12}
                        style={{ cursor: "default" }}
                        onMouseEnter={() => setHoverEdge(edgeId)}
                        onMouseLeave={() => setHoverEdge(null)}
                      />
                      <EdgeLabel
                        x1={src.x}
                        y1={src.y}
                        x2={tgt.x}
                        y2={tgt.y}
                        label={edge.label}
                        visible={
                          isHovered ||
                          (!!isActive &&
                            !!selected &&
                            (edge.source === selected.id ||
                              edge.target === selected.id))
                        }
                      />
                    </g>
                  );
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                  if (!visibleNodeIds.has(node.id)) return null;
                  const isSelected = selected?.id === node.id;
                  const isHighlighted =
                    !selected || highlightedIds.has(node.id);
                  const isDimmed = !!selected && !highlightedIds.has(node.id);

                  return (
                    <g
                      key={String(node.id)}
                      transform={`translate(${node.x},${node.y})`}
                      onClick={() => handleNodeClick(node)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          handleNodeClick(node);
                      }}
                      tabIndex={0}
                      aria-label={`Entity: ${node.name} (${TYPE_LABELS[node.entityType]})`}
                      style={{ cursor: "pointer", outline: "none" }}
                      data-node
                      data-ocid={`graph-node-${node.id}`}
                    >
                      {isSelected && (
                        <circle
                          r={node.r + 8}
                          fill="none"
                          stroke={TYPE_COLORS[node.entityType]}
                          strokeWidth={1}
                          strokeOpacity={0.4}
                          strokeDasharray="3,3"
                          style={{ animation: "spin 8s linear infinite" }}
                        />
                      )}
                      <NodeShape
                        node={node}
                        isSelected={isSelected}
                        isHighlighted={isHighlighted}
                        isDimmed={isDimmed}
                      />
                      <text
                        y={node.r + 12}
                        textAnchor="middle"
                        fontSize={9}
                        fill={isDimmed ? "oklch(0.35 0 0)" : "oklch(0.72 0 0)"}
                        style={{
                          pointerEvents: "none",
                          transition: "fill 0.2s",
                        }}
                      >
                        {node.name.length > 16
                          ? `${node.name.slice(0, 14)}…`
                          : node.name}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          )}

          {/* Bottom legend overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3 flex-wrap pointer-events-none">
            {allTypes.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 text-[10px] text-muted-foreground"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: TYPE_COLORS[t] }}
                />
                {TYPE_LABELS[t]}
              </span>
            ))}
          </div>

          {/* Visible count badge */}
          {(search || typeFilters.size > 0) && (
            <div className="absolute top-3 left-3 bg-card/90 border border-border/60 text-xs text-muted-foreground px-2 py-1 rounded-md backdrop-blur-sm">
              Showing {visibleNodeIds.size} of {nodes.length} entities
            </div>
          )}

          {expandDegree === 2 && selected && (
            <div className="absolute top-3 left-3 bg-primary/15 border border-primary/30 text-xs text-primary px-2 py-1 rounded-md">
              2° expansion active for {selected.name}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div
          className={cn(
            "w-72 shrink-0 bg-card border border-border rounded-lg flex flex-col transition-smooth",
            !showDetail && "opacity-60",
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <GitFork className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-display font-semibold text-foreground">
                {selected ? "Entity Details" : "Select a Node"}
              </span>
            </div>
            {selected && (
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setExpandDegree(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-smooth"
                aria-label="Deselect entity"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <ScrollArea className="flex-1">
            <div className="px-4 py-3">
              {!selected ? (
                <div className="text-center py-8 space-y-2">
                  <div className="h-10 w-10 rounded-full bg-muted/40 flex items-center justify-center mx-auto">
                    <GitFork className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click any node to inspect entity details and connections.
                  </p>
                </div>
              ) : (
                <EntityDetail
                  entity={selected}
                  allNodes={nodes}
                  edges={edges}
                  onNavigate={(node) => handleNodeClick(node)}
                />
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

// ─── Entity Detail Panel ─────────────────────────────────────────────────────

function EntityDetail({
  entity,
  allNodes,
  edges,
  onNavigate,
}: {
  entity: SimNode;
  allNodes: SimNode[];
  edges: { source: bigint; target: bigint; label: string }[];
  onNavigate: (node: SimNode) => void;
}) {
  const relConnections = useMemo(() => {
    const rels = entity.relationships.map((r) => {
      const target = allNodes.find((n) => n.id === r.targetId);
      return { ...r, target };
    });
    // Also inbound relationships
    const inbound = edges
      .filter((e) => e.target === entity.id)
      .map((e) => {
        const src = allNodes.find((n) => n.id === e.source);
        return {
          targetId: e.source,
          relationshipType: `← ${e.label}`,
          target: src,
        };
      });
    return [...rels, ...inbound];
  }, [entity, allNodes, edges]);

  return (
    <div className="space-y-4" data-ocid="graph-entity-detail">
      {/* Header card */}
      <div
        className={cn(
          "p-3 rounded-lg bg-background border border-border/40",
          entityTypeClass(entity.entityType),
        )}
      >
        <p className="text-sm font-semibold text-foreground truncate">
          {entity.name}
        </p>
        <Badge
          variant="outline"
          className="mt-1.5 text-[10px]"
          style={{
            borderColor: `${TYPE_COLORS[entity.entityType]}50`,
            color: TYPE_COLORS[entity.entityType],
          }}
        >
          {TYPE_LABELS[entity.entityType]}
        </Badge>
        <p className="text-[10px] text-muted-foreground mt-2">
          Updated {relativeTime(entity.lastUpdated)}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {formatTimestamp(entity.lastUpdated)}
        </p>
      </div>

      {/* Attributes */}
      {entity.attributes.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
            Attributes
          </p>
          <div className="space-y-1.5">
            {entity.attributes.map((a) => (
              <div key={a.key} className="flex justify-between text-xs gap-2">
                <span className="text-muted-foreground shrink-0 capitalize">
                  {a.key.replace(/_/g, " ")}
                </span>
                <span className="text-foreground font-mono text-[11px] truncate text-right">
                  {a.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connections */}
      {relConnections.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
            Connections ({relConnections.length})
          </p>
          <div className="space-y-1.5">
            {relConnections.map((r, i) => {
              const key = `${String(r.targetId)}-${r.relationshipType}-${i}`;
              return (
                <button
                  key={key}
                  type="button"
                  className="w-full flex items-center justify-between text-xs bg-background border border-border/40 rounded px-2.5 py-2 hover:border-primary/40 hover:bg-primary/5 transition-smooth group"
                  onClick={() => r.target && onNavigate(r.target)}
                  disabled={!r.target}
                  aria-label={`Navigate to ${r.target?.name ?? String(r.targetId)}`}
                  data-ocid={`graph-rel-${String(r.targetId)}`}
                >
                  <span className="text-muted-foreground text-[10px] font-mono truncate max-w-[90px]">
                    {r.relationshipType.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {r.target && (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: TYPE_COLORS[r.target.entityType] }}
                      />
                    )}
                    <span className="text-foreground truncate max-w-[80px]">
                      {r.target?.name ?? `#${r.targetId}`}
                    </span>
                    {r.target && (
                      <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-smooth" />
                    )}
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

// ─── Mobile List View ─────────────────────────────────────────────────────────

function MobileListView({
  entities,
  isLoading,
}: {
  entities: Entity[];
  isLoading: boolean;
}) {
  const [selected, setSelected] = useState<Entity | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      entities.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          TYPE_LABELS[e.entityType]
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [entities, search],
  );

  if (selected) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Back to list"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="font-display font-semibold text-foreground truncate">
            {selected.name}
          </h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="px-4 py-4 space-y-4">
            <div
              className={cn(
                "p-4 rounded-lg bg-card border border-border",
                entityTypeClass(selected.entityType),
              )}
            >
              <Badge
                variant="outline"
                className="text-xs mb-2"
                style={{
                  borderColor: `${TYPE_COLORS[selected.entityType]}50`,
                  color: TYPE_COLORS[selected.entityType],
                }}
              >
                {TYPE_LABELS[selected.entityType]}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Updated {relativeTime(selected.lastUpdated)}
              </p>
            </div>

            {selected.attributes.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Attributes
                </p>
                {selected.attributes.map((a) => (
                  <div key={a.key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {a.key.replace(/_/g, " ")}
                    </span>
                    <span className="text-foreground font-mono text-xs">
                      {a.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {selected.relationships.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Connections
                </p>
                {selected.relationships.map((r) => {
                  const target = entities.find((e) => e.id === r.targetId);
                  return (
                    <button
                      key={`${String(r.targetId)}-${r.relationshipType}`}
                      type="button"
                      className="w-full flex items-center justify-between bg-background border border-border/40 rounded px-3 py-2.5 hover:border-primary/40 transition-smooth"
                      onClick={() => target && setSelected(target)}
                      disabled={!target}
                      data-ocid={`mobile-rel-${String(r.targetId)}`}
                    >
                      <span className="text-xs text-muted-foreground font-mono">
                        {r.relationshipType.replace(/_/g, " ")}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {target && (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              background: TYPE_COLORS[target.entityType],
                            }}
                          />
                        )}
                        <span className="text-sm text-foreground">
                          {target?.name ?? `#${r.targetId}`}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border bg-card space-y-2">
        <h1 className="font-display font-semibold text-foreground">
          Entity Graph
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entities…"
            className="pl-9 bg-background"
            data-ocid="mobile-entity-search"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="px-4 py-4 space-y-3">
            {(["s1", "s2", "s3", "s4", "s5", "s6"] as const).map((k) => (
              <Skeleton key={k} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="px-4 py-3 space-y-2">
            {filtered.map((entity) => (
              <button
                key={String(entity.id)}
                type="button"
                className="w-full text-left"
                onClick={() => setSelected(entity)}
                data-ocid={`mobile-entity-${entity.id}`}
              >
                <div
                  className={cn(
                    "flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3 hover:border-primary/40 transition-smooth",
                    entityTypeClass(entity.entityType),
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {entity.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: TYPE_COLORS[entity.entityType] }}
                      >
                        {TYPE_LABELS[entity.entityType]}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {entity.relationships.length} connections
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div
                className="text-center py-12 space-y-2"
                data-ocid="mobile-empty-state"
              >
                <p className="text-sm text-muted-foreground">
                  No entities match your search.
                </p>
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-xs text-primary hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
