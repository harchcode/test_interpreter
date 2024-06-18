import { Visitor as ExprVisitor } from "./expr";
import { Visitor as StmtVisitor } from "./stmt";

export type Interpreter = ExprVisitor<unknown> & StmtVisitor<void>;
export type Resolver = Interpreter;

export type Callable = {
  arity: number;
  call: (interpreter: Interpreter, args: unknown[]) => unknown;
};
