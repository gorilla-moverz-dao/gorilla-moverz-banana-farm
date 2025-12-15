import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://indexer.mainnet.movementnetwork.xyz/v1/graphql",
  documents: ["src/**/*.tsx", "src/**/*.ts", "convex/**/*.ts"],
  ignoreNoDocuments: true,
  generates: {
    "src/gql/": {
      preset: "client",
      plugins: [],
      config: {
        documentMode: "string",
        useTypeImports: true,
      },
      presetConfig: {
        fragmentMasking: false,
      },
    },
  },
};

export default config;
