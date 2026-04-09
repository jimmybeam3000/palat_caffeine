import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  AnomalyAction,
  AnomalyRule,
  AnomalyRuleId,
  Attribute,
  DataSource,
  DataSourceConfig,
  DataSourceId,
  DataSourceType,
  Entity,
  EntityId,
  EntityType,
  Incident,
  IncidentId,
  IncidentStatus,
  Investigation,
  InvestigationId,
  Relationship,
  Severity,
  SyncRecord,
} from "../backend.d.ts";

// ─────────── Entities ───────────

export function useEntities() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Entity[]>({
    queryKey: ["entities"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listEntities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEntity(id: EntityId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Entity | null>({
    queryKey: ["entity", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getEntity(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateEntity() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      name: string;
      entityType: EntityType;
      attributes: Attribute[];
      relationships: Relationship[];
      sourceId: DataSourceId | null;
    }) =>
      actor!.addEntity(
        args.name,
        args.entityType,
        args.attributes,
        args.relationships,
        args.sourceId,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["entities"] }),
  });
}

export function useUpdateEntity() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      id: EntityId;
      name: string;
      entityType: EntityType;
      attributes: Attribute[];
      relationships: Relationship[];
    }) =>
      actor!.updateEntity(
        args.id,
        args.name,
        args.entityType,
        args.attributes,
        args.relationships,
      ),
    onSuccess: (_r, vars) =>
      qc.invalidateQueries({ queryKey: ["entity", vars.id.toString()] }),
  });
}

export function useDeleteEntity() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: EntityId) => actor!.deleteEntity(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["entities"] }),
  });
}

// ─────────── Incidents ───────────

export function useIncidents() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Incident[]>({
    queryKey: ["incidents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listIncidents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIncident(id: IncidentId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Incident | null>({
    queryKey: ["incident", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getIncident(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateIncident() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      title: string;
      description: string;
      severity: Severity;
      relatedEntityIds: EntityId[];
    }) =>
      actor!.addIncident(
        args.title,
        args.description,
        args.severity,
        args.relatedEntityIds,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incidents"] }),
  });
}

export function useUpdateIncident() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      id: IncidentId;
      title: string;
      description: string;
      severity: Severity;
      status: IncidentStatus;
      notes: string;
    }) =>
      actor!.updateIncident(
        args.id,
        args.title,
        args.description,
        args.severity,
        args.status,
        args.notes,
      ),
    onSuccess: (_r, vars) =>
      qc.invalidateQueries({ queryKey: ["incident", vars.id.toString()] }),
  });
}

export function useDeleteIncident() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: IncidentId) => actor!.deleteIncident(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incidents"] }),
  });
}

export function useAddTimelineEvent() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: IncidentId; eventType: string; note: string }) =>
      actor!.addIncidentEvent(args.id, args.eventType, args.note),
    onSuccess: (_r, vars) =>
      qc.invalidateQueries({ queryKey: ["incident", vars.id.toString()] }),
  });
}

// ─────────── Data Sources ───────────

export function useDataSources() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DataSource[]>({
    queryKey: ["dataSources"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDataSources();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDataSource(id: DataSourceId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DataSource | null>({
    queryKey: ["dataSource", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getDataSource(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useSyncHistory(id: DataSourceId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<SyncRecord[] | null>({
    queryKey: ["syncHistory", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getSyncHistory(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateDataSource() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      name: string;
      sourceType: DataSourceType;
      config: DataSourceConfig;
    }) => actor!.addDataSource(args.name, args.sourceType, args.config),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dataSources"] }),
  });
}

export function useUpdateDataSource() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      id: DataSourceId;
      name: string;
      config: DataSourceConfig;
    }) => actor!.updateDataSource(args.id, args.name, args.config),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dataSources"] }),
  });
}

export function useDeleteDataSource() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: DataSourceId) => actor!.deleteDataSource(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dataSources"] }),
  });
}

export function useTriggerSync() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: DataSourceId) => actor!.triggerDataSourceSync(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dataSources"] }),
  });
}

// ─────────── Investigations ───────────

export function useInvestigations() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Investigation[]>({
    queryKey: ["investigations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listInvestigations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useInvestigation(id: InvestigationId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Investigation | null>({
    queryKey: ["investigation", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getInvestigation(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateInvestigation() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { name: string; entityIds: EntityId[] }) =>
      actor!.saveInvestigation(args.name, args.entityIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["investigations"] }),
  });
}

export function useUpdateInvestigation() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      id: InvestigationId;
      name: string;
      entityIds: EntityId[];
    }) => actor!.updateInvestigation(args.id, args.name, args.entityIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["investigations"] }),
  });
}

export function useDeleteInvestigation() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: InvestigationId) => actor!.deleteInvestigation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["investigations"] }),
  });
}

// ─────────── Anomaly Rules ───────────

export function useAnomalyRules() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AnomalyRule[]>({
    queryKey: ["anomalyRules"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAnomalyRules();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateAnomalyRule() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      name: string;
      entityType: EntityType;
      threshold: number;
      action: AnomalyAction;
    }) =>
      actor!.addAnomalyRule(
        args.name,
        args.entityType,
        args.threshold,
        args.action,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["anomalyRules"] }),
  });
}

export function useUpdateAnomalyRule() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      id: AnomalyRuleId;
      name: string;
      entityType: EntityType;
      threshold: number;
      action: AnomalyAction;
    }) =>
      actor!.updateAnomalyRule(
        args.id,
        args.name,
        args.entityType,
        args.threshold,
        args.action,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["anomalyRules"] }),
  });
}

export function useDeleteAnomalyRule() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: AnomalyRuleId) => actor!.deleteAnomalyRule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["anomalyRules"] }),
  });
}
