import Common "../types/common";
import Types "../types/anomaly";
import EntityTypes "../types/entity";
import AnomalyLib "../lib/anomaly";
import List "mo:core/List";

mixin (
  anomalyRules : List.List<Types.AnomalyRule>,
  counter : Common.Counter,
) {
  public query func listAnomalyRules() : async [Types.AnomalyRule] {
    AnomalyLib.listAnomalyRules(anomalyRules);
  };

  public query func getAnomalyRule(id : Common.AnomalyRuleId) : async ?Types.AnomalyRule {
    AnomalyLib.getAnomalyRule(anomalyRules, id);
  };

  public func addAnomalyRule(
    name : Text,
    entityType : EntityTypes.EntityType,
    threshold : Float,
    action : Types.AnomalyAction,
  ) : async Types.AnomalyRule {
    let rule = AnomalyLib.createAnomalyRule(anomalyRules, counter.value, name, entityType, threshold, action);
    counter.value += 1;
    rule;
  };

  public func updateAnomalyRule(
    id : Common.AnomalyRuleId,
    name : Text,
    entityType : EntityTypes.EntityType,
    threshold : Float,
    action : Types.AnomalyAction,
  ) : async Bool {
    AnomalyLib.updateAnomalyRule(anomalyRules, id, name, entityType, threshold, action);
  };

  public func deleteAnomalyRule(id : Common.AnomalyRuleId) : async Bool {
    AnomalyLib.deleteAnomalyRule(anomalyRules, id);
  };
};
