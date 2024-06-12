import {
  Expr,
  Visitor,
  accept,
  createBinaryExpr,
  createGroupingExpr,
  createLiteralExpr,
  createUnaryExpr,
} from "./expr";
import { createToken } from "./token";

const astPrinter: Visitor<string> = {
  visitAssignExpr(expr) {
    return parenthesize("assign", expr);
  },
  visitBinaryExpr(expr) {
    return parenthesize(expr.operator.lexeme, expr.left, expr.right);
  },
  visitGroupingExpr(expr) {
    return parenthesize("group", expr.expression);
  },
  visitLiteralExpr(expr) {
    if (expr.value === null || expr.value === undefined) return "nil";
    return expr.value.toString();
  },
  visitUnaryExpr(expr) {
    return parenthesize(expr.operator.lexeme, expr.right);
  },
  visitVariableExpr(expr) {
    return parenthesize("var", expr);
  },
  visitLogicalExpr(expr) {
    return parenthesize("logical", expr);
  },
};

export function printAST(expr: Expr) {
  return accept(expr, astPrinter);
}

function parenthesize(name: string, ...exprs: Expr[]) {
  return `(${name}${exprs
    .map((expr) => ` ${accept(expr, astPrinter)}`)
    .join()})`;
}

function test() {
  // prettier-ignore
  const expr = createBinaryExpr(
    createUnaryExpr(
      createToken("MINUS", "-", null, 1),
      createLiteralExpr(123)
    ),
    createToken("STAR", "*", null, 1),
    createGroupingExpr(
      createLiteralExpr(45.67)
    )
  )

  console.log(printAST(expr));
}

test();
