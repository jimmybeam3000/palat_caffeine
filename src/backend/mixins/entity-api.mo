import Common "../types/common";
import Types "../types/entity";
import EntityLib "../lib/entity";
import List "mo:core/List";

mixin (
  entities : List.List<Types.Entity>,
  counter : Common.Counter,
) {
  public query func listEntities() : async [Types.Entity] {
    EntityLib.listEntities(entities);
  };

  public query func getEntity(id : Common.EntityId) : async ?Types.Entity {
    EntityLib.getEntity(entities, id);
  };

  public func addEntity(
    name : Text,
    entityType : Types.EntityType,
    attributes : [Types.Attribute],
    relationships : [Types.Relationship],
    sourceId : ?Common.DataSourceId,
  ) : async Types.Entity {
    let entity = EntityLib.createEntity(entities, counter.value, name, entityType, attributes, relationships, sourceId);
    counter.value += 1;
    entity;
  };

  public func updateEntity(
    id : Common.EntityId,
    name : Text,
    entityType : Types.EntityType,
    attributes : [Types.Attribute],
    relationships : [Types.Relationship],
  ) : async Bool {
    EntityLib.updateEntity(entities, id, name, entityType, attributes, relationships);
  };

  public func deleteEntity(id : Common.EntityId) : async Bool {
    EntityLib.deleteEntity(entities, id);
  };
};
