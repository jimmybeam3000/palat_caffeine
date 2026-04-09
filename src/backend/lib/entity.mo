import Common "../types/common";
import Types "../types/entity";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public func listEntities(entities : List.List<Types.Entity>) : [Types.Entity] {
    entities.toArray();
  };

  public func getEntity(entities : List.List<Types.Entity>, id : Common.EntityId) : ?Types.Entity {
    entities.find(func(e) { e.id == id });
  };

  public func createEntity(
    entities : List.List<Types.Entity>,
    nextId : Nat,
    name : Text,
    entityType : Types.EntityType,
    attributes : [Types.Attribute],
    relationships : [Types.Relationship],
    sourceId : ?Common.DataSourceId,
  ) : Types.Entity {
    let entity : Types.Entity = {
      id = nextId;
      name;
      entityType;
      attributes;
      relationships;
      sourceId;
      lastUpdated = Time.now();
    };
    entities.add(entity);
    entity;
  };

  public func updateEntity(
    entities : List.List<Types.Entity>,
    id : Common.EntityId,
    name : Text,
    entityType : Types.EntityType,
    attributes : [Types.Attribute],
    relationships : [Types.Relationship],
  ) : Bool {
    switch (entities.findIndex(func(e) { e.id == id })) {
      case null { false };
      case (?idx) {
        let existing = entities.at(idx);
        entities.put(
          idx,
          {
            existing with
            name;
            entityType;
            attributes;
            relationships;
            lastUpdated = Time.now();
          },
        );
        true;
      };
    };
  };

  public func deleteEntity(entities : List.List<Types.Entity>, id : Common.EntityId) : Bool {
    let sizeBefore = entities.size();
    let filtered = entities.filter(func(e) { e.id != id });
    entities.clear();
    entities.append(filtered);
    entities.size() < sizeBefore;
  };

  public func seedEntities(entities : List.List<Types.Entity>, startId : Nat) : Nat {
    let now = Time.now();
    let seed : [Types.Entity] = [
      // Persons
      {
        id = startId;
        name = "Alexandra Chen";
        entityType = #Person;
        attributes = [
          { key = "role"; value = "Senior Analyst" },
          { key = "department"; value = "Intelligence" },
          { key = "clearance"; value = "Top Secret" },
        ];
        relationships = [
          { targetId = startId + 5; relationshipType = "works_for" },
          { targetId = startId + 10; relationshipType = "involved_in" },
        ];
        sourceId = null;
        lastUpdated = now;
      },
      {
        id = startId + 1;
        name = "Marcus Webb";
        entityType = #Person;
        attributes = [
          { key = "role"; value = "Field Operative" },
          { key = "status"; value = "Active" },
          { key = "region"; value = "EMEA" },
        ];
        relationships = [
          { targetId = startId + 5; relationshipType = "works_for" },
          { targetId = startId + 11; relationshipType = "observed_at" },
        ];
        sourceId = null;
        lastUpdated = now;
      },
      {
        id = startId + 2;
        name = "Yuki Tanaka";
        entityType = #Person;
        attributes = [
          { key = "role"; value = "Data Scientist" },
          { key = "department"; value = "Analytics" },
          { key = "location"; value = "Tokyo" },
        ];
        relationships = [
          { targetId = startId + 6; relationshipType = "employed_by" },
          { targetId = startId + 8; relationshipType = "manages" },
        ];
        sourceId = null;
        lastUpdated = now;
      },
      {
        id = startId + 3;
        name = "Dmitri Volkov";
        entityType = #Person;
        attributes = [
          { key = "role"; value = "Executive" },
          { key = "status"; value = "Under Investigation" },
          { key = "nationality"; value = "Russian" },
        ];
        relationships = [
          { targetId = startId + 6; relationshipType = "owns" },
          { targetId = startId + 12; relationshipType = "connected_to" },
        ];
        sourceId = null;
        lastUpdated = now;
      },
      {
        id = startId + 4;
        name = "Priya Sharma";
        entityType = #Person;
        attributes = [
          { key = "role"; value = "Cybersecurity Researcher" },
          { key = "affiliation"; value = "Independent" },
          { key = "expertise"; value = "Threat Intelligence" },
        ];
        relationships = [
          { targetId = startId + 7; relationshipType = "reported" },
          { targetId = startId + 13; relationshipType = "investigated" },
        ];
        sourceId = null;
        lastUpdated = now;
      },
      // Organizations
      {
        id = startId + 5;
        name = "Nexus Intelligence Group";
        entityType = #Organization;
        attributes = [
          { key = "type"; value = "Private Intelligence Firm" },
          { key = "founded"; value = "2015" },
          { key = "employees"; value = "250" },
        ];
        relationships = [
          { targetId = startId + 8; relationshipType = "operates" },
          { targetId = startId + 10; relationshipType = "involved_in" },
        ];
        sourceId = null;
        lastUpdated = now;
      },
      {
        id = startId + 6;
        name = "Volkov Holdings LLC";
        entityType = #Organization;
        attributes = [
          { key = "type"; value = "Shell Corporation" },
          { key = "jurisdiction"; value = "Cayman Islands" },
          { key = "status"; value = "Flagged" },
        ];
        relationships = [
          { targetId = startId + 3; relationshipType = "controlled_by" },
          { targetId = startId + 9; relationshipType = "owns" },
        ];
        sourceId = null;
        lastUpdated = now;
      },
      {
        id = startId + 7;
        name = "CyberWatch Foundation";
        entityType = #Organization;
        attributes = [
          { key = "type"; value = "NGO" },
          { key = "focus"; value = "Cybersecurity Advocacy" },
          { key = "location"; value = "Brussels" },
        ];
        relationships = [
          { targetId = startId + 4; relationshipType = "employs" },
          { targetId = startId + 13; relationshipType = "monitors" },
        ];
        sourceId = null;
        lastUpdated = now;
      },
      {
        id = startId + 8;
        name = "Pacific Rim Data Center";
        entityType = #Organization;
        attributes = [
          { key = "type"; value = "Infrastructure Provider" },
          { key = "location"; value = "Singapore" },
          { key = "capacity"; value = "10 MW" },
        ];
        relationships = [
          { targetId = startId + 9; relationshipType = "hosts" },
        ];
        sourceId = null;
        lastUpdated = now;
      },
      // Assets
      {
        id = startId + 9;
        name = "Server Cluster Alpha-7";
        entityType = #Asset;
        attributes = [
          { key = "type"; value = "Compute Cluster" },
          { key = "ip_range"; value = "192.168.10.0/24" },
          { key = "status"; value = "Compromised" },
        ];
        relationships = [
          { targetId = startId + 13; relationshipType = "targeted_by" },
        ];
        sourceId = null;
        lastUpdated = now;
      },
      {
        id = startId + 10;
        name = "Operation Nightfall Documents";
        entityType = #Asset;
        attributes = [
          { key = "type"; value = "Classified Document Set" },
          { key = "classification"; value = "SECRET" },
          { key = "file_count"; value = "1247" },
        ];
        relationships = [
          { targetId = startId; relationshipType = "accessed_by" },
          { targetId = startId + 5; relationshipType = "owned_by" },
        ];
        sourceId = null;
        lastUpdated = now;
      },
      {
        id = startId + 11;
        name = "Surveillance Network Node 3";
        entityType = #Asset;
        attributes = [
          { key = "type"; value = "CCTV Network" },
          { key = "coverage"; value = "Port District" },
          { key = "feeds"; value = "48 cameras" },
        ];
        relationships = [
          { targetId = startId + 1; relationshipType = "monitored_by" },
        ];
        sourceId = null;
        lastUpdated = now;
      },
      {
        id = startId + 12;
        name = "Encrypted Comms Device XR-99";
        entityType = #Asset;
        attributes = [
          { key = "type"; value = "Communication Device" },
          { key = "encryption"; value = "AES-256" },
          { key = "status"; value = "Seized" },
        ];
        relationships = [
          { targetId = startId + 3; relationshipType = "owned_by" },
        ];
        sourceId = null;
        lastUpdated = now;
      },
      // Events
      {
        id = startId + 13;
        name = "Operation Dark Web Takedown";
        entityType = #Event;
        attributes = [
          { key = "date"; value = "2025-11-15" },
          { key = "location"; value = "International" },
          { key = "outcome"; value = "Ongoing" },
        ];
        relationships = [
          { targetId = startId + 4; relationshipType = "led_by" },
          { targetId = startId + 9; relationshipType = "targets" },
        ];
        sourceId = null;
        lastUpdated = now;
      },
      {
        id = startId + 14;
        name = "Singapore Summit 2025";
        entityType = #Event;
        attributes = [
          { key = "date"; value = "2025-09-20" },
          { key = "location"; value = "Singapore" },
          { key = "type"; value = "Diplomatic Meeting" },
        ];
        relationships = [
          { targetId = startId + 2; relationshipType = "attended_by" },
          { targetId = startId + 8; relationshipType = "hosted_near" },
        ];
        sourceId = null;
        lastUpdated = now;
      },
      {
        id = startId + 15;
        name = "Data Breach Incident Q4";
        entityType = #Event;
        attributes = [
          { key = "date"; value = "2025-12-01" },
          { key = "records_exposed"; value = "500000" },
          { key = "severity"; value = "Critical" },
        ];
        relationships = [
          { targetId = startId + 9; relationshipType = "compromised" },
          { targetId = startId + 6; relationshipType = "attributed_to" },
        ];
        sourceId = null;
        lastUpdated = now;
      },
    ];
    for (e in seed.vals()) {
      entities.add(e);
    };
    startId + seed.size();
  };
};
