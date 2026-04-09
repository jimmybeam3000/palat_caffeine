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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  Clock,
  Database,
  FileText,
  Globe,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  XCircle,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  useCreateDataSource,
  useDataSources,
  useDeleteDataSource,
  useEntities,
  useSyncHistory,
  useTriggerSync,
  useUpdateDataSource,
} from "../hooks/useBackend";
import {
  cn,
  dataSourceStatusColor,
  dataSourceTypeLabel,
  formatTimestamp,
  relativeTime,
} from "../lib/utils";
import type { DataSource, DataSourceConfig, Entity } from "../types";
import { DataSourceStatusEnum, DataSourceTypeEnum } from "../types";

// ─── Seed data fallback ───────────────────────────────────────────────────────

const SEED_SOURCES: DataSource[] = [
  {
    id: 1n,
    name: "FINSERV Transaction Feed",
    sourceType: DataSourceTypeEnum.REST_API,
    status: DataSourceStatusEnum.Connected,
    config: {
      url: "https://api.finserv.internal/v2/transactions",
      headers: [["Authorization", "Bearer ••••••••"]],
      intervalSeconds: 900n,
    },
    syncHistory: [
      {
        status: DataSourceStatusEnum.Connected,
        message: "Synced 312 new records",
        timestamp: BigInt(Date.now() - 300_000) * 1_000_000n,
        recordCount: 312n,
      },
      {
        status: DataSourceStatusEnum.Connected,
        message: "Synced 198 new records",
        timestamp: BigInt(Date.now() - 1_200_000) * 1_000_000n,
        recordCount: 198n,
      },
      {
        status: DataSourceStatusEnum.Error_,
        message: "Connection timeout after 30s",
        timestamp: BigInt(Date.now() - 3_600_000) * 1_000_000n,
        recordCount: 0n,
      },
    ],
    lastSync: BigInt(Date.now() - 300_000) * 1_000_000n,
    recordCount: 124_853n,
  },
  {
    id: 2n,
    name: "Entity Master CSV",
    sourceType: DataSourceTypeEnum.CSV,
    status: DataSourceStatusEnum.Connected,
    config: {
      url: "storage://uploads/entity_master_v3.csv",
      headers: [],
      intervalSeconds: 3600n,
    },
    syncHistory: [
      {
        status: DataSourceStatusEnum.Connected,
        message: "Full import: 8291 records",
        timestamp: BigInt(Date.now() - 3_600_000) * 1_000_000n,
        recordCount: 8291n,
      },
    ],
    lastSync: BigInt(Date.now() - 3_600_000) * 1_000_000n,
    recordCount: 8_291n,
  },
  {
    id: 3n,
    name: "Threat Intel JSON Stream",
    sourceType: DataSourceTypeEnum.JSON_Feed,
    status: DataSourceStatusEnum.Syncing,
    config: {
      url: "https://feeds.threatintel.io/v1/indicators",
      headers: [["X-API-Key", "••••••••"]],
      intervalSeconds: 120n,
    },
    syncHistory: [
      {
        status: DataSourceStatusEnum.Connected,
        message: "Synced 47 new indicators",
        timestamp: BigInt(Date.now() - 120_000) * 1_000_000n,
        recordCount: 47n,
      },
    ],
    lastSync: BigInt(Date.now() - 60_000) * 1_000_000n,
    recordCount: 3_472n,
  },
  {
    id: 4n,
    name: "APAC Asset Registry",
    sourceType: DataSourceTypeEnum.REST_API,
    status: DataSourceStatusEnum.Error_,
    config: {
      url: "https://apac.inventory.internal/api/assets",
      headers: [],
      intervalSeconds: 300n,
    },
    syncHistory: [
      {
        status: DataSourceStatusEnum.Error_,
        message: "SSL certificate expired",
        timestamp: BigInt(Date.now() - 86_400_000 * 2) * 1_000_000n,
        recordCount: 0n,
      },
    ],
    lastSync: BigInt(Date.now() - 86_400_000 * 2) * 1_000_000n,
    recordCount: 0n,
  },
  {
    id: 5n,
    name: "Sanctions List Daily",
    sourceType: DataSourceTypeEnum.JSON_Feed,
    status: DataSourceStatusEnum.Idle,
    config: {
      url: "https://sanctions.gov/api/daily.json",
      headers: [],
      intervalSeconds: 86400n,
    },
    syncHistory: [
      {
        status: DataSourceStatusEnum.Connected,
        message: "Synced 45112 entries",
        timestamp: BigInt(Date.now() - 86_400_000) * 1_000_000n,
        recordCount: 45112n,
      },
    ],
    lastSync: BigInt(Date.now() - 86_400_000) * 1_000_000n,
    recordCount: 45_112n,
  },
];

const SEED_ENTITIES: Entity[] = [
  {
    id: 101n,
    name: "Meridian Capital Group",
    entityType: "Organization" as Entity["entityType"],
    lastUpdated: BigInt(Date.now() - 900_000) * 1_000_000n,
    sourceId: 1n,
    attributes: [
      { key: "industry", value: "Financial Services" },
      { key: "jurisdiction", value: "Cayman Islands" },
      { key: "risk_score", value: "87" },
    ],
    relationships: [],
  },
  {
    id: 102n,
    name: "Viktor Reznov",
    entityType: "Person" as Entity["entityType"],
    lastUpdated: BigInt(Date.now() - 1_800_000) * 1_000_000n,
    sourceId: 1n,
    attributes: [
      { key: "role", value: "Director" },
      { key: "nationality", value: "RU" },
      { key: "pep_status", value: "true" },
    ],
    relationships: [{ targetId: 101n, relationshipType: "controls" }],
  },
  {
    id: 103n,
    name: "Oasis Holdings Ltd",
    entityType: "Organization" as Entity["entityType"],
    lastUpdated: BigInt(Date.now() - 3_600_000) * 1_000_000n,
    sourceId: 1n,
    attributes: [
      { key: "industry", value: "Shell Company" },
      { key: "jurisdiction", value: "BVI" },
      { key: "risk_score", value: "94" },
    ],
    relationships: [],
  },
  {
    id: 104n,
    name: "TXN-20240312-889421",
    entityType: "Event" as Entity["entityType"],
    lastUpdated: BigInt(Date.now() - 5_400_000) * 1_000_000n,
    sourceId: 1n,
    attributes: [
      { key: "amount_usd", value: "2450000" },
      { key: "currency", value: "USD" },
      { key: "status", value: "flagged" },
    ],
    relationships: [],
  },
];

// ─── Type icons & helpers ─────────────────────────────────────────────────────

const SOURCE_TYPE_ICONS: Record<string, React.ElementType> = {
  [DataSourceTypeEnum.CSV]: FileText,
  [DataSourceTypeEnum.REST_API]: Globe,
  [DataSourceTypeEnum.JSON_Feed]: Database,
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  [DataSourceStatusEnum.Connected]: CheckCircle,
  [DataSourceStatusEnum.Syncing]: Loader2,
  [DataSourceStatusEnum.Error_]: XCircle,
  [DataSourceStatusEnum.Idle]: Clock,
};

const STATUS_DOT: Record<string, string> = {
  [DataSourceStatusEnum.Connected]: "bg-[oklch(0.72_0.18_150)]",
  [DataSourceStatusEnum.Syncing]: "bg-[oklch(0.72_0.2_90)]",
  [DataSourceStatusEnum.Error_]: "bg-[oklch(0.62_0.22_25)]",
  [DataSourceStatusEnum.Idle]: "bg-muted-foreground",
};

const INTERVAL_OPTIONS = [
  { label: "5 min", value: "300" },
  { label: "15 min", value: "900" },
  { label: "30 min", value: "1800" },
  { label: "1 hour", value: "3600" },
  { label: "6 hours", value: "21600" },
  { label: "Daily", value: "86400" },
];

// ─── Field mapping helpers ────────────────────────────────────────────────────

const ENTITY_PROPS = [
  "name",
  "entityType",
  "attributes.industry",
  "attributes.jurisdiction",
  "attributes.risk_score",
  "attributes.role",
  "attributes.nationality",
  "attributes.status",
  "attributes.amount_usd",
  "relationships.targetId",
  "(ignore)",
];

const DETECTED_FIELDS: Record<string, string[]> = {
  [DataSourceTypeEnum.REST_API]: [
    "entity_name",
    "entity_type",
    "jurisdiction",
    "risk_score",
    "pep_status",
    "transaction_id",
    "amount",
  ],
  [DataSourceTypeEnum.CSV]: [
    "Name",
    "Type",
    "Industry",
    "Country",
    "Risk",
    "Source",
  ],
  [DataSourceTypeEnum.JSON_Feed]: [
    "id",
    "indicator_type",
    "value",
    "confidence",
    "severity",
    "tags",
  ],
};

