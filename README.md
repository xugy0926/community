## Getting Started

#### Requrements

- Yarn package 
- Node.js v8.9.1 or newer
- pm2 package

#### Quick Start

1. Get the latest version

```
$ git clone https://github.com/xugy0926/community.git
$ cd community
```

2. Run yarn install

```
$ yarn
```

3. Modify src/config/index.dev.js

4. Run dev

```
$ yarn run dev
```

## Deploy

#### How to deploy

1. Get the latest version

```
$ git clone https://github.com/xugy0926/community.git
$ cd community
$ yarn
```

2. Create src/config/index.pro.js

```
$ yarn run config
```

3. Modify src/config/index.pro.js

4. Run production

```
$ yarn run build
$ NODE_ENV=production PORT=80 pm2 start dist/server.js --name "community"
```

or

```
$make depoly
```

#### How to update

```
$ git pull
$ yarn run build
$ pm2 stop community
$ pm2 start community
```

or

```
$ make update
```
