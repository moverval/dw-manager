import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import builtins from "rollup-plugin-node-builtins";

const externalLibs = [
    "discord.js",
    "fs",
    "dotenv"
];

export default [
    {
        input: "./src/index.ts",
        external: externalLibs,
        output: [
            {
                file: "./dist/index.js",
                format: "umd"
            }
        ],
        plugins: [
            typescript(),
            terser({
                output: {
                    comments: false,
                    semicolons: false
                },
                keep_classnames: false,
                keep_fnames: false
            }),
            builtins()
        ]
    },
    {
        input: "./src/index.ts",
        external: externalLibs,
        output: [
            {
                file: "./dist/index_expanded.js",
                format: "umd"
            }
        ],
        plugins: [
            typescript({ useTsconfigDeclarationDir: true }),
            builtins()
        ]
    }
]
