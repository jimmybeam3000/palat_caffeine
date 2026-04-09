import Common "../types/common";
import Types "../types/datasource";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public func listDataSources(sources : List.List<Types.DataSource>) : [Types.DataSource] {
    sources.toArray();
  };

  public func getDataSource(sources : List.List<Types.DataSource>, id : Common.DataSourceId) : ?Types.DataSource {
    sources.find(func(s) { s.id == id });
  };

  public func createDataSource(
    sources : List.List<Types.DataSource>,
    nextId : Nat,
    name : Text,
    sourceType : Types.DataSourceType,
    config : Types.DataSourceConfig,
  ) : Types.DataSource {
    let ds : Types.DataSource = {
      id = nextId;
      name;
      sourceType;
      config;
      status = #Idle;
      lastSync = null;
      recordCount = 0;
      syncHistory = [];
    };
    sources.add(ds);
    ds;
  };

  public func updateDataSource(
    sources : List.List<Types.DataSource>,
    id : Common.DataSourceId,
    name : Text,
    config : Types.DataSourceConfig,
  ) : Bool {
    switch (sources.findIndex(func(s) { s.id == id })) {
      case null { false };
      case (?idx) {
        let existing = sources.at(idx);
        sources.put(idx, { existing with name; config });
        true;
      };
    };
  };

  public func deleteDataSource(sources : List.List<Types.DataSource>, id : Common.DataSourceId) : Bool {
    let sizeBefore = sources.size();
    let filtered = sources.filter(func(s) { s.id != id });
    sources.clear();
    sources.append(filtered);
    sources.size() < sizeBefore;
  };

  public func recordSyncResult(
    sources : List.List<Types.DataSource>,
    id : Common.DataSourceId,
    status : Types.DataSourceStatus,
    recordCount : Nat,
    message : Text,
  ) : Bool {
    switch (sources.findIndex(func(s) { s.id == id })) {
      case null { false };
      case (?idx) {
        let existing = sources.at(idx);
        let now = Time.now();
        let record : Types.SyncRecord = {
          timestamp = now;
          status;
          recordCount;
          message;
        };
        let newHistory = existing.syncHistory.concat([record]);
        sources.put(
          idx,
          {
            existing with
            status;
            recordCount;
            lastSync = ?now;
            syncHistory = newHistory;
          },
        );
        true;
      };
    };
  };

  public func getSyncHistory(sources : List.List<Types.DataSource>, id : Common.DataSourceId) : ?[Types.SyncRecord] {
    switch (sources.find(func(s) { s.id == id })) {
      case null { null };
      case (?ds) { ?ds.syncHistory };
    };
  };

  public func setStatus(
    sources : List.List<Types.DataSource>,
    id : Common.DataSourceId,
    status : Types.DataSourceStatus,
  ) : Bool {
    switch (sources.findIndex(func(s) { s.id == id })) {
      case null { false };
      case (?idx) {
        let existing = sources.at(idx);
        sources.put(idx, { existing with status });
        true;
      };
    };
  };

  public func seedDataSources(sources : List.List<Types.DataSource>, startId : Nat) : Nat {
    let now = Time.now();
    let seed : [Types.DataSource] = [
      {
        id = startId;
        name = "Threat Intel REST Feed";
        sourceType = #REST_API;
        config = {
          url = "https://api.example-threat-intel.com/v2/indicators";
          headers = [("Authorization", "Bearer mock-token-123"), ("Accept", "application/json")];
          intervalSeconds = 3600;
        };
        status = #Connected;
        lastSync = ?(now - 3_600_000_000_000);
        recordCount = 1247;
        syncHistory = [
          {
            timestamp = now - 3_600_000_000_000;
            status = #Connected;
            recordCount = 1247;
            message = "Sync completed successfully";
          },
          {
            timestamp = now - 7_200_000_000_000;
            status = #Connected;
            recordCount = 1201;
            message = "Sync completed successfully";
          },
        ];
      },
      {
        id = startId + 1;
        name = "Entity CSV Import";
        sourceType = #CSV;
        config = {
          url = "entities-export-2025.csv";
          headers = [];
          intervalSeconds = 0;
        };
        status = #Idle;
        lastSync = ?(now - 86_400_000_000_000);
        recordCount = 342;
        syncHistory = [
          {
            timestamp = now - 86_400_000_000_000;
            status = #Connected;
            recordCount = 342;
            message = "CSV parsed and imported successfully";
          },
        ];
      },
      {
        id = startId + 2;
        name = "OSINT JSON Feed";
        sourceType = #JSON_Feed;
        config = {
          url = "https://feeds.example-osint.io/entities.json";
          headers = [("X-API-Key", "mock-osint-key-456")];
          intervalSeconds = 1800;
        };
        status = #Error;
        lastSync = ?(now - 5_400_000_000_000);
        recordCount = 0;
        syncHistory = [
          {
            timestamp = now - 5_400_000_000_000;
            status = #Error;
            recordCount = 0;
            message = "Connection timeout after 30s";
          },
          {
            timestamp = now - 9_000_000_000_000;
            status = #Connected;
            recordCount = 89;
            message = "Sync completed successfully";
          },
        ];
      },
    ];
    for (s in seed.vals()) {
      sources.add(s);
    };
    startId + seed.size();
  };
};
