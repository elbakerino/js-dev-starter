# JS DEV Starter

> basic working setup, not yet optimized in various aspects

Starter repository for isomorphic JS development, with npm workspaces and strict ESM support.

## Setup

Install dependencies:

```shell
npm i
```

Configure:

```shell
cp .env.example .env
```

## Usage

Start dev compilation and local server:

```shell
npm run start-dev
# default: http://localhost:8080
```

Only compile, for e.g. server-in-docker (docker example setup not yet included):

```shell
npm run dev
```

Build production assets:

```shell
npm run build
```

Start test-driven-development:

```shell
npm run tdd
```

Start [storybook](https://storybook.js.org):

```shell
npm run storybook
# default: http://localhost:8081
```

Start style watcher, requires a running `npm run dev` or `npm run build`, is included in `npm run start-dev`:

```shell
node cli styles --watch
```

## Overview

Using:

- **npm workspaces** for monorepo handling
- **babel** for packages and server files transpilation to ESM
- **webpack** for bundling client-side assets
- **sass** for pre-building CSS files (separate to e.g. webpack-loader)
- **express.js** as NodeJS webserver (atm. using an, undocumented, micro-framework for routing + cli)
- **liquid** templates with LiquidJS for server-side templating
- **ReactJS** with support for client and server-side rendering
    - using [react/jsx-runtime](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) for React v18 (no import of React just for JSX)
    - example of [`renderToString`](./src/handler/HomeHandler.tsx) for synchronous rendering
    - example of `renderToPipeableStream` [without client streaming](./src/handler/StreamStaticHandler.tsx) and [with client streaming](./src/handler/StreamHandler.tsx) for `Suspense` supported rendering
- **Typescript** everywhere, with strict ESM (`NodeNext`) resolution
- **eslint** for linting JS/TS files
- **jest** for automatic tests

Supports project structures:

- ✔️ 1 Server, 1 App, unlimited packages
    - Restricted to a 'single root project' (which is the app + server) since npm workspaces seem to work only with the root project's `package.json`, which is the only one correctly locked, and there is no strict independence between packages, unlike what `lerna` provides.
- ❌ unlimited Servers, 1 App, unlimited packages
    - requires e.g. `lerna` style independent handling of `package-lock.json` in nested projects
- ❌ 1 Server, unlimited Apps, unlimited packages
    - requires multi-webpack config setup
    - or requires separate webpack entrypoints with route-to-used-entrypoints mapping
- ❌ unlimited Servers, unlimited Apps, unlimited packages
    - requires e.g. `lerna` style independent handling of `package-lock.json` in nested projects and multi-webpack config setup
    - e.g. [`content-ui`](https://github.com/control-ui/content-ui) has such a setup, using manual locking for servers, dev with `ts-node` instead of `babel`, *but without separating the apps dependencies atm.*

> the correct handling of `package-lock.json` per deployable server is a requirement, but with workarounds, like locking the respective package extra in CI, which isn't the best practice

> some structures may benefit from full ts-node for development, using babel only for production bundling

## Things to solve

- basic Jest/testing-library setup, **but not yet optimized/fully setup**
- contains basic example on data providers for server+client-side rendering, **but does not contain react routing and respective data loading yet**
- storybook and styles (webpack-imports, separate stylesheets) are not that good integrated yet
- the assets, especially styles, should be somewhere else, to better support e.g. file-deletion sync
- babel compilation didn't support file-deletion syncs, check if maybe now theres some workaround
- the server uses `spdy` for HTTP2 support (required for HTTP2-Plain for E2E-HTTP2 on Google Cloud Run), try to use only native HTTP2
