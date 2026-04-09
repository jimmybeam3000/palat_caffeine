import Common "common";
import EntityTypes "entity";

module {
  public type AnomalyAction = { #Flag; #Alert };

  public type AnomalyRule = {
    id : Common.AnomalyRuleId;
    name : Text;
    entityType : EntityTypes.EntityType;
    threshold : Float;
    action : AnomalyAction;
  };
};