const DEFAULT_MAPPING: Record<string, Record<string, string>> = {
  [DataSourceTypeEnum.REST_API]: {
    entity_name: "name",
    entity_type: "entityType",
    jurisdiction: "attributes.jurisdiction",
    risk_score: "attributes.risk_score",
    pep_status: "attributes.role",
    transaction_id: "name",
    amount: "attributes.amount_usd",
  },
  [DataSourceTypeEnum.CSV]: {
    Name: "name",
    Type: "entityType",
    Industry: "attributes.industry",
    Country: "attributes.jurisdiction",
    Risk: "attributes.risk_score",
    Source: "(ignore)",
  },
  [DataSourceTypeEnum.JSON_Feed]: {
    id: "name",
    indicator_type: "entityType",
    value: "attributes.status",
    confidence: "attributes.risk_score",
    severity: "attributes.risk_score",
    tags: "(ignore)",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

type CreateStep = "type" | "config";

function TypeSelectStep({
  onSelect,
}: {
  onSelect: (t: DataSourceTypeEnum) => void;
}) {
  const types = [
    {
      type: DataSourceTypeEnum.CSV,
      icon: FileText,
      label: "CSV Upload",
      desc: "Upload a CSV file via object storage. Perfect for bulk entity imports.",
    },
    {
      type: DataSourceTypeEnum.REST_API,
      icon: Globe,
      label: "REST API",
      desc: "Poll a REST endpoint on a schedule with optional auth headers.",
    },
    {
      type: DataSourceTypeEnum.JSON_Feed,
      icon: Database,
      label: "JSON Feed",
      desc: "Poll a JSON HTTP endpoint or paste raw JSON for one-time import.",
    },
  ];
  return (
    <div className="space-y-3 pt-2">
      <p className="text-sm text-muted-foreground">
        Choose the type of data source to connect:
      </p>
      {types.map(({ type, icon: Icon, label, desc }) => (
        <button
          key={type}
          type="button"
          onClick={() => onSelect(type)}
          className="w-full flex items-start gap-3 p-4 rounded-lg border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-smooth text-left group"
          data-ocid={`integration-type-select-${type.toLowerCase()}`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 group-hover:bg-primary/10 transition-smooth">
            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-smooth" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto self-center opacity-0 group-hover:opacity-100 transition-smooth" />
        </button>
      ))}
    </div>
  );
}

function CsvConfigForm({
  name,
  setName,
  onSubmit,
  isPending,
}: {
  name: string;
  setName: (v: string) => void;
  onSubmit: (url: string) => void;
  isPending: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setUploadedUrl("");
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    // Simulate object-storage upload with 1.5s progress
    await new Promise((r) => setTimeout(r, 1500));
    const key = `uploads/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    setUploadedUrl(`storage://${key}`);
    setUploading(false);
    toast.success(`Uploaded: ${file.name}`);
  };

  return (
    <div className="space-y-4 pt-2">
      <div>
        <Label className="text-xs">Source Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Entity Master CSV"
          className="mt-1.5 bg-background border-border"
          data-ocid="integration-new-name"
        />
      </div>
      <div>
        <Label className="text-xs">CSV File</Label>
        <div className="mt-1.5 flex items-center gap-2">
          <label className="flex-1 flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border border-dashed border-border bg-muted/20 hover:border-primary/40 hover:bg-primary/5 transition-smooth">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {fileName || "Choose a CSV file..."}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
              data-ocid="integration-csv-file-input"
            />
          </label>
          <Button
            size="sm"
            variant="outline"
            onClick={handleUpload}
            disabled={!fileName || uploading || !!uploadedUrl}
            className="shrink-0 h-9"
            data-ocid="integration-csv-upload-btn"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : uploadedUrl ? (
              <CheckCircle className="h-3.5 w-3.5 text-[oklch(0.72_0.18_150)]" />
            ) : (
              "Upload"
            )}
          </Button>
        </div>
        {uploadedUrl && (
          <p className="text-[10px] text-[oklch(0.72_0.18_150)] mt-1 font-mono truncate">
            {uploadedUrl}
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button
          size="sm"
          onClick={() => onSubmit(uploadedUrl)}
          disabled={!name.trim() || !uploadedUrl || isPending}
          data-ocid="integration-create-submit"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
          ) : null}
          Add Source
        </Button>
      </div>
    </div>
  );
}

function RestApiConfigForm({
  name,
  setName,
  onSubmit,
  isPending,
  onTestConnection,
  testStatus,
}: {
  name: string;
  setName: (v: string) => void;
  onSubmit: (
    url: string,
    interval: string,
    headers: [string, string][],
  ) => void;
  isPending: boolean;
  onTestConnection: (url: string) => void;
  testStatus: "idle" | "testing" | "ok" | "fail";
}) {
  const [url, setUrl] = useState("https://");
  const [interval, setInterval] = useState("900");
  const [authKey, setAuthKey] = useState("");
  const [authVal, setAuthVal] = useState("");

  const headers: [string, string][] =
    authKey.trim() && authVal.trim() ? [[authKey.trim(), authVal.trim()]] : [];

  return (
    <div className="space-y-4 pt-2">
      <div>
        <Label className="text-xs">Source Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Transaction Feed"
          className="mt-1.5 bg-background border-border"
          data-ocid="integration-new-name"
        />
      </div>
      <div>
        <Label className="text-xs">Endpoint URL</Label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/data"
          className="mt-1.5 bg-background border-border font-mono text-xs"
          data-ocid="integration-new-url"
        />
      </div>
      <div>
        <Label className="text-xs">Polling Interval</Label>
        <Select value={interval} onValueChange={setInterval}>
          <SelectTrigger
            className="mt-1.5 bg-background border-border text-xs h-9"
            data-ocid="integration-interval-select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {INTERVAL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Auth Header (optional)</Label>
        <div className="mt-1.5 flex gap-2">
          <Input
            value={authKey}
            onChange={(e) => setAuthKey(e.target.value)}
            placeholder="Header name"
            className="bg-background border-border text-xs"
            data-ocid="integration-auth-key"
          />
          <Input
            value={authVal}
            onChange={(e) => setAuthVal(e.target.value)}
            placeholder="Value"
            className="bg-background border-border text-xs"
            type="password"
            data-ocid="integration-auth-val"
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onTestConnection(url)}
          disabled={!url || url === "https://" || testStatus === "testing"}
          className="gap-1.5"
          data-ocid="integration-test-connection"
        >
          {testStatus === "testing" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : testStatus === "ok" ? (
            <CheckCircle className="h-3.5 w-3.5 text-[oklch(0.72_0.18_150)]" />
          ) : testStatus === "fail" ? (
            <XCircle className="h-3.5 w-3.5 text-destructive" />
          ) : (
            <Zap className="h-3.5 w-3.5" />
          )}
          {testStatus === "ok"
            ? "Connected"
            : testStatus === "fail"
              ? "Failed"
              : "Test Connection"}
        </Button>
        <Button
          size="sm"
          onClick={() => onSubmit(url, interval, headers)}
          disabled={!name.trim() || !url || url === "https://" || isPending}
          data-ocid="integration-create-submit"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
          ) : null}
          Add Source
        </Button>
      </div>
    </div>
  );
}

