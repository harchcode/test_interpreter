import fs from "node:fs";

const exprList = [
  "Binary   : Expr left, Token operator, Expr right",
  "Grouping : Expr expression",
  "Literal  : unknown value",
  "Unary    : Token operator, Expr right",
];

function main() {
  const path = process.argv[2];

  const writer = fs.createWriteStream(path, { flags: "w" });

  const writeLine = (str: string) => {
    writer.write(str + "\n");
  };

  const typeNames: string[] = [];

  writeLine(`import { Token } from "./token";`);

  for (const expr of exprList) {
    writeLine("");

    const tmp = expr.split(":");

    const typeName = `${tmp[0].trim()}Expr`;
    typeNames.push(typeName);

    writeLine(`export type ${typeName} = {`);

    const props = tmp[1].split(",").map((p) => p.trim());

    for (const prop of props) {
      const ttmp = prop.split(" ");

      const propType = ttmp[0].trim();
      const propName = ttmp[1].trim();

      writeLine(`  ${propName}: ${propType};`);
    }

    writeLine(`  accept: <R>(visitor: Visitor<R>, expr: ${typeName}) => R;`);
    writeLine(`};`);

    writeLine(
      `function _accept${typeName}<R>(visitor: Visitor<R>, expr: ${typeName}): R {`
    );
    writeLine(`  return visitor.visit${typeName}(expr);`);
    writeLine(`}`);

    writeLine(`export function create${typeName}(`);

    for (const prop of props) {
      const ttmp = prop.split(" ");

      const propType = ttmp[0].trim();
      const propName = ttmp[1].trim();

      writeLine(`  ${propName}: ${propType},`);
    }

    writeLine(`): ${typeName} {`);

    writeLine(`  return {`);

    for (const prop of props) {
      const ttmp = prop.split(" ");
      const propName = ttmp[1].trim();

      writeLine(`    ${propName},`);
    }

    writeLine(`    accept: _accept${typeName},`);

    writeLine(`  };`);
    writeLine(`}`);
  }

  // visitor type
  writeLine("");
  writeLine(`export type Visitor<R> = {`);

  for (const typeName of typeNames) {
    writeLine(`  visit${typeName}: (expr: ${typeName}) => R;`);
  }

  writeLine(`};`);

  // union type
  writeLine("");
  writeLine(`export type Expr =`);

  for (const typeName of typeNames) {
    writeLine(
      `  | ${typeName}${
        typeName === typeNames[typeNames.length - 1] ? ";" : ""
      }`
    );
  }
}

main();
