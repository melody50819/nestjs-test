## Description

使用 NestJS 實作租借車 API。

## ER Model

1. 基本資料表: User, Scooter, Rent。
2. 限制同一個人同時間只能租借一台車，一台車同時也只能被一個人使用。

![alt text](/images/ERD.png)

### 租借檢核

![alt text](/images/rent.png)

### 歸還檢核

![alt text](/images/return.png)

## 衍生思考

1. 租借時的檢核
   - 檢核順序：會員狀態、車子狀態、車子是否已被租借&會員是否已租借一台車子(雙向)
   -
2. 尖峰時段（高併發），車子狀態的頻繁更新
   - 資料庫讀寫分離
   - 使用消息佇列
     - 採用短輪詢批量處理數據更新
     - 缺點
       - 一段時間車子狀態不一致性
   - 緩存
     - 安排預先「可租借的車子」，存於緩存資料庫
     - 缺點
       - 用戶不能夠指定車子
       - 可能需要搭配人力，將車子運送到各個租借站
3. 其他
   - 車子故障回報
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
