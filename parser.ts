import {
  Expr,
  createBinaryExpr,
  createGroupingExpr,
  createLiteralExpr,
  createUnaryExpr,
  createVariableExpr,
} from "./expr";
import { error } from "./nol";
import {
  Stmt,
  createExpressionStmt,
  createPrintStmt,
  createVarStmt,
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

function statement() {
  if (match("PRINT")) return printStatement();

  return expressionStatement();
}

function printStatement() {
  const value = expression();
  consume("SEMICOLON", "Expect ';' after value.");

  return createPrintStmt(value);
}

function expressionStatement() {
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

function expression(): Expr {
  return equality();
}
