import { GlobalPolicyRule } from '../domain';

export abstract class GlobalPolicyRepository {
  abstract getActivePolicies(): Promise<GlobalPolicyRule[]>;
}
