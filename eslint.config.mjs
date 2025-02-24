import tseslint from "typescript-eslint";
import eslint from '@eslint/js'

export default tseslint.config({
    files: ['src/**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    }
  },
)