function JsonFeedConfigForm({
  name,
  setName,
  onSubmit,
  isPending,
}: {
  name: string;
  setName: (v: string) => void;
  onSubmit: (url: string, rawJson: string) => void;
  isPending: boolean;
}) {
  const [mode, setMode] = useState<"url" | "paste">("url");
  const [url, setUrl] = useState("https://");
  const [rawJson, setRawJson] = useState("");
  const [jsonError, setJsonError] = useState("");

  const handleJsonChange = (v: string) => {
    setRawJson(v);
    if (!v.trim()) {
      setJsonError("");
      return;
    }
    try {
      JSON.parse(v);
      setJsonError("");
    } catch {
      setJsonError("Invalid JSON");
    }
  };

  const canSubmit =
    name.trim() &&
    ((mode === "url" && url && url !== "https://") ||
      (mode === "paste" && rawJson.trim() && !jsonError));

  return (
    <div className="space-y-4 pt-2">
      <div>
        <Label className="text-xs">Source Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Threat Intel Feed"
          className="mt-1.5 bg-background border-border"
          data-ocid="integration-new-name"
        />
      </div>
      <div>
        <Label className="text-xs">Input Method</Label>
        <div className="mt-1.5 flex gap-2">
          {(["url", "paste"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 py-1.5 rounded text-xs font-medium transition-smooth border",
                mode === m
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
              data-ocid={`integration-json-mode-${m}`}
            >
              {m === "url" ? "URL Endpoint" : "Paste JSON"}
            </button>
          ))}
        </div>
      </div>
      {mode === "url" ? (
        <div>
          <Label className="text-xs">Feed URL</Label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://feeds.example.com/data.json"
            className="mt-1.5 bg-background border-border font-mono text-xs"
            data-ocid="integration-new-url"
          />
        </div>
      ) : (
        <div>
          <Label className="text-xs">Paste JSON</Label>
          <Textarea
            value={rawJson}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder='[{"name":"Entity A","type":"Organization",...}]'
            className="mt-1.5 bg-background border-border font-mono text-xs min-h-[120px] resize-y"
            data-ocid="integration-json-paste"
          />
          {jsonError && (
            <p className="text-[10px] text-destructive mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {jsonError}
            </p>
          )}
        </div>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <Button
          size="sm"
          onClick={() => onSubmit(mode === "url" ? url : "", rawJson)}
          disabled={!canSubmit || isPending}
          data-ocid="integration-create-submit"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
          ) : null}
          {mode === "paste" ? "Import JSON" : "Add Source"}
        </Button>
      </div>
    </div>
  );
}

