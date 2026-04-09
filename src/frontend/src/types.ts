// Re-export all types from backend.d.ts so pages can import from a single location
export type {
  Entity,
  EntityId,
  EntityType,
  Attribute,
  Relationship,
  Incident,
  IncidentId,
  IncidentStatus,
  Severity,
  TimelineEvent,
  DataSource,
  DataSourceId,
  DataSourceType,
  DataSourceStatus,
  DataSourceConfig,
  SyncRecord,
  Investigation,
  InvestigationId,
  AnomalyRule,
  AnomalyRuleId,
  AnomalyAction,
  Timestamp,
} from "./backend.d.ts";

export {
  EntityType as EntityTypeEnum,
  IncidentStatus as IncidentStatusEnum,
  Severity as SeverityEnum,
  DataSourceType as DataSourceTypeEnum,
  DataSourceStatus as DataSourceStatusEnum,
  AnomalyAction as AnomalyActionEnum,
} from "./backend";
