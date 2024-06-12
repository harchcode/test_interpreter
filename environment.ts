import { RuntimeError } from "./runtime-error";
import { Token } from "./token";

export type Environment = {
  values: Record<string, unknown>;
  enclosing: Environment | null;
};

// const values: Record<string, unknown> = {};

export function createEnvironment(enclosing?: Environment): Environment {
  return {
    values: {},
    enclosing: enclosing ?? null,
  };
}

export function defineVar(
  environment: Environment,
  name: string,
  value: unknown
) {
  environment.values[name] = value;
}

export function getVarValue(environment: Environment, name: Token) {
  if (environment.values[name.lexeme] !== undefined) {
    return environment.values[name.lexeme];
  }

  if (environment.enclosing != null) {
    return getVarValue(environment.enclosing, name);
  }

  throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
}

export function assignVar(
  environment: Environment,
  name: Token,
  value: unknown
) {
  if (environment.values[name.lexeme] !== undefined) {
    environment.values[name.lexeme] = value;

    return;
  }

  if (environment.enclosing != null) {
    assignVar(environment.enclosing, name, value);

    return;
  }

  throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
}
