module {
  public type EntityId = Nat;
  public type IncidentId = Nat;
  public type DataSourceId = Nat;
  public type InvestigationId = Nat;
  public type AnomalyRuleId = Nat;
  public type Timestamp = Int;

  public type Counter = { var value : Nat };
  public func newCounter(start : Nat) : Counter { { var value = start } };
};
