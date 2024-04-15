import { defineConfig } from 'vite'
import path from 'path'
// import dts from 'vite-plugin-dts'

const config = defineConfig({
    build: {
        minify: false,
        lib: {
            entry: ["./src/kapsule.ts"],
            name: "kapsule",
            formats: [/* 'cjs', */ 'es' /*, 'umd'*/],
            fileName: (format: string, entryName: string) => `${entryName}.${format}.js`
        },
        sourcemap: true,
        rollupOptions: {
            external: ['voby', 'oby', "voby/jsx-runtime",],
            output: {
                globals: {
                    'voby': 'voby',
                    'oby': 'oby',
                }
            }
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
    plugins: [
        // dts({ entryRoot: './src', outputDir: './dist/types', exclude: './nodes_modules' })
    ],
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'),
            'voby/jsx-dev-runtime': process.argv.includes('dev') ? path.resolve('../woby/src/jsx/runtime') : 'voby/jsx-runtime',
            'voby/jsx-runtime': process.argv.includes('dev') ? path.resolve('../woby/src/jsx/runtime') : 'voby/jsx-runtime',
            'voby': process.argv.includes('dev') ? path.resolve('../woby/src') : 'voby'
        },
    },
})



export default config
