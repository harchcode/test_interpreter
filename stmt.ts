import { Expr } from "./expr";

export type ExpressionStmt = {
  expression: Expr;
  _type: "ExpressionStmt";
};
export function createExpressionStmt(
  expression: Expr,
): ExpressionStmt {
  return {
    expression,
    _type: "ExpressionStmt",
  };
}

export type PrintStmt = {
  expression: Expr;
  _type: "PrintStmt";
};
export function createPrintStmt(
  expression: Expr,
): PrintStmt {
  return {
    expression,
    _type: "PrintStmt",
  };
}

export type Visitor<R> = {
  visitExpressionStmt: (stmt: ExpressionStmt) => R;
  visitPrintStmt: (stmt: PrintStmt) => R;
};

export type Stmt =
  | ExpressionStmt
  | PrintStmt;

export function accept<R>(stmt: Stmt, visitor: Visitor<R>) {
  switch (stmt._type) {
    case "ExpressionStmt":
      return visitor.visitExpressionStmt(stmt);
    case "PrintStmt":
      return visitor.visitPrintStmt(stmt);
  }
}
