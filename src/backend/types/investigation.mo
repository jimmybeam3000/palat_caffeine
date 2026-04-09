import Common "common";

module {
  public type Investigation = {
    id : Common.InvestigationId;
    name : Text;
    entityIds : [Common.EntityId];
    createdAt : Common.Timestamp;
  };
};
