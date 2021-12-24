import Nope from 'nope-validator';

export type RestrictionRule = {
  from?: string | RegExp | undefined;
  to?: string | RegExp | undefined;
  // severity: 'error' | 'warn';
  type: 'restricted' | 'allowed' | 'skip';
  message?: string;
};

export type Rule = RestrictionRule & {
  sourceRule: RestrictionRule;
  file: string;
};

export type RuleGenerator = (from: string, to: string) => Rule[];

export const RuleSchema = Nope.object().shape({
  from: Nope.string(),
  to: Nope.string(),
  // severity: Nope.string().oneOf(['error', 'warn']),
  type: Nope.string().oneOf(['restricted', 'allowed']).required(),
  message: Nope.string(),
});
