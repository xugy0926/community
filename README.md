## 我为什么要开发这个社区项目？

在 github 上的社区类项目很多，再开发一个不一定能比他们做的更好。

在前后端技术飞速发展的年代，每一个学习者或者从业者都应该具备持续学习的能力。基于这个原因，维护这个项目是为了不断用新技术来改善这个项目，把学到的运用起来。这也是我一直以来崇尚的学习方法。

## Getting Started

#### Requirements

- Yarn package
- Node.js v8.9.1 or newer
- pm2 package

#### Data storage

- mongodb
- redis

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

The three most important configurations

- mongodb
- redis
- github，获取 github 登录用的信息请参考 https://github.com/settings/developers

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
$ yarn
$ yarn run build
$ pm2 stop community
$ pm2 start community
```

or

```
$ make update
```

#### pm2 deploy

```
pm2 deploy ecosystem.json production --force
```