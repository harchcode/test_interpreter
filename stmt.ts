import { Token } from "./token";
import { Expr, NullableExpr } from "./expr";

export type BlockStmt = {
  statements: Stmt[];
  _type: "BlockStmt";
};
export function createBlockStmt(
  statements: Stmt[],
): BlockStmt {
  return {
    statements,
    _type: "BlockStmt",
  };
}

export type IfStmt = {
  condition: Expr;
  thenBranch: Stmt;
  elseBranch: Stmt|null;
  _type: "IfStmt";
};
export function createIfStmt(
  condition: Expr,
  thenBranch: Stmt,
  elseBranch: Stmt|null,
): IfStmt {
  return {
    condition,
    thenBranch,
    elseBranch,
    _type: "IfStmt",
  };
}

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

export type VarStmt = {
  name: Token;
  initializer: NullableExpr;
  _type: "VarStmt";
};
export function createVarStmt(
  name: Token,
  initializer: NullableExpr,
): VarStmt {
  return {
    name,
    initializer,
    _type: "VarStmt",
  };
}

export type WhileStmt = {
  condition: Expr;
  body: Stmt;
  _type: "WhileStmt";
};
export function createWhileStmt(
  condition: Expr,
  body: Stmt,
): WhileStmt {
  return {
    condition,
    body,
    _type: "WhileStmt",
  };
}

export type Visitor<R> = {
  visitBlockStmt: (stmt: BlockStmt) => R;
  visitIfStmt: (stmt: IfStmt) => R;
  visitExpressionStmt: (stmt: ExpressionStmt) => R;
  visitPrintStmt: (stmt: PrintStmt) => R;
  visitVarStmt: (stmt: VarStmt) => R;
  visitWhileStmt: (stmt: WhileStmt) => R;
};

export type Stmt =
  | BlockStmt
  | IfStmt
  | ExpressionStmt
  | PrintStmt
  | VarStmt
  | WhileStmt;

export type NullableStmt = Stmt | null;

export function accept<R>(stmt: Stmt, visitor: Visitor<R>) {
  switch (stmt._type) {
    case "BlockStmt":
      return visitor.visitBlockStmt(stmt);
    case "IfStmt":
      return visitor.visitIfStmt(stmt);
    case "ExpressionStmt":
      return visitor.visitExpressionStmt(stmt);
    case "PrintStmt":
      return visitor.visitPrintStmt(stmt);
    case "VarStmt":
      return visitor.visitVarStmt(stmt);
    case "WhileStmt":
      return visitor.visitWhileStmt(stmt);
  }
}
