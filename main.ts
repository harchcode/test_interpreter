import { runFile } from "./nol";

function main() {
  const path = process.argv[2];

  runFile(path);
}

main();
