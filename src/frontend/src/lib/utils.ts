import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  AnomalyActionEnum,
  DataSourceStatusEnum,
  DataSourceTypeEnum,
  EntityTypeEnum,
  IncidentStatusEnum,
  SeverityEnum,
} from "../types";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Returns the left-border accent class for an entity type */
export function entityTypeClass(type: string): string {
  const map: Record<string, string> = {
    [EntityTypeEnum.Person]: "entity-person",
    [EntityTypeEnum.Organization]: "entity-org",
    [EntityTypeEnum.Asset]: "entity-asset",
    [EntityTypeEnum.Event]: "entity-event",
  };
  return map[type] ?? "border-l-4 border-l-border";
}

/** Returns a text color class for a severity level */
export function severityClass(severity: string): string {
  const map: Record<string, string> = {
    [SeverityEnum.Critical]: "severity-critical",
    [SeverityEnum.High]: "severity-high",
    [SeverityEnum.Medium]: "severity-medium",
    [SeverityEnum.Low]: "severity-low",
  };
  return map[severity] ?? "text-muted-foreground";
}

/** Returns bg+text badge class for an incident status */
export function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    [IncidentStatusEnum.Open]: "status-open",
    [IncidentStatusEnum.Investigating]: "status-investigating",
    [IncidentStatusEnum.Closed]: "status-closed",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
}

/** Returns a dot color class for a data source status */
export function dataSourceStatusColor(status: string): string {
  const map: Record<string, string> = {
    [DataSourceStatusEnum.Connected]: "text-[oklch(0.72_0.18_150)]",
    [DataSourceStatusEnum.Syncing]: "text-[oklch(0.72_0.2_90)]",
    [DataSourceStatusEnum.Error_]: "text-[oklch(0.62_0.22_25)]",
    [DataSourceStatusEnum.Idle]: "text-muted-foreground",
  };
  return map[status] ?? "text-muted-foreground";
}

/** Human-readable label for data source type */
export function dataSourceTypeLabel(type: string): string {
  const map: Record<string, string> = {
    [DataSourceTypeEnum.CSV]: "CSV",
    [DataSourceTypeEnum.REST_API]: "REST API",
    [DataSourceTypeEnum.JSON_Feed]: "JSON Feed",
  };
  return map[type] ?? type;
}

/** Human-readable label for anomaly action */
export function anomalyActionLabel(action: string): string {
  return action === AnomalyActionEnum.Flag ? "Flag" : "Alert";
}

/** Format a bigint nanosecond timestamp as a locale date/time string */
export function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Relative time: "2 hours ago" */
export function relativeTime(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