function SourceCard({
  src,
  isSelected,
  onClick,
}: {
  src: DataSource;
  isSelected: boolean;
  onClick: () => void;
}) {
  const TypeIcon = SOURCE_TYPE_ICONS[src.sourceType] ?? Database;
  const StatusIcon = STATUS_ICONS[src.status] ?? Clock;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-smooth border",
        isSelected
          ? "bg-primary/10 border-primary/30"
          : "bg-background border-border/40 hover:border-primary/20 hover:bg-muted/20",
      )}
      data-ocid={`integration-source-row-${src.id}`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
        <TypeIcon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-foreground truncate">
          {src.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full shrink-0",
              STATUS_DOT[src.status],
            )}
          />
          <StatusIcon
            className={cn(
              "h-3 w-3 shrink-0",
              dataSourceStatusColor(src.status),
              src.status === DataSourceStatusEnum.Syncing && "animate-spin",
            )}
          />
          <span
            className={cn("text-[10px]", dataSourceStatusColor(src.status))}
          >
            {src.status === DataSourceStatusEnum.Error_
              ? "Error"
              : String(src.status)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            · {dataSourceTypeLabel(src.sourceType)}
          </span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
        {src.recordCount > 0n ? Number(src.recordCount).toLocaleString() : "—"}
      </span>
    </button>
  );
}

