import Common "common";

module {
  public type EntityType = { #Person; #Organization; #Asset; #Event };

  public type Attribute = {
    key : Text;
    value : Text;
  };

  public type Relationship = {
    targetId : Common.EntityId;
    relationshipType : Text;
  };

  public type Entity = {
    id : Common.EntityId;
    name : Text;
    entityType : EntityType;
    attributes : [Attribute];
    relationships : [Relationship];
    sourceId : ?Common.DataSourceId;
    lastUpdated : Common.Timestamp;
  };
};
