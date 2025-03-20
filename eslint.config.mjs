import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["eslint.config.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    ignores: ["dist/**"],
  },
  {
    rules: {
      "@typescript-eslint/non-nullable-type-assertion-style": "off",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    },
  }
);