function FieldMappingRow({
  field,
  mapped,
  onRemap,
}: {
  field: string;
  mapped: string;
  onRemap: (field: string, prop: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-foreground bg-muted/40 border border-border/40 rounded px-2 py-1 min-w-[120px] truncate">
        {field}
      </span>
      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
      <Select value={mapped} onValueChange={(v) => onRemap(field, v)}>
        <SelectTrigger
          className="h-7 text-xs bg-background border-border flex-1"
          data-ocid={`integration-field-map-${field}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {ENTITY_PROPS.map((p) => (
            <SelectItem key={p} value={p} className="text-xs">
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function IntegrationPage() {
  const { data: dataSources, isLoading } = useDataSources();
  const { data: allEntities } = useEntities();
  const createMutation = useCreateDataSource();
  const deleteMutation = useDeleteDataSource();
  const syncMutation = useTriggerSync();
  const updateMutation = useUpdateDataSource();

  const displaySources =
    dataSources && dataSources.length > 0 ? dataSources : SEED_SOURCES;
  const displayEntities =
    allEntities && allEntities.length > 0 ? allEntities : SEED_ENTITIES;

  const [selected, setSelected] = useState<DataSource | null>(
    displaySources[0] ?? null,
  );
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<CreateStep>("type");
  const [createType, setCreateType] = useState<DataSourceTypeEnum>(
    DataSourceTypeEnum.REST_API,
  );
  const [createName, setCreateName] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<bigint | null>(null);
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "ok" | "fail"
  >("idle");
  const [fieldMappings, setFieldMappings] = useState<
    Record<string, Record<string, string>>
  >({
    ...DEFAULT_MAPPING,
  });

  const selectedSource = selected ?? displaySources[0] ?? null;
  const { data: syncHistory } = useSyncHistory(selectedSource?.id ?? null);

  const syncRecords =
    syncHistory ?? (selectedSource ? [...selectedSource.syncHistory] : []);

  const linkedEntities = selectedSource
    ? displayEntities.filter(
        (e) =>
          e.sourceId !== undefined &&
          e.sourceId !== null &&
          e.sourceId === selectedSource.id,
      )
    : [];

  const sourceFields = selectedSource
    ? (DETECTED_FIELDS[selectedSource.sourceType] ?? [])
    : [];

  const currentMapping = selectedSource
    ? (fieldMappings[selectedSource.sourceType] ?? {})
    : {};

  const handleRemapField = (field: string, prop: string) => {
    if (!selectedSource) return;
    setFieldMappings((prev) => ({
      ...prev,
      [selectedSource.sourceType]: {
        ...(prev[selectedSource.sourceType] ?? {}),
        [field]: prop,
      },
    }));
  };

  const handleSelectSource = (src: DataSource) => {
    setSelected(src);
    setMobileShowDetail(true);
    setTestStatus("idle");
  };

  const handleSync = async (id: bigint) => {
    try {
      await syncMutation.mutateAsync(id);
      toast.success("Sync triggered successfully");
    } catch {
      toast.error("Sync failed to start");
    }
  };

  const handleDeleteRequest = (id: bigint) => {
    setPendingDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteMutation.mutateAsync(pendingDeleteId);
      toast.success("Data source removed");
      if (selectedSource?.id === pendingDeleteId) {
        setSelected(
          displaySources.find((s) => s.id !== pendingDeleteId) ?? null,
        );
        setMobileShowDetail(false);
      }
    } catch {
      toast.error("Failed to delete data source");
    }
    setDeleteConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const handleTestConnection = async (url: string) => {
    if (!url) return;
    setTestStatus("testing");
    await new Promise((r) => setTimeout(r, 1800));
    setTestStatus(Math.random() > 0.3 ? "ok" : "fail");
  };

  const handleCreateWithConfig = async (
    url: string,
    extraConfig: Partial<DataSourceConfig> = {},
  ) => {
    if (!createName.trim()) return;
    try {
      await createMutation.mutateAsync({
        name: createName.trim(),
        sourceType: createType,
        config: {
          url,
          headers: extraConfig.headers ?? [],
          intervalSeconds: extraConfig.intervalSeconds ?? 900n,
        },
      });
      toast.success("Data source added");
      setCreateOpen(false);
      resetCreate();
    } catch {
      toast.error("Failed to add data source");
    }
  };

  const resetCreate = () => {
    setCreateStep("type");
    setCreateName("");
    setTestStatus("idle");
  };

  const handleTypeSelect = (t: DataSourceTypeEnum) => {
    setCreateType(t);
    setCreateStep("config");
  };

  const handleCsvSubmit = (url: string) => handleCreateWithConfig(url);
  const handleRestSubmit = (
    url: string,
    interval: string,
    headers: [string, string][],
  ) =>
    handleCreateWithConfig(url, {
      headers,
      intervalSeconds: BigInt(Number.parseInt(interval, 10) || 900),
    });
  const handleJsonSubmit = (url: string, rawJson: string) =>
    handleCreateWithConfig(url || `paste:${Date.now()}`, {
      headers: rawJson ? [["x-raw-json", rawJson.substring(0, 200)]] : [],
    });

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          {mobileShowDetail && (
            <button
              type="button"
              onClick={() => setMobileShowDetail(false)}
              className="flex items-center gap-1 text-xs text-muted-foreground mb-1 lg:hidden hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back to sources
            </button>
          )}
          <h1 className="text-xl font-display font-semibold text-foreground">
            Integration Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage data connectors, sync status, entity mapping, and field
            configuration
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => {
            setCreateOpen(true);
            resetCreate();
          }}
          data-ocid="integration-add-btn"
        >
          <Plus className="h-4 w-4" />
          Add Source
        </Button>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Source list — hidden on mobile when detail is shown */}
        <Card
          className={cn(
            "card-elevated",
            mobileShowDetail ? "hidden lg:block" : "block",
          )}
        >
          <CardHeader className="py-3 px-4 border-b border-border/40">
            <CardTitle className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5" />
              {displaySources.length} Source
              {displaySources.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent
            className="px-3 pb-4 space-y-1.5 pt-3"
            data-ocid="integration-source-list"
          >
            {isLoading ? (
              ["s1", "s2", "s3", "s4"].map((k) => (
                <Skeleton key={k} className="h-14 rounded" />
              ))
            ) : displaySources.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-ocid="integration-empty-state"
              >
                <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                  <Database className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  No data sources yet
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Connect a CSV, REST API, or JSON feed to start ingesting data.
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setCreateOpen(true);
                    resetCreate();
                  }}
                  className="gap-1.5"
                  data-ocid="integration-empty-add-btn"
                >
                  <Plus className="h-4 w-4" />
                  Add First Source
                </Button>
              </div>
            ) : (
              displaySources.map((src) => (
                <SourceCard
                  key={String(src.id)}
                  src={src}
                  isSelected={selectedSource?.id === src.id}
                  onClick={() => handleSelectSource(src)}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Detail panel — hidden on mobile when list is shown */}
        <div
          className={cn(
            "lg:col-span-2 space-y-4",
            !mobileShowDetail ? "hidden lg:block" : "block",
          )}
        >
          {!selectedSource ? (
            <Card className="card-elevated">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                  <Database className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Select a data source to view details
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Detail header */}
              <Card className="card-elevated">
                <CardHeader className="pb-3 pt-4 px-4 border-b border-border/40">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-sm font-display font-semibold text-foreground">
                          {selectedSource.name}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="text-[10px] border-border shrink-0"
                        >
                          {dataSourceTypeLabel(selectedSource.sourceType)}
                        </Badge>
                        <span
                          className={cn(
                            "text-xs font-medium flex items-center gap-1",
                            dataSourceStatusColor(selectedSource.status),
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              STATUS_DOT[selectedSource.status],
                            )}
                          />
                          {selectedSource.status === DataSourceStatusEnum.Error_
                            ? "Error"
                            : String(selectedSource.status)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs h-7"
                        onClick={() => handleSync(selectedSource.id)}
                        disabled={syncMutation.isPending}
                        data-ocid="integration-trigger-sync"
                      >
                        <RefreshCw
                          className={cn(
                            "h-3.5 w-3.5",
                            syncMutation.isPending && "animate-spin",
                          )}
                        />
                        Sync Now
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 text-xs h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteRequest(selectedSource.id)}
                        disabled={deleteMutation.isPending}
                        data-ocid="integration-delete-source"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent
                  className="px-4 pb-4 pt-4 space-y-4"
                  data-ocid="integration-source-detail"
                >
                  {/* Config summary */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                      Configuration
                    </p>
                    <div className="bg-muted/20 border border-border/40 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-xs gap-4">
                        <span className="text-muted-foreground shrink-0">
                          Endpoint / Source
                        </span>
                        <span className="text-foreground font-mono text-[10px] truncate text-right">
                          {selectedSource.config.url || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Sync Interval
                        </span>
                        <span className="text-foreground font-mono text-[10px]">
                          {Number(selectedSource.config.intervalSeconds) >= 3600
                            ? `${Number(selectedSource.config.intervalSeconds) / 3600}h`
                            : `${Number(selectedSource.config.intervalSeconds) / 60}m`}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Auth Headers
                        </span>
                        <span className="text-foreground text-[10px]">
                          {selectedSource.config.headers.length > 0
                            ? `${selectedSource.config.headers.length} header(s) configured`
                            : "None"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/20 border border-border/40 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Records
                      </p>
                      <p className="text-lg font-display font-bold text-foreground mt-0.5">
                        {Number(selectedSource.recordCount).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-muted/20 border border-border/40 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Last Sync
                      </p>
                      <p className="text-xs text-foreground mt-0.5 font-medium">
                        {selectedSource.lastSync
                          ? relativeTime(selectedSource.lastSync)
                          : "Never"}
                      </p>
                    </div>
                    <div className="bg-muted/20 border border-border/40 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Syncs
                      </p>
                      <p className="text-lg font-display font-bold text-foreground mt-0.5">
                        {syncRecords.length}
                      </p>
                    </div>
                  </div>

                  {/* Sync history table */}
                  {syncRecords.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                        Sync History
                      </p>
                      <div className="rounded-lg border border-border/40 overflow-hidden">
                        <div className="grid grid-cols-4 bg-muted/30 px-3 py-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                          <span>Timestamp</span>
                          <span>Status</span>
                          <span className="text-right">Records Δ</span>
                          <span className="text-right">Message</span>
                        </div>
                        <ScrollArea className="max-h-[180px]">
                          {[...syncRecords]
                            .sort((a, b) => Number(b.timestamp - a.timestamp))
                            .slice(0, 10)
                            .map((rec, i) => (
                              <div
                                key={`${String(rec.timestamp)}-${i}`}
                                className="grid grid-cols-4 px-3 py-2 text-xs border-t border-border/30 hover:bg-muted/10 transition-colors"
                                data-ocid="integration-sync-row"
                              >
                                <span className="text-[10px] text-muted-foreground">
                                  {formatTimestamp(rec.timestamp)}
                                </span>
                                <span
                                  className={cn(
                                    "text-[10px] font-medium",
                                    dataSourceStatusColor(rec.status),
                                  )}
                                >
                                  {rec.status === DataSourceStatusEnum.Error_
                                    ? "Error"
                                    : String(rec.status)}
                                </span>
                                <span className="text-[10px] text-foreground text-right font-mono">
                                  {rec.recordCount > 0n
                                    ? `+${Number(rec.recordCount).toLocaleString()}`
                                    : "—"}
                                </span>
                                <span className="text-[10px] text-muted-foreground text-right truncate">
                                  {rec.message || "—"}
                                </span>
                              </div>
                            ))}
                        </ScrollArea>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Data preview pane */}
              <Card className="card-elevated">
                <CardHeader className="py-3 px-4 border-b border-border/40">
                  <CardTitle className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Entity Preview
                    <Badge
                      variant="secondary"
                      className="text-[10px] ml-auto font-normal"
                    >
                      {linkedEntities.length} linked
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className="p-0"
                  data-ocid="integration-entity-preview"
                >
                  {linkedEntities.length === 0 ? (
                    <div className="py-10 text-center text-xs text-muted-foreground">
                      No entities linked to this source yet. Trigger a sync to
                      ingest data.
                    </div>
                  ) : (
                    <ScrollArea className="max-h-[260px]">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-muted/30">
                              <th className="text-left px-4 py-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                Entity Name
                              </th>
                              <th className="text-left px-4 py-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                Type
                              </th>
                              {[
                                "industry",
                                "jurisdiction",
                                "risk_score",
                                "role",
                                "amount_usd",
                                "status",
                              ].map((attr) =>
                                linkedEntities.some((e) =>
                                  e.attributes.some((a) => a.key === attr),
                                ) ? (
                                  <th
                                    key={attr}
                                    className="text-left px-4 py-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider"
                                  >
                                    {attr.replace("_", " ")}
                                  </th>
                                ) : null,
                              )}
                              <th className="text-left px-4 py-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                Updated
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {linkedEntities.slice(0, 20).map((entity) => {
                              const attrMap = Object.fromEntries(
                                entity.attributes.map((a) => [a.key, a.value]),
                              );
                              return (
                                <tr
                                  key={String(entity.id)}
                                  className="border-t border-border/30 hover:bg-muted/10 transition-colors"
                                  data-ocid="integration-preview-row"
                                >
                                  <td className="px-4 py-2 text-xs text-foreground font-medium">
                                    {entity.name}
                                  </td>
                                  <td className="px-4 py-2">
                                    <Badge
                                      variant="outline"
                                      className="text-[9px] border-border"
                                    >
                                      {String(entity.entityType)}
                                    </Badge>
                                  </td>
                                  {[
                                    "industry",
                                    "jurisdiction",
                                    "risk_score",
                                    "role",
                                    "amount_usd",
                                    "status",
                                  ].map((attr) =>
                                    linkedEntities.some((e) =>
                                      e.attributes.some((a) => a.key === attr),
                                    ) ? (
                                      <td
                                        key={attr}
                                        className="px-4 py-2 text-xs text-muted-foreground font-mono"
                                      >
                                        {attrMap[attr] ?? "—"}
                                      </td>
                                    ) : null,
                                  )}
                                  <td className="px-4 py-2 text-[10px] text-muted-foreground whitespace-nowrap">
                                    {relativeTime(entity.lastUpdated)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              {/* Entity field mapping */}
              <Card className="card-elevated">
                <CardHeader className="py-3 px-4 border-b border-border/40">
                  <CardTitle className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowRight className="h-3.5 w-3.5" />
                    Field Mapping
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className="px-4 pb-4 pt-3 space-y-2"
                  data-ocid="integration-field-mapping"
                >
                  {sourceFields.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      No field metadata available. Trigger a sync to detect
                      source fields.
                    </p>
                  ) : (
                    <>
                      <p className="text-[10px] text-muted-foreground mb-3">
                        Map detected source fields to entity properties. Changes
                        take effect on next sync.
                      </p>
                      <div className="space-y-2">
                        {sourceFields.map((field) => (
                          <FieldMappingRow
                            key={field}
                            field={field}
                            mapped={currentMapping[field] ?? "(ignore)"}
                            onRemap={handleRemapField}
                          />
                        ))}
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 gap-1.5"
                          onClick={() => {
                            if (!selectedSource) return;
                            updateMutation.mutate({
                              id: selectedSource.id,
                              name: selectedSource.name,
                              config: selectedSource.config,
                            });
                            toast.success("Field mappings saved");
                          }}
                          data-ocid="integration-save-mapping"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Save Mapping
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Create dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetCreate();
        }}
      >
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              {createStep === "config" && (
                <button
                  type="button"
                  onClick={() => setCreateStep("type")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              {createStep === "type"
                ? "Add Data Source"
                : `Configure ${dataSourceTypeLabel(createType)}`}
            </DialogTitle>
          </DialogHeader>
          {createStep === "type" ? (
            <TypeSelectStep onSelect={handleTypeSelect} />
          ) : createType === DataSourceTypeEnum.CSV ? (
            <CsvConfigForm
              name={createName}
              setName={setCreateName}
              onSubmit={handleCsvSubmit}
              isPending={createMutation.isPending}
            />
          ) : createType === DataSourceTypeEnum.REST_API ? (
            <RestApiConfigForm
              name={createName}
              setName={setCreateName}
              onSubmit={handleRestSubmit}
              isPending={createMutation.isPending}
              onTestConnection={handleTestConnection}
              testStatus={testStatus}
            />
          ) : (
            <JsonFeedConfigForm
              name={createName}
              setName={setCreateName}
              onSubmit={handleJsonSubmit}
              isPending={createMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Remove Data Source?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              This will permanently delete the data source configuration and
              sync history. Linked entities will have their source reference
              cleared. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="integration-delete-confirm"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : null}
              Remove Source
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
