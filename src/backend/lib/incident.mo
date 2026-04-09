import Common "../types/common";
import Types "../types/incident";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public func listIncidents(incidents : List.List<Types.Incident>) : [Types.Incident] {
    incidents.toArray();
  };

  public func getIncident(incidents : List.List<Types.Incident>, id : Common.IncidentId) : ?Types.Incident {
    incidents.find(func(i) { i.id == id });
  };

  public func createIncident(
    incidents : List.List<Types.Incident>,
    nextId : Nat,
    title : Text,
    description : Text,
    severity : Types.Severity,
    relatedEntityIds : [Common.EntityId],
  ) : Types.Incident {
    let now = Time.now();
    let incident : Types.Incident = {
      id = nextId;
      title;
      description;
      severity;
      status = #Open;
      relatedEntityIds;
      timeline = [
        {
          timestamp = now;
          eventType = "created";
          note = "Incident created";
        }
      ];
      notes = "";
      createdAt = now;
      updatedAt = now;
    };
    incidents.add(incident);
    incident;
  };

  public func updateIncident(
    incidents : List.List<Types.Incident>,
    id : Common.IncidentId,
    title : Text,
    description : Text,
    severity : Types.Severity,
    status : Types.IncidentStatus,
    notes : Text,
  ) : Bool {
    switch (incidents.findIndex(func(i) { i.id == id })) {
      case null { false };
      case (?idx) {
        let existing = incidents.at(idx);
        incidents.put(
          idx,
          {
            existing with
            title;
            description;
            severity;
            status;
            notes;
            updatedAt = Time.now();
          },
        );
        true;
      };
    };
  };

  public func addTimelineEvent(
    incidents : List.List<Types.Incident>,
    id : Common.IncidentId,
    eventType : Text,
    note : Text,
  ) : Bool {
    switch (incidents.findIndex(func(i) { i.id == id })) {
      case null { false };
      case (?idx) {
        let existing = incidents.at(idx);
        let newEvent : Types.TimelineEvent = {
          timestamp = Time.now();
          eventType;
          note;
        };
        incidents.put(
          idx,
          {
            existing with
            timeline = existing.timeline.concat([newEvent]);
            updatedAt = Time.now();
          },
        );
        true;
      };
    };
  };

  public func deleteIncident(incidents : List.List<Types.Incident>, id : Common.IncidentId) : Bool {
    let sizeBefore = incidents.size();
    let filtered = incidents.filter(func(i) { i.id != id });
    incidents.clear();
    incidents.append(filtered);
    incidents.size() < sizeBefore;
  };

  public func seedIncidents(incidents : List.List<Types.Incident>, startId : Nat) : Nat {
    let now = Time.now();
    // Spread times across the past 30 days (in nanoseconds)
    let day : Int = 86_400_000_000_000;
    let seed : [Types.Incident] = [
      {
        id = startId;
        title = "Unauthorized Access to Alpha-7 Cluster";
        description = "Multiple failed login attempts followed by successful breach using stolen credentials. Root access achieved.";
        severity = #Critical;
        status = #Investigating;
        relatedEntityIds = [9, 6];
        timeline = [
          { timestamp = now - day * 5; eventType = "detected"; note = "IDS alert triggered" },
          { timestamp = now - day * 4; eventType = "escalated"; note = "Escalated to Tier 3 response team" },
          { timestamp = now - day * 3; eventType = "contained"; note = "Lateral movement blocked" },
        ];
        notes = "Suspected APT group with links to Volkov Holdings";
        createdAt = now - day * 5;
        updatedAt = now - day * 3;
      },
      {
        id = startId + 1;
        title = "Data Exfiltration via Encrypted Channel";
        description = "500K records exfiltrated through AES-encrypted tunnel to offshore server.";
        severity = #Critical;
        status = #Open;
        relatedEntityIds = [9, 3, 12];
        timeline = [
          { timestamp = now - day * 2; eventType = "discovered"; note = "DLP system flagged outbound traffic" },
          { timestamp = now - day * 1; eventType = "analyzed"; note = "Traffic confirmed as exfiltration" },
        ];
        notes = "Encrypted device XR-99 used as relay";
        createdAt = now - day * 2;
        updatedAt = now - day * 1;
      },
      {
        id = startId + 2;
        title = "Suspicious Activity: Volkov Holdings Shell Transfers";
        description = "Series of financial transactions between Volkov Holdings and unknown offshore accounts flagged.";
        severity = #High;
        status = #Investigating;
        relatedEntityIds = [3, 6];
        timeline = [
          { timestamp = now - day * 10; eventType = "flagged"; note = "Automated rule triggered" },
          { timestamp = now - day * 8; eventType = "reviewed"; note = "Human analyst confirmed suspicion" },
        ];
        notes = "Pattern matches known money laundering signatures";
        createdAt = now - day * 10;
        updatedAt = now - day * 8;
      },
      {
        id = startId + 3;
        title = "Unauthorized Document Access: Operation Nightfall";
        description = "Classified documents accessed outside of authorized hours and location.";
        severity = #High;
        status = #Open;
        relatedEntityIds = [10, 0];
        timeline = [
          { timestamp = now - day * 7; eventType = "detected"; note = "Access log anomaly detected" },
        ];
        notes = "Subject Alexandra Chen's credentials used; she was out of office at the time";
        createdAt = now - day * 7;
        updatedAt = now - day * 7;
      },
      {
        id = startId + 4;
        title = "CCTV Feed Tampering at Port District";
        description = "15-minute gap in surveillance footage during scheduled cargo transfer operation.";
        severity = #High;
        status = #Closed;
        relatedEntityIds = [11, 1];
        timeline = [
          { timestamp = now - day * 15; eventType = "reported"; note = "Security guard noticed feed interruption" },
          { timestamp = now - day * 14; eventType = "investigated"; note = "Technical fault ruled out" },
          { timestamp = now - day * 12; eventType = "closed"; note = "Evidence insufficient for prosecution" },
        ];
        notes = "Likely deliberate tampering. Case closed pending new evidence.";
        createdAt = now - day * 15;
        updatedAt = now - day * 12;
      },
      {
        id = startId + 5;
        title = "Phishing Campaign Targeting Nexus Analysts";
        description = "Spear-phishing emails sent to 47 analysts with weaponized attachments.";
        severity = #Medium;
        status = #Closed;
        relatedEntityIds = [5, 0, 1];
        timeline = [
          { timestamp = now - day * 20; eventType = "detected"; note = "Email gateway flagged campaign" },
          { timestamp = now - day * 19; eventType = "remediated"; note = "Emails quarantined, affected systems scanned" },
          { timestamp = now - day * 18; eventType = "closed"; note = "No successful infections confirmed" },
        ];
        notes = "Campaign attributed to known threat actor TA-441";
        createdAt = now - day * 20;
        updatedAt = now - day * 18;
      },
      {
        id = startId + 6;
        title = "Anomalous Network Traffic: Pacific Rim Data Center";
        description = "Unusual outbound traffic patterns detected from server cluster during off-peak hours.";
        severity = #Medium;
        status = #Investigating;
        relatedEntityIds = [8, 9];
        timeline = [
          { timestamp = now - day * 3; eventType = "detected"; note = "SIEM alert fired on traffic volume" },
          { timestamp = now - day * 2; eventType = "analyzed"; note = "Traffic routed through Tor exit nodes" },
        ];
        notes = "Possible C2 beacon; correlates with Alpha-7 breach timeline";
        createdAt = now - day * 3;
        updatedAt = now - day * 2;
      },
      {
        id = startId + 7;
        title = "Identity Fraud: Marcus Webb Credentials";
        description = "Webb's credentials used to authenticate to systems he has no legitimate access to.";
        severity = #Medium;
        status = #Open;
        relatedEntityIds = [1, 5];
        timeline = [
          { timestamp = now - day * 1; eventType = "flagged"; note = "Access control violation logged" },
        ];
        notes = "Possible credential theft or insider threat";
        createdAt = now - day * 1;
        updatedAt = now - day * 1;
      },
      {
        id = startId + 8;
        title = "Meeting Protocol Violation: Singapore Summit";
        description = "Unregistered attendee photographed classified slide during Singapore Summit.";
        severity = #Low;
        status = #Closed;
        relatedEntityIds = [14, 2];
        timeline = [
          { timestamp = now - day * 25; eventType = "reported"; note = "Security officer filed report" },
          { timestamp = now - day * 24; eventType = "reviewed"; note = "Photo analyzed; content inconclusive" },
          { timestamp = now - day * 22; eventType = "closed"; note = "Person identified as accredited press" },
        ];
        notes = "No breach of classified information confirmed";
        createdAt = now - day * 25;
        updatedAt = now - day * 22;
      },
      {
        id = startId + 9;
        title = "Dark Web Forum Activity: Nexus Mention";
        description = "Nexus Intelligence Group mentioned in dark web forums in context of contract intelligence work.";
        severity = #Low;
        status = #Open;
        relatedEntityIds = [5, 13];
        timeline = [
          { timestamp = now - day * 6; eventType = "detected"; note = "OSINT tool flagged dark web post" },
        ];
        notes = "Monitoring ongoing; no actionable intelligence yet";
        createdAt = now - day * 6;
        updatedAt = now - day * 6;
      },
    ];
    for (i in seed.vals()) {
      incidents.add(i);
    };
    startId + seed.size();
  };
};
