import Common "types/common";
import EntityTypes "types/entity";
import IncidentTypes "types/incident";
import DataSourceTypes "types/datasource";
import InvestigationTypes "types/investigation";
import AnomalyTypes "types/anomaly";
import EntityMixin "mixins/entity-api";
import IncidentMixin "mixins/incident-api";
import DataSourceMixin "mixins/datasource-api";
import InvestigationMixin "mixins/investigation-api";
import AnomalyMixin "mixins/anomaly-api";
import ObjectStorage "mo:caffeineai-object-storage/Mixin";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import EntityLib "lib/entity";
import IncidentLib "lib/incident";
import DataSourceLib "lib/datasource";
import AnomalyLib "lib/anomaly";
import List "mo:core/List";

actor {
  // State
  let entities = List.empty<EntityTypes.Entity>();
  let entityCounter = Common.newCounter(1);

  let incidents = List.empty<IncidentTypes.Incident>();
  let incidentCounter = Common.newCounter(1);

  let sources = List.empty<DataSourceTypes.DataSource>();
  let sourceCounter = Common.newCounter(1);

  let investigations = List.empty<InvestigationTypes.Investigation>();
  let investigationCounter = Common.newCounter(1);

  let anomalyRules = List.empty<AnomalyTypes.AnomalyRule>();
  let anomalyRuleCounter = Common.newCounter(1);

  // HTTP outcall transform (required by http-outcalls extension)
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Seed data on first init
  entityCounter.value := EntityLib.seedEntities(entities, entityCounter.value);
  incidentCounter.value := IncidentLib.seedIncidents(incidents, incidentCounter.value);
  sourceCounter.value := DataSourceLib.seedDataSources(sources, sourceCounter.value);
  anomalyRuleCounter.value := AnomalyLib.seedAnomalyRules(anomalyRules, anomalyRuleCounter.value);

  // Object storage for CSV uploads
  include ObjectStorage();

  // Domain API mixins
  include EntityMixin(entities, entityCounter);
  include IncidentMixin(incidents, incidentCounter);
  include DataSourceMixin(sources, sourceCounter, transform);
  include InvestigationMixin(investigations, investigationCounter);
  include AnomalyMixin(anomalyRules, anomalyRuleCounter);
};
