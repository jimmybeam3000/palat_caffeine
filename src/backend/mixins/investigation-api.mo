import Common "../types/common";
import Types "../types/investigation";
import InvestigationLib "../lib/investigation";
import List "mo:core/List";

mixin (
  investigations : List.List<Types.Investigation>,
  counter : Common.Counter,
) {
  public query func listInvestigations() : async [Types.Investigation] {
    InvestigationLib.listInvestigations(investigations);
  };

  public query func getInvestigation(id : Common.InvestigationId) : async ?Types.Investigation {
    InvestigationLib.getInvestigation(investigations, id);
  };

  public func saveInvestigation(
    name : Text,
    entityIds : [Common.EntityId],
  ) : async Types.Investigation {
    let inv = InvestigationLib.createInvestigation(investigations, counter.value, name, entityIds);
    counter.value += 1;
    inv;
  };

  public func updateInvestigation(
    id : Common.InvestigationId,
    name : Text,
    entityIds : [Common.EntityId],
  ) : async Bool {
    InvestigationLib.updateInvestigation(investigations, id, name, entityIds);
  };

  public func deleteInvestigation(id : Common.InvestigationId) : async Bool {
    InvestigationLib.deleteInvestigation(investigations, id);
  };
};
