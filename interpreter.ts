import { Expr, Visitor, accept } from "./expr";
import { runtimeError } from "./nol";
import { RuntimeError } from "./runtime-error";
import { Token } from "./token";

const interpreter: Visitor<unknown> = {
  visitLiteralExpr(expr) {
    return expr.value;
  },
  visitGroupingExpr(expr) {
    return evaluate(expr.expression);
  },
  visitUnaryExpr(expr) {
    const right = evaluate(expr.right);

    switch (expr.operator.type) {
      case "BANG":
        return !isTruthy(right);
      case "MINUS":
        checkNumberOperand(expr.operator, right);
        return -(right as number);
    }

    return null;
  },
  visitBinaryExpr(expr) {
    const left = evaluate(expr.left);
    const right = evaluate(expr.right);

    switch (expr.operator.type) {
      case "MINUS":
        checkNumberOperands(expr.operator, left, right);
        return Number(left) - Number(right);
      case "SLASH":
        checkNumberOperands(expr.operator, left, right);
        return Number(left) / Number(right);
      case "STAR":
        checkNumberOperands(expr.operator, left, right);
        return Number(left) * Number(right);
      case "PLUS": {
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }

        if (typeof left === "string" && typeof right === "string") {
          return left + right;
        }

        throw new RuntimeError(
          expr.operator,
          "Operands must be two numbers or two strings."
        );
      }
      case "GREATER":
        checkNumberOperands(expr.operator, left, right);
        return Number(left) > Number(right);
      case "GREATER_EQUAL":
        checkNumberOperands(expr.operator, left, right);
        return Number(left) >= Number(right);
      case "LESS":
        checkNumberOperands(expr.operator, left, right);
        return Number(left) < Number(right);
      case "LESS_EQUAL":
        checkNumberOperands(expr.operator, left, right);
        return Number(left) <= Number(right);
      case "BANG_EQUAL":
        return left !== right;
      case "EQUAL_EQUAL":
        return left === right;
    }

    return null;
  },
};

function evaluate(expr: Expr) {
  return accept(expr, interpreter);
}

function isTruthy(value: unknown) {
  if (value === null || value === undefined || value === false) return false;

  return true;
}

function checkNumberOperand(operator: Token, operand: unknown) {
  if (typeof operand === "number") return;

  throw new RuntimeError(operator, "Operand must be a number.");
}

function checkNumberOperands(operator: Token, left: unknown, right: unknown) {
  if (typeof left === "number" && typeof right === "number") return;

  throw new RuntimeError(operator, "Operands must be numbers.");
}

export function interpret(expression: Expr) {
  try {
    const value = evaluate(expression);

    console.log(value);
  } catch (err) {
    runtimeError(err as RuntimeError);
  }
}
