// this file is not in TS, as just a simple bridge to the compiled code, for better DX
// run: `node cli --help`
// do not run using npm scripts - as they don't forward signals, it's broken again every now and then
// https://github.com/npm/npm/issues/4603
// https://github.com/npm/cli/issues/6684
import './build/cli.js'
