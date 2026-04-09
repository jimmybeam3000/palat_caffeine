import Common "../types/common";
import Types "../types/anomaly";
import EntityTypes "../types/entity";
import List "mo:core/List";

module {
  public func listAnomalyRules(rules : List.List<Types.AnomalyRule>) : [Types.AnomalyRule] {
    rules.toArray();
  };

  public func getAnomalyRule(rules : List.List<Types.AnomalyRule>, id : Common.AnomalyRuleId) : ?Types.AnomalyRule {
    rules.find(func(r) { r.id == id });
  };

  public func createAnomalyRule(
    rules : List.List<Types.AnomalyRule>,
    nextId : Nat,
    name : Text,
    entityType : EntityTypes.EntityType,
    threshold : Float,
    action : Types.AnomalyAction,
  ) : Types.AnomalyRule {
    let rule : Types.AnomalyRule = {
      id = nextId;
      name;
      entityType;
      threshold;
      action;
    };
    rules.add(rule);
    rule;
  };

  public func updateAnomalyRule(
    rules : List.List<Types.AnomalyRule>,
    id : Common.AnomalyRuleId,
    name : Text,
    entityType : EntityTypes.EntityType,
    threshold : Float,
    action : Types.AnomalyAction,
  ) : Bool {
    switch (rules.findIndex(func(r) { r.id == id })) {
      case null { false };
      case (?idx) {
        let existing = rules.at(idx);
        rules.put(idx, { existing with name; entityType; threshold; action });
        true;
      };
    };
  };

  public func deleteAnomalyRule(rules : List.List<Types.AnomalyRule>, id : Common.AnomalyRuleId) : Bool {
    let sizeBefore = rules.size();
    let filtered = rules.filter(func(r) { r.id != id });
    rules.clear();
    rules.append(filtered);
    rules.size() < sizeBefore;
  };

  public func seedAnomalyRules(rules : List.List<Types.AnomalyRule>, startId : Nat) : Nat {
    let seed : [Types.AnomalyRule] = [
      {
        id = startId;
        name = "High-Value Asset Access Spike";
        entityType = #Asset;
        threshold = 10.0;
        action = #Alert;
      },
      {
        id = startId + 1;
        name = "Person Relationship Anomaly";
        entityType = #Person;
        threshold = 5.0;
        action = #Flag;
      },
      {
        id = startId + 2;
        name = "Organization Activity Surge";
        entityType = #Organization;
        threshold = 20.0;
        action = #Alert;
      },
      {
        id = startId + 3;
        name = "Event Frequency Alert";
        entityType = #Event;
        threshold = 3.0;
        action = #Flag;
      },
    ];
    for (r in seed.vals()) {
      rules.add(r);
    };
    startId + seed.size();
  };
};
