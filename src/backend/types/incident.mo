import Common "common";

module {
  public type Severity = { #Critical; #High; #Medium; #Low };

  public type IncidentStatus = { #Open; #Investigating; #Closed };

  public type TimelineEvent = {
    timestamp : Common.Timestamp;
    eventType : Text;
    note : Text;
  };

  public type Incident = {
    id : Common.IncidentId;
    title : Text;
    description : Text;
    severity : Severity;
    status : IncidentStatus;
    relatedEntityIds : [Common.EntityId];
    timeline : [TimelineEvent];
    notes : Text;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };
};
