import { Expr, accept as acceptExpr } from "./expr";
import { error } from "./nol";
import { FunctionStmt, Stmt, accept as acceptStmt } from "./stmt";
import { Token } from "./token";
import { Resolver } from "./types";
import { resolve as interpreterResolve } from "./interpreter";

type Scopes = Record<string, boolean>[];
type FunctionType = "NONE" | "FUNCTION";

const scopes: Scopes = [];
let currentFunction: FunctionType = "NONE";

let resolver: Resolver = {
  visitBlockStmt(stmt) {
    beginScope();
    resolveAll(stmt.statements);
    endScope();

    return null;
  },
  visitVarStmt(stmt) {
    declare(stmt.name);

    if (stmt.initializer != null) {
      resolveExpr(stmt.initializer);
    }

    define(stmt.name);
    return null;
  },
  visitVariableExpr(expr) {
    if (scopes.length > 0 && peek(scopes)[expr.name.lexeme] === false) {
      error(expr.name, "Can't read local variable in its own initializer.");
    }

    resolveLocal(expr, expr.name);
    return null;
  },
  visitAssignExpr(expr) {
    resolveExpr(expr.value);
    resolveLocal(expr, expr.name);
    return null;
  },
  visitFunctionStmt(stmt) {
    declare(stmt.name);
    define(stmt.name);

    resolveFunction(stmt, "FUNCTION");
    return null;
  },
  visitExpressionStmt(stmt) {
    resolveExpr(stmt.expression);
    return null;
  },
  visitIfStmt(stmt) {
    resolveExpr(stmt.condition);
    resolveStmt(stmt.thenBranch);

    if (stmt.elseBranch != null) resolveStmt(stmt.elseBranch);
    return null;
  },
  visitPrintStmt(stmt) {
    resolveExpr(stmt.expression);
    return null;
  },
  visitReturnStmt(stmt) {
    if (currentFunction == "NONE") {
      error(stmt.keyword, "Can't return from top-level code.");
    }

    if (stmt.value != null) {
      resolveExpr(stmt.value);
    }

    return null;
  },
  visitWhileStmt(stmt) {
    resolveExpr(stmt.condition);
    resolveStmt(stmt.body);
    return null;
  },
  visitBinaryExpr(expr) {
    resolveExpr(expr.left);
    resolveExpr(expr.right);
    return null;
  },
  visitCallExpr(expr) {
    resolveExpr(expr.callee);

    for (const argument of expr.args) {
      resolveExpr(argument);
    }

    return null;
  },
  visitGroupingExpr(expr) {
    resolveExpr(expr.expression);
    return null;
  },
  visitLiteralExpr(expr) {
    return null;
  },
  visitLogicalExpr(expr) {
    resolveExpr(expr.left);
    resolveExpr(expr.right);
    return null;
  },
  visitUnaryExpr(expr) {
    resolveExpr(expr.right);
    return null;
  },
};

function peek(scopes: Scopes) {
  return scopes[scopes.length - 1];
}

function resolveFunction(fn: FunctionStmt, type: FunctionType) {
  const enclosingFunction = currentFunction;
  currentFunction = type;

  beginScope();

  for (const param of fn.params) {
    declare(param);
    define(param);
  }

  resolveAll(fn.body);
  endScope();

  currentFunction = enclosingFunction;
}

function resolveLocal(expr: Expr, name: Token) {
  for (let i = scopes.length - 1; i >= 0; i--) {
    if (scopes[i][name.lexeme] !== undefined) {
      interpreterResolve(expr, scopes.length - 1 - i);
      return;
    }
  }
}

function define(name: Token) {
  if (scopes.length <= 0) return;

  const scope = peek(scopes);
  scope[name.lexeme] = true;
}

function declare(name: Token) {
  if (scopes.length <= 0) return;

  const scope = peek(scopes);

  if (scope[name.lexeme] !== undefined) {
    error(name, "Already a variable with this name in this scope.");
  }

  scope[name.lexeme] = false;
}

function resolveStmt(stmt: Stmt) {
  acceptStmt(stmt, resolver);
}

function resolveExpr(expr: Expr) {
  acceptExpr(expr, resolver);
}

export function resolveAll(statements: Stmt[]) {
  for (const statement of statements) {
    resolveStmt(statement);
  }
}

function beginScope() {
  scopes.push({});
}

function endScope() {
  scopes.pop();
}
