import Common "common";

module {
  public type DataSourceType = { #CSV; #REST_API; #JSON_Feed };

  public type DataSourceStatus = { #Connected; #Syncing; #Error; #Idle };

  public type DataSourceConfig = {
    url : Text;
    headers : [(Text, Text)];
    intervalSeconds : Nat;
  };

  public type SyncRecord = {
    timestamp : Common.Timestamp;
    status : DataSourceStatus;
    recordCount : Nat;
    message : Text;
  };

  public type DataSource = {
    id : Common.DataSourceId;
    name : Text;
    sourceType : DataSourceType;
    config : DataSourceConfig;
    status : DataSourceStatus;
    lastSync : ?Common.Timestamp;
    recordCount : Nat;
    syncHistory : [SyncRecord];
  };
};
