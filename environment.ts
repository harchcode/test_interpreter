import { RuntimeError } from "./runtime-error";
import { Token } from "./token";

const values: Record<string, unknown> = {};

export function defineVar(name: string, value: unknown) {
  values[name] = value;
}

export function getVarValue(name: Token) {
  if (values[name.lexeme]) {
    return values[name.lexeme];
  }

  throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
}
