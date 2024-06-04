import { Token } from "./token";
import { Expr, NullableExpr } from "./expr";

export type ExpressionStmt = {
  expression: Expr;
  _type: "ExpressionStmt";
};
export function createExpressionStmt(expression: Expr): ExpressionStmt {
  return {
    expression,
    _type: "ExpressionStmt",
  };
}

export type PrintStmt = {
  expression: Expr;
  _type: "PrintStmt";
};
export function createPrintStmt(expression: Expr): PrintStmt {
  return {
    expression,
    _type: "PrintStmt",
  };
}

export type VarStmt = {
  name: Token;
  initializer: NullableExpr;
  _type: "VarStmt";
};
export function createVarStmt(name: Token, initializer: NullableExpr): VarStmt {
  return {
    name,
    initializer,
    _type: "VarStmt",
  };
}

export type Visitor<R> = {
  visitExpressionStmt: (stmt: ExpressionStmt) => R;
  visitPrintStmt: (stmt: PrintStmt) => R;
  visitVarStmt: (stmt: VarStmt) => R;
};

export type Stmt = ExpressionStmt | PrintStmt | VarStmt;

export type NullableStmt = Stmt | null;

export function accept<R>(stmt: Stmt, visitor: Visitor<R>) {
  switch (stmt._type) {
    case "ExpressionStmt":
      return visitor.visitExpressionStmt(stmt);
    case "PrintStmt":
      return visitor.visitPrintStmt(stmt);
    case "VarStmt":
      return visitor.visitVarStmt(stmt);
  }
}
