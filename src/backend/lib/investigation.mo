import Common "../types/common";
import Types "../types/investigation";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public func listInvestigations(investigations : List.List<Types.Investigation>) : [Types.Investigation] {
    investigations.toArray();
  };

  public func getInvestigation(investigations : List.List<Types.Investigation>, id : Common.InvestigationId) : ?Types.Investigation {
    investigations.find(func(inv) { inv.id == id });
  };

  public func createInvestigation(
    investigations : List.List<Types.Investigation>,
    nextId : Nat,
    name : Text,
    entityIds : [Common.EntityId],
  ) : Types.Investigation {
    let inv : Types.Investigation = {
      id = nextId;
      name;
      entityIds;
      createdAt = Time.now();
    };
    investigations.add(inv);
    inv;
  };

  public func updateInvestigation(
    investigations : List.List<Types.Investigation>,
    id : Common.InvestigationId,
    name : Text,
    entityIds : [Common.EntityId],
  ) : Bool {
    switch (investigations.findIndex(func(inv) { inv.id == id })) {
      case null { false };
      case (?idx) {
        let existing = investigations.at(idx);
        investigations.put(idx, { existing with name; entityIds });
        true;
      };
    };
  };

  public func deleteInvestigation(investigations : List.List<Types.Investigation>, id : Common.InvestigationId) : Bool {
    let sizeBefore = investigations.size();
    let filtered = investigations.filter(func(inv) { inv.id != id });
    investigations.clear();
    investigations.append(filtered);
    investigations.size() < sizeBefore;
  };
};
