import Common "../types/common";
import Types "../types/datasource";
import DataSourceLib "../lib/datasource";
import List "mo:core/List";
import OutCall "mo:caffeineai-http-outcalls/outcall";

mixin (
  sources : List.List<Types.DataSource>,
  counter : Common.Counter,
  transform : OutCall.Transform,
) {
  public query func listDataSources() : async [Types.DataSource] {
    DataSourceLib.listDataSources(sources);
  };

  public query func getDataSource(id : Common.DataSourceId) : async ?Types.DataSource {
    DataSourceLib.getDataSource(sources, id);
  };

  public func addDataSource(
    name : Text,
    sourceType : Types.DataSourceType,
    config : Types.DataSourceConfig,
  ) : async Types.DataSource {
    let ds = DataSourceLib.createDataSource(sources, counter.value, name, sourceType, config);
    counter.value += 1;
    ds;
  };

  public func updateDataSource(
    id : Common.DataSourceId,
    name : Text,
    config : Types.DataSourceConfig,
  ) : async Bool {
    DataSourceLib.updateDataSource(sources, id, name, config);
  };

  public func deleteDataSource(id : Common.DataSourceId) : async Bool {
    DataSourceLib.deleteDataSource(sources, id);
  };

  public func updateDataSourceSync(
    id : Common.DataSourceId,
    status : Types.DataSourceStatus,
    recordCount : Nat,
    message : Text,
  ) : async Bool {
    DataSourceLib.recordSyncResult(sources, id, status, recordCount, message);
  };

  public func triggerDataSourceSync(id : Common.DataSourceId) : async Text {
    switch (DataSourceLib.getDataSource(sources, id)) {
      case null { "Error: data source not found" };
      case (?ds) {
        ignore DataSourceLib.setStatus(sources, id, #Syncing);
        switch (ds.sourceType) {
          case (#REST_API) {
            try {
              let responseText = await OutCall.httpGetRequest(ds.config.url, [], transform);
              let approxCount = responseText.size() / 100 + 1;
              ignore DataSourceLib.recordSyncResult(sources, id, #Connected, approxCount, "REST API sync completed");
              "Sync completed: " # responseText.size().toText() # " bytes received";
            } catch (_) {
              ignore DataSourceLib.recordSyncResult(sources, id, #Error, 0, "HTTP request failed");
              "Error: HTTP request failed";
            };
          };
          case (#JSON_Feed) {
            try {
              let responseText = await OutCall.httpGetRequest(ds.config.url, [], transform);
              let approxCount = responseText.size() / 80 + 1;
              ignore DataSourceLib.recordSyncResult(sources, id, #Connected, approxCount, "JSON feed sync completed");
              "Sync completed: " # responseText.size().toText() # " bytes received";
            } catch (_) {
              ignore DataSourceLib.recordSyncResult(sources, id, #Error, 0, "JSON feed request failed");
              "Error: JSON feed request failed";
            };
          };
          case (#CSV) {
            ignore DataSourceLib.recordSyncResult(sources, id, #Connected, 0, "CSV sync triggered; upload via frontend");
            "CSV sync triggered for key: " # ds.config.url;
          };
        };
      };
    };
  };

  public query func getSyncHistory(id : Common.DataSourceId) : async ?[Types.SyncRecord] {
    DataSourceLib.getSyncHistory(sources, id);
  };
};
