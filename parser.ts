import {
  Expr,
  createAssignExpr,
  createBinaryExpr,
  createGroupingExpr,
  createLiteralExpr,
  createLogicalExpr,
  createUnaryExpr,
  createVariableExpr,
} from "./expr";
import { error } from "./nol";
import {
  Stmt,
  createBlockStmt,
  createExpressionStmt,
  createIfStmt,
  createPrintStmt,
  createVarStmt,
  createWhileStmt,
} from "./stmt";
import { Token } from "./token";
import { TokenType } from "./token-type";

let tokens: Token[] = [];
let current = 0;

export function initParser(_tokens: Token[]) {
  tokens = _tokens;
}

export function parse() {
  const statements: Stmt[] = [];

  while (!isAtEnd()) {
    statements.push(declaration());
  }

  return statements;
}

function declaration() {
  try {
    if (match("VAR")) return varDeclaration();

    return statement();
  } catch (err) {
    synchronize();

    throw err;
  }
}

function varDeclaration() {
  const name = consume("IDENTIFIER", "Expect variable name.");

  let initializer: Expr | null = null;

  if (match("EQUAL")) {
    initializer = expression();
  }

  consume("SEMICOLON", "Expect ';' after variable declaration.");

  return createVarStmt(name, initializer);
}

function block() {
  const statements: Stmt[] = [];

  while (!check("RIGHT_BRACE") && !isAtEnd()) {
    statements.push(declaration());
  }

  consume("RIGHT_BRACE", "Expect '}' after block.");

  return statements;
}

function statement(): Stmt {
  if (match("FOR")) return forStatement();
  if (match("IF")) return ifStatement();
  if (match("PRINT")) return printStatement();
  if (match("WHILE")) return whileStatement();
  if (match("LEFT_BRACE")) return createBlockStmt(block());

  return expressionStatement();
}

function forStatement(): Stmt {
  consume("LEFT_PAREN", "Expect '(' after 'for'.");

  let initializer: Stmt | null;

  if (match("SEMICOLON")) {
    initializer = null;
  } else if (match("VAR")) {
    initializer = varDeclaration();
  } else {
    initializer = expressionStatement();
  }

  let condition: Expr | null = null;

  if (!check("SEMICOLON")) {
    condition = expression();
  }

  consume("SEMICOLON", "Expect ';' after loop condition.");

  let increment: Expr | null = null;

  if (!check("RIGHT_PAREN")) {
    increment = expression();
  }

  consume("RIGHT_PAREN", "Expect ')' after for clauses.");

  let body = statement();

  if (increment != null) {
    body = createBlockStmt([body, createExpressionStmt(increment)]);
  }

  if (condition == null) condition = createLiteralExpr(true);
  body = createWhileStmt(condition, body);

  if (initializer != null) {
    body = createBlockStmt([initializer, body]);
  }

  return body;
}

function whileStatement(): Stmt {
  consume("LEFT_PAREN", "Expect '(' after 'while'.");

  const condition = expression();

  consume("RIGHT_PAREN", "Expect ')' after condition.");

  const body = statement();

  return createWhileStmt(condition, body);
}

function ifStatement(): Stmt {
  consume("LEFT_PAREN", "Expect '(' after 'if'.");

  const condition = expression();

  consume("RIGHT_PAREN", "Expect ')' after if condition.");

  const thenBranch = statement();
  let elseBranch: Stmt | null = null;

  if (match("ELSE")) {
    elseBranch = statement();
  }

  return createIfStmt(condition, thenBranch, elseBranch);
}

function printStatement(): Stmt {
  const value = expression();
  consume("SEMICOLON", "Expect ';' after value.");

  return createPrintStmt(value);
}

function expressionStatement(): Stmt {
  const expr = expression();
  consume("SEMICOLON", "Expect ';' after expression.");

  return createExpressionStmt(expr);
}

function isAtEnd() {
  return peek().type === "EOF";
}

function peek() {
  return tokens[current];
}

function previous() {
  return tokens[current - 1];
}

function advance() {
  if (!isAtEnd()) current++;
  return previous();
}

function check(type: TokenType) {
  if (isAtEnd()) return false;

  return peek().type === type;
}

function match(...types: TokenType[]) {
  for (const type of types) {
    if (check(type)) {
      advance();

      return true;
    }
  }

  return false;
}

function parsingError(token: Token, message: string) {
  error(token, message);

  return new Error();
}

function consume(type: TokenType, message: string) {
  if (check(type)) return advance();

  throw parsingError(peek(), message);
}

function synchronize() {
  advance();
  while (!isAtEnd()) {
    if (previous().type == "SEMICOLON") return;
    switch (peek().type) {
      case "CLASS":
      case "FUN":
      case "VAR":
      case "FOR":
      case "IF":
      case "WHILE":
      case "PRINT":
      case "RETURN":
        return;
    }
    advance();
  }
}

function primary(): Expr {
  if (match("FALSE")) return createLiteralExpr(false);
  if (match("TRUE")) return createLiteralExpr(true);
  if (match("NIL")) return createLiteralExpr(null);

  if (match("NUMBER", "STRING")) {
    return createLiteralExpr(previous().literal);
  }

  if (match("IDENTIFIER")) {
    return createVariableExpr(previous());
  }

  if (match("LEFT_PAREN")) {
    const expr = expression();
    consume("RIGHT_PAREN", "Expect ')' after expression.");

    return createGroupingExpr(expr);
  }

  throw parsingError(peek(), "Expect expression.");
}

function unary(): Expr {
  if (match("BANG", "MINUS")) {
    const operator = previous();
    const right = unary();

    return createUnaryExpr(operator, right);
  }

  return primary();
}

function factor(): Expr {
  let expr = unary();

  while (match("SLASH", "STAR")) {
    const operator = previous();
    const right = unary();

    expr = createBinaryExpr(expr, operator, right);
  }

  return expr;
}

function term(): Expr {
  let expr = factor();

  while (match("MINUS", "PLUS")) {
    const operator = previous();
    const right = factor();

    expr = createBinaryExpr(expr, operator, right);
  }

  return expr;
}

function comparison(): Expr {
  let expr = term();

  while (match("GREATER", "GREATER_EQUAL", "LESS", "LESS_EQUAL")) {
    const operator = previous();
    const right = term();

    expr = createBinaryExpr(expr, operator, right);
  }

  return expr;
}

function equality(): Expr {
  let expr = comparison();

  while (match("BANG_EQUAL", "EQUAL_EQUAL")) {
    const operator = previous();
    const right = comparison();

    expr = createBinaryExpr(expr, operator, right);
  }

  return expr;
}

function assignment(): Expr {
  const expr = or();

  if (match("EQUAL")) {
    const equals = previous();
    const value = assignment();

    if (expr._type === "VariableExpr") {
      const name = expr.name;
      return createAssignExpr(name, value);
    }

    parsingError(equals, "Invalid assignment target.");
  }

  return expr;
}

function or(): Expr {
  let expr = and();

  while (match("OR")) {
    const operator = previous();
    const right = and();
    expr = createLogicalExpr(expr, operator, right);
  }

  return expr;
}

function and() {
  let expr = equality();

  while (match("AND")) {
    const operator = previous();
    const right = equality();
    expr = createLogicalExpr(expr, operator, right);
  }

  return expr;
}

function expression(): Expr {
  return assignment();
}
