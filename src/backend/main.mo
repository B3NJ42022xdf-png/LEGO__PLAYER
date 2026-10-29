import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import Map "mo:core/Map";
import CustomerTypes "types/customers";
import PurchaseTypes "types/purchases";
import CustomersApi "mixins/customers-api";
import PurchasesApi "mixins/purchases-api";
import ApiDocMixin "mixins/api-doc";
import CustomersOql "generated/CustomersOql";
import PurchasesOql "generated/PurchasesOql";

actor {
  let accessControlState : AccessControl.AccessControlState;

  let customers : Map.Map<Text, CustomerTypes.Customer>;
  let sessions : Map.Map<Text, CustomerTypes.CustomerId>;
  let sessionExpiry : Map.Map<Text, CustomerTypes.Timestamp>;
  let loginLog : Map.Map<Nat, CustomerTypes.LoginAttempt>;
  let nextCustomerId : { var next : Nat };
  let nextLogId : { var next : Nat };

  let purchases : Map.Map<PurchaseTypes.PurchaseId, PurchaseTypes.Purchase>;

  include MixinAuthorization(accessControlState, null);
  include CustomersApi(customers, sessions, sessionExpiry, loginLog, nextCustomerId, nextLogId);
  include PurchasesApi(purchases, sessions, sessionExpiry);
  include ApiDocMixin();
  include Expose({
    entities = [
      CustomersOql.entity(customers).build(),
      PurchasesOql.entity(purchases).build(),
    ];
  });
};
