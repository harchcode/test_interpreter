import {
  Environment,
  assignVar,
  createEnvironment,
  defineVar,
  getVarValue,
} from "./environment";
import { Expr, Visitor as ExprVisitor, accept as acceptExpr } from "./expr";
import { runtimeError } from "./nol";
import { RuntimeError } from "./runtime-error";
import { Stmt, Visitor as StmtVisitor, accept as acceptStmt } from "./stmt";
import { Token } from "./token";

let currentEnv = createEnvironment();

const interpreter: ExprVisitor<unknown> & StmtVisitor<void> = {
  visitAssignExpr(expr) {
    const value = evaluate(expr.value);

    assignVar(currentEnv, expr.name, value);

    return value;
  },
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
  visitVariableExpr(expr) {
    return getVarValue(currentEnv, expr.name);
  },
  visitExpressionStmt(stmt) {
    evaluate(stmt.expression);

    return null;
  },
  visitPrintStmt(stmt) {
    const value = evaluate(stmt.expression);
    console.log(value);

    return null;
  },
  visitVarStmt(stmt) {
    const value = stmt.initializer != null ? evaluate(stmt.initializer) : null;

    defineVar(currentEnv, stmt.name.lexeme, value);

    return null;
  },
  visitBlockStmt(stmt) {
    executeBlock(stmt.statements, createEnvironment(currentEnv));

    return null;
  },
  visitIfStmt(stmt) {
    if (isTruthy(evaluate(stmt.condition))) {
      execute(stmt.thenBranch);
    } else if (stmt.elseBranch != null) {
      execute(stmt.elseBranch);
    }

    return null;
  },
  visitLogicalExpr(expr) {
    const left = evaluate(expr.left);

    if (expr.operator.type == "OR") {
      if (isTruthy(left)) return left;
    } else {
      if (!isTruthy(left)) return left;
    }

    return evaluate(expr.right);
  },
  visitWhileStmt(stmt) {
    while (isTruthy(evaluate(stmt.condition))) {
      execute(stmt.body);
    }
    return null;
  },
};

function executeBlock(statements: Stmt[], environment: Environment) {
  const previous = currentEnv;

  try {
    currentEnv = environment;

    for (const statement of statements) {
      execute(statement);
    }
  } finally {
    currentEnv = previous;
  }
}

function evaluate(expr: Expr) {
  return acceptExpr(expr, interpreter);
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

export function interpret(statements: Stmt[]) {
  try {
    for (const statement of statements) {
      execute(statement);
    }
  } catch (error) {
    runtimeError(error as RuntimeError);
  }
}

function execute(stmt: Stmt) {
  acceptStmt(stmt, interpreter);
}
