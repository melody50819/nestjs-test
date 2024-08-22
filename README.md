## Description

實作租借車 API。

## ER Model

1. 基本資料表: User, Scooter, Rent。
2. 限制同一個人同時間只能租借一台車，一台車同時也只能被一個人使用。

![alt text](/images/ERD.png)

### 租借流程
![alt text](/images/rent.png)

### 歸還流程
![alt text](/images/return.png)


## 衍生思考
1. 租借時的檢核
    - 檢核順序：會員狀態、車子狀態、車子是否已被租借&會員是否已租借一台車子(雙向)
    - 
2. 可靠性
    - 高併發時，車子狀態的頻繁更新
    - 車子狀態不一致

3. 其他
    - 備用車子
    - 金額計算
---

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```