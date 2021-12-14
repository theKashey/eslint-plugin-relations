import Nope from 'nope-validator';

export type Rule = {
  from?: string | RegExp | undefined;
  to?: string | RegExp | undefined;
  // severity: 'error' | 'warn';
  type: 'restricted' | 'allowed';
  message?: string;
};

export const RuleSchema = Nope.object().shape({
  from: Nope.string(),
  to: Nope.string(),
  // severity: Nope.string().oneOf(['error', 'warn']),
  type: Nope.string().oneOf(['restricted', 'allowed']).required(),
  message: Nope.string(),
});
