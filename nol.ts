import fs from "node:fs";
import { initScanner, scanTokens } from "./scanner";
import { Token } from "./token";
import { initParser, parse } from "./parser";
import { printAST } from "./print-ast";
import { RuntimeError } from "./runtime-error";
import { interpret } from "./interpreter";

let hadError = false;
let hadRuntimeError = false;

function report(line: number, where: string, message: string) {
  console.log(`[line ${line}] Error${where}: ${message}`);
  hadError = true;
}

export function error(lineOrToken: number | Token, message: string) {
  if (typeof lineOrToken === "number") {
    report(lineOrToken, "", message);
  } else if (lineOrToken.type === "EOF") {
    report(lineOrToken.line, " at end", message);
  } else {
    report(lineOrToken.line, " at '" + lineOrToken.lexeme + "'", message);
  }
}

export function runtimeError(error: RuntimeError) {
  console.log(`${error.message}\n[line ${error.token.line}]`);

  hadRuntimeError = true;
}

export function run(source: string) {
  initScanner(source);
  const tokens = scanTokens();

  initParser(tokens);
  const expr = parse();

  if (hadError || !expr) return;

  // console.log(printAST(expr));
  interpret(expr);
}

export function runFile(path: string) {
  try {
    const data = fs.readFileSync(path, "utf8");
    run(data);

    if (hadError) process.exit(65);
    if (hadRuntimeError) process.exit(70);
  } catch (err) {
    console.error(err);
  }
}
