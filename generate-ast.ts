import fs from "node:fs";

const exprList = [
  "Assign   : Token name, Expr value",
  "Binary   : Expr left, Token operator, Expr right",
  "Grouping : Expr expression",
  "Literal  : unknown value",
  "Logical  : Expr left, Token operator, Expr right",
  "Unary    : Token operator, Expr right",
  "Variable : Token name",
];

const stmtList = [
  "Block      : Stmt[] statements",
  "If         : Expr condition, Stmt thenBranch, Stmt|null elseBranch",
  "Expression : Expr expression",
  "Print      : Expr expression",
  "Var        : Token name, NullableExpr initializer",
  "While      : Expr condition, Stmt body",
];

function defineAST(
  outputDir: string,
  name: string,
  content: string[],
  imports: Record<string, string>
) {
  const nameLower = name.toLowerCase();

  const writer = fs.createWriteStream(`${outputDir}/${nameLower}.ts`, {
    flags: "w",
  });

  const writeLine = (str: string) => {
    writer.write(str + "\n");
  };

  const typeNames: string[] = [];

  for (const k in imports) {
    writeLine(`import { ${imports[k]} } from "${k}";`);
  }

  for (const expr of content) {
    writeLine("");

    const tmp = expr.split(":");

    const typeName = `${tmp[0].trim()}${name}`;
    typeNames.push(typeName);

    writeLine(`export type ${typeName} = {`);

    const props = tmp[1].split(",").map((p) => p.trim());

    for (const prop of props) {
      const ttmp = prop.split(" ");

      const propType = ttmp[0].trim();
      const propName = ttmp[1].trim();

      writeLine(`  ${propName}: ${propType};`);
    }

    writeLine(`  _type: "${typeName}";`);
    writeLine(`};`);

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

    writeLine(`    _type: "${typeName}",`);

    writeLine(`  };`);
    writeLine(`}`);
  }

  // visitor type
  writeLine("");
  writeLine(`export type Visitor<R> = {`);

  for (const typeName of typeNames) {
    writeLine(`  visit${typeName}: (${nameLower}: ${typeName}) => R;`);
  }

  writeLine(`};`);

  // union type
  writeLine("");
  writeLine(`export type ${name} =`);

  for (const typeName of typeNames) {
    writeLine(
      `  | ${typeName}${
        typeName === typeNames[typeNames.length - 1] ? ";" : ""
      }`
    );
  }

  // nullable
  writeLine("");
  writeLine(`export type Nullable${name} = ${name} | null;`);

  // accept
  writeLine("");
  writeLine(
    `export function accept<R>(${nameLower}: ${name}, visitor: Visitor<R>) {`
  );
  writeLine(`  switch (${nameLower}._type) {`);

  for (const typeName of typeNames) {
    writeLine(`    case "${typeName}":`);
    writeLine(`      return visitor.visit${typeName}(${nameLower});`);
  }

  writeLine(`  }`);
  writeLine(`}`);
}

function main() {
  const path = process.argv[2];

  defineAST(path, "Expr", exprList, { "./token": "Token" });
  defineAST(path, "Stmt", stmtList, {
    "./token": "Token",
    "./expr": "Expr, NullableExpr",
  });
}

main();
