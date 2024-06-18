import { Token } from "./token";

export class RuntimeError extends Error {
  constructor(public token: Token, message: string) {
    super(message);

    this.name = "Runtime Error";
  }
}

export class Return extends Error {
  constructor(public value: unknown) {
    super();
  }
}
