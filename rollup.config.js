import babel from "rollup-plugin-babel"
import commonjs from "rollup-plugin-commonjs"
import nodeResolve from "rollup-plugin-node-resolve"
import strip from "rollup-plugin-strip"
import uglify from "rollup-plugin-uglify"

const prod = process.env.NODE_ENV === "production"

export default {
    entry: "index.js",
    format: "umd",
    indent: "\t",
    moduleName: "orchard-lane-three",
    dest: prod
        ? "dist/orchard-lane-three.min.js"
        : "dist/orchard-lane-three.js",
    sourceMap: !prod,
    plugins: [
        nodeResolve({
            jsnext: true,
            main: true,
            preferBuiltins: false,
        }),
        commonjs({
            include: [
                "node_modules/bluebird/**",
                "node_modules/raf-loop/**",
                "node_modules/redux/**",
                "node_modules/lodash.isobject/**",
            ],
        }),
        babel({
            babelrc: false,
            exclude: "node_modules/**",
            presets: [
                ["es2015", { loose: true, modules: false }],
                ["stage-0"],
                ["stage-1"],
                ["stage-2"],
            ],
            plugins: [
                "transform-decorators-legacy",
                "external-helpers",
            ],
        }),
        prod && strip({ sourceMap: false }),
        prod && uglify(),
    ],
}
