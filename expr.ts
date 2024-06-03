import { Token } from "./token";

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

export type Visitor<R> = {
  visitBinaryExpr: (expr: BinaryExpr) => R;
  visitGroupingExpr: (expr: GroupingExpr) => R;
  visitLiteralExpr: (expr: LiteralExpr) => R;
  visitUnaryExpr: (expr: UnaryExpr) => R;
};

export type Expr =
  | BinaryExpr
  | GroupingExpr
  | LiteralExpr
  | UnaryExpr;

export function accept<R>(expr: Expr, visitor: Visitor<R>) {
  switch (expr._type) {
    case "BinaryExpr":
      return visitor.visitBinaryExpr(expr);
    case "GroupingExpr":
      return visitor.visitGroupingExpr(expr);
    case "LiteralExpr":
      return visitor.visitLiteralExpr(expr);
    case "UnaryExpr":
      return visitor.visitUnaryExpr(expr);
  }
}
