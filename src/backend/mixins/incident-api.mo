import Common "../types/common";
import Types "../types/incident";
import IncidentLib "../lib/incident";
import List "mo:core/List";

mixin (
  incidents : List.List<Types.Incident>,
  counter : Common.Counter,
) {
  public query func listIncidents() : async [Types.Incident] {
    IncidentLib.listIncidents(incidents);
  };

  public query func getIncident(id : Common.IncidentId) : async ?Types.Incident {
    IncidentLib.getIncident(incidents, id);
  };

  public func addIncident(
    title : Text,
    description : Text,
    severity : Types.Severity,
    relatedEntityIds : [Common.EntityId],
  ) : async Types.Incident {
    let incident = IncidentLib.createIncident(incidents, counter.value, title, description, severity, relatedEntityIds);
    counter.value += 1;
    incident;
  };

  public func updateIncident(
    id : Common.IncidentId,
    title : Text,
    description : Text,
    severity : Types.Severity,
    status : Types.IncidentStatus,
    notes : Text,
  ) : async Bool {
    IncidentLib.updateIncident(incidents, id, title, description, severity, status, notes);
  };

  public func addIncidentEvent(
    id : Common.IncidentId,
    eventType : Text,
    note : Text,
  ) : async Bool {
    IncidentLib.addTimelineEvent(incidents, id, eventType, note);
  };

  public func deleteIncident(id : Common.IncidentId) : async Bool {
    IncidentLib.deleteIncident(incidents, id);
  };
};
