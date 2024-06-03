import { TokenType } from "./token-type";

export type Token = {
  type: TokenType;
  lexeme: string;
  literal: unknown;
  line: number;
};

export function createToken(
  type: TokenType,
  lexeme: string,
  literal: unknown,
  line: number
): Token {
  return {
    type,
    lexeme,
    literal,
    line,
  };
}
