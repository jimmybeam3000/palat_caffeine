import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Investigation {
    id: InvestigationId;
    name: string;
    createdAt: Timestamp;
    entityIds: Array<EntityId>;
}
export type IncidentId = bigint;
export type EntityId = bigint;
export type AnomalyRuleId = bigint;
export type InvestigationId = bigint;
export interface TimelineEvent {
    note: string;
    timestamp: Timestamp;
    eventType: string;
}
export interface Entity {
    id: EntityId;
    name: string;
    lastUpdated: Timestamp;
    sourceId?: DataSourceId;
    attributes: Array<Attribute>;
    entityType: EntityType;
    relationships: Array<Relationship>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface SyncRecord {
    status: DataSourceStatus;
    message: string;
    timestamp: Timestamp;
    recordCount: bigint;
}
export interface AnomalyRule {
    id: AnomalyRuleId;
    action: AnomalyAction;
    threshold: number;
    name: string;
    entityType: EntityType;
}
export interface DataSource {
    id: DataSourceId;
    status: DataSourceStatus;
    name: string;
    sourceType: DataSourceType;
    syncHistory: Array<SyncRecord>;
    config: DataSourceConfig;
    lastSync?: Timestamp;
    recordCount: bigint;
}
export interface DataSourceConfig {
    url: string;
    headers: Array<[string, string]>;
    intervalSeconds: bigint;
}
export interface Incident {
    id: IncidentId;
    status: IncidentStatus;
    title: string;
    relatedEntityIds: Array<EntityId>;
    createdAt: Timestamp;
    description: string;
    updatedAt: Timestamp;
    notes: string;
    severity: Severity;
    timeline: Array<TimelineEvent>;
}
export interface Attribute {
    key: string;
    value: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type DataSourceId = bigint;
export interface Relationship {
    targetId: EntityId;
    relationshipType: string;
}
export enum AnomalyAction {
    Flag = "Flag",
    Alert = "Alert"
}
export enum DataSourceStatus {
    Error_ = "Error",
    Idle = "Idle",
    Connected = "Connected",
    Syncing = "Syncing"
}
export enum DataSourceType {
    CSV = "CSV",
    REST_API = "REST_API",
    JSON_Feed = "JSON_Feed"
}
export enum EntityType {
    Event = "Event",
    Person = "Person",
    Organization = "Organization",
    Asset = "Asset"
}
export enum IncidentStatus {
    Open = "Open",
    Closed = "Closed",
    Investigating = "Investigating"
}
export enum Severity {
    Low = "Low",
    High = "High",
    Medium = "Medium",
    Critical = "Critical"
}
export interface backendInterface {
    addAnomalyRule(name: string, entityType: EntityType, threshold: number, action: AnomalyAction): Promise<AnomalyRule>;
    addDataSource(name: string, sourceType: DataSourceType, config: DataSourceConfig): Promise<DataSource>;
    addEntity(name: string, entityType: EntityType, attributes: Array<Attribute>, relationships: Array<Relationship>, sourceId: DataSourceId | null): Promise<Entity>;
    addIncident(title: string, description: string, severity: Severity, relatedEntityIds: Array<EntityId>): Promise<Incident>;
    addIncidentEvent(id: IncidentId, eventType: string, note: string): Promise<boolean>;
    deleteAnomalyRule(id: AnomalyRuleId): Promise<boolean>;
    deleteDataSource(id: DataSourceId): Promise<boolean>;
    deleteEntity(id: EntityId): Promise<boolean>;
    deleteIncident(id: IncidentId): Promise<boolean>;
    deleteInvestigation(id: InvestigationId): Promise<boolean>;
    getAnomalyRule(id: AnomalyRuleId): Promise<AnomalyRule | null>;
    getDataSource(id: DataSourceId): Promise<DataSource | null>;
    getEntity(id: EntityId): Promise<Entity | null>;
    getIncident(id: IncidentId): Promise<Incident | null>;
    getInvestigation(id: InvestigationId): Promise<Investigation | null>;
    getSyncHistory(id: DataSourceId): Promise<Array<SyncRecord> | null>;
    listAnomalyRules(): Promise<Array<AnomalyRule>>;
    listDataSources(): Promise<Array<DataSource>>;
    listEntities(): Promise<Array<Entity>>;
    listIncidents(): Promise<Array<Incident>>;
    listInvestigations(): Promise<Array<Investigation>>;
    saveInvestigation(name: string, entityIds: Array<EntityId>): Promise<Investigation>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    triggerDataSourceSync(id: DataSourceId): Promise<string>;
    updateAnomalyRule(id: AnomalyRuleId, name: string, entityType: EntityType, threshold: number, action: AnomalyAction): Promise<boolean>;
    updateDataSource(id: DataSourceId, name: string, config: DataSourceConfig): Promise<boolean>;
    updateDataSourceSync(id: DataSourceId, status: DataSourceStatus, recordCount: bigint, message: string): Promise<boolean>;
    updateEntity(id: EntityId, name: string, entityType: EntityType, attributes: Array<Attribute>, relationships: Array<Relationship>): Promise<boolean>;
    updateIncident(id: IncidentId, title: string, description: string, severity: Severity, status: IncidentStatus, notes: string): Promise<boolean>;
    updateInvestigation(id: InvestigationId, name: string, entityIds: Array<EntityId>): Promise<boolean>;
}
