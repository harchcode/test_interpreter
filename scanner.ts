import { error } from "./nol";
import { Token, createToken } from "./token";
import { TokenType } from "./token-type";

const keywords: Record<string, TokenType> = {
  and: "AND",
  class: "CLASS",
  else: "ELSE",
  false: "FALSE",
  for: "FOR",
  fun: "FUN",
  if: "IF",
  nil: "NIL",
  or: "OR",
  print: "PRINT",
  return: "RETURN",
  super: "SUPER",
  this: "THIS",
  true: "TRUE",
  var: "VAR",
  while: "WHILE",
};

let start = 0;
let current = 0;
let line = 1;
let source = "";

const tokens: Token[] = [];

export function initScanner(_source: string) {
  source = _source;
}

function isAtEnd() {
  return current >= source.length;
}

function advance() {
  return source.charAt(current++);
}

function addToken(type: TokenType, literal: unknown = null) {
  const text = source.substring(start, current);
  tokens.push(createToken(type, text, literal, line));
}

function match(expected: string) {
  if (isAtEnd()) return false;
  if (source.charAt(current) != expected) return false;

  current++;

  return true;
}

function peek() {
  if (isAtEnd()) return "\0";
  return source.charAt(current);
}

function string() {
  while (peek() != '"' && !isAtEnd()) {
    if (peek() == "\n") line++;
    advance();
  }

  if (isAtEnd()) {
    error(line, "Unterminated string.");
    return;
  }

  // The closing ".
  advance();

  // Trim the surrounding quotes.
  const value = source.substring(start + 1, current - 1);
  addToken("STRING", value);
}

function isDigit(c: string) {
  return c >= "0" && c <= "9";
}

function number() {
  while (isDigit(peek())) advance();

  // Look for a fractional part.
  if (peek() == "." && isDigit(peekNext())) {
    // Consume the "."
    advance();
    while (isDigit(peek())) advance();
  }

  addToken("NUMBER", Number(source.substring(start, current)));
}

function peekNext() {
  if (current + 1 >= source.length) return "\0";
  return source.charAt(current + 1);
}

function identifier() {
  while (isAlphaNumeric(peek())) advance();

  const text = source.substring(start, current);
  const type = keywords[text] ?? "IDENTIFIER";

  addToken(type);
}

function isAlpha(c: string) {
  return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c == "_";
}

function isAlphaNumeric(c: string) {
  return isAlpha(c) || isDigit(c);
}

function scanToken() {
  const c = advance();

  switch (c) {
    case "(":
      addToken("LEFT_PAREN");
      break;
    case ")":
      addToken("RIGHT_PAREN");
      break;
    case "{":
      addToken("LEFT_BRACE");
      break;
    case "}":
      addToken("RIGHT_BRACE");
      break;
    case ",":
      addToken("COMMA");
      break;
    case ".":
      addToken("DOT");
      break;
    case "-":
      addToken("MINUS");
      break;
    case "+":
      addToken("PLUS");
      break;
    case ";":
      addToken("SEMICOLON");
      break;
    case "*":
      addToken("STAR");
      break;
    case "!":
      addToken(match("=") ? "BANG_EQUAL" : "BANG");
      break;
    case "=":
      addToken(match("=") ? "EQUAL_EQUAL" : "EQUAL");
      break;
    case "<":
      addToken(match("=") ? "LESS_EQUAL" : "LESS");
      break;
    case ">":
      addToken(match("=") ? "GREATER_EQUAL" : "GREATER");
      break;

    // ignore single-line comment
    case "/": {
      if (match("/")) {
        // A comment goes until the end of the line.
        while (peek() != "\n" && !isAtEnd()) advance();
      } else {
        addToken("SLASH");
      }
      break;
    }

    // Ignores
    case " ":
    case "\r":
    case "\t":
      break;
    case "\n":
      line++;
      break;

    // literal
    case '"':
      string();
      break;

    // Unexpected
    default:
      if (isDigit(c)) {
        number();
      } else if (isAlpha(c)) {
        identifier();
      } else {
        error(line, "Unexpected character.");
      }

      break;
  }
}

export function scanTokens() {
  while (!isAtEnd()) {
    start = current;

    scanToken();
  }

  tokens.push(createToken("EOF", "", null, line));
  return tokens;
}
