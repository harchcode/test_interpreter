import { Token } from "./token";

export type AssignExpr = {
  name: Token;
  value: Expr;
  _type: "AssignExpr";
};
export function createAssignExpr(
  name: Token,
  value: Expr,
): AssignExpr {
  return {
    name,
    value,
    _type: "AssignExpr",
  };
}

export type BinaryExpr = {
  left: Expr;
  operator: Token;
  right: Expr;
  _type: "BinaryExpr";
};
export function createBinaryExpr(
  left: Expr,
  operator: Token,
  right: Expr,
): BinaryExpr {
  return {
    left,
    operator,
    right,
    _type: "BinaryExpr",
  };
}

export type GroupingExpr = {
  expression: Expr;
  _type: "GroupingExpr";
};
export function createGroupingExpr(
  expression: Expr,
): GroupingExpr {
  return {
    expression,
    _type: "GroupingExpr",
  };
}

export type LiteralExpr = {
  value: unknown;
  _type: "LiteralExpr";
};
export function createLiteralExpr(
  value: unknown,
): LiteralExpr {
  return {
    value,
    _type: "LiteralExpr",
  };
}

export type LogicalExpr = {
  left: Expr;
  operator: Token;
  right: Expr;
  _type: "LogicalExpr";
};
export function createLogicalExpr(
  left: Expr,
  operator: Token,
  right: Expr,
): LogicalExpr {
  return {
    left,
    operator,
    right,
    _type: "LogicalExpr",
  };
}

export type UnaryExpr = {
  operator: Token;
  right: Expr;
  _type: "UnaryExpr";
};
export function createUnaryExpr(
  operator: Token,
  right: Expr,
): UnaryExpr {
  return {
    operator,
    right,
    _type: "UnaryExpr",
  };
}

export type VariableExpr = {
  name: Token;
  _type: "VariableExpr";
};
export function createVariableExpr(
  name: Token,
): VariableExpr {
  return {
    name,
    _type: "VariableExpr",
  };
}

export type Visitor<R> = {
  visitAssignExpr: (expr: AssignExpr) => R;
  visitBinaryExpr: (expr: BinaryExpr) => R;
  visitGroupingExpr: (expr: GroupingExpr) => R;
  visitLiteralExpr: (expr: LiteralExpr) => R;
  visitLogicalExpr: (expr: LogicalExpr) => R;
  visitUnaryExpr: (expr: UnaryExpr) => R;
  visitVariableExpr: (expr: VariableExpr) => R;
};

export type Expr =
  | AssignExpr
  | BinaryExpr
  | GroupingExpr
  | LiteralExpr
  | LogicalExpr
  | UnaryExpr
  | VariableExpr;

export type NullableExpr = Expr | null;

export function accept<R>(expr: Expr, visitor: Visitor<R>) {
  switch (expr._type) {
    case "AssignExpr":
      return visitor.visitAssignExpr(expr);
    case "BinaryExpr":
      return visitor.visitBinaryExpr(expr);
    case "GroupingExpr":
      return visitor.visitGroupingExpr(expr);
    case "LiteralExpr":
      return visitor.visitLiteralExpr(expr);
    case "LogicalExpr":
      return visitor.visitLogicalExpr(expr);
    case "UnaryExpr":
      return visitor.visitUnaryExpr(expr);
    case "VariableExpr":
      return visitor.visitVariableExpr(expr);
  }
}
