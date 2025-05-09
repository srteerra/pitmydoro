import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    plugins: ["next", '@typescript-eslint'],
    parser: '@typescript-eslint/parser',
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    },
    overrides: [
      {
        files: ['*.ts', '*.tsx'],
        parserOptions: {
          project: ['./tsconfig.json'],
          projectService: true,
          tsconfigRootDir: __dirname,
        },
        extends: [
          'next/core-web-vitals',
          'plugin:@typescript-eslint/recommended',
          "prettier"
        ]
      },
    ],
  }
];

export default eslintConfig;
