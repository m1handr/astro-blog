---
title: "JWT токены или же Token-Based Auth"
description: "В этой статье вы узнаете: что такое JWT, где их хранить, как происходит процесс авторизации, процесс рефреша токенов и зачем всё это нужно."
pubDate: "2024-09-10"
heroImage: "blog-placeholder-1.jpg"
---

# Что такое JWT токен?

**JWT (JSON Web Token)** — токен состоящий из 3 частей:

1. **Header (заголовок)** - содержит информацию о типе токена и алгоритме, который используется для его подписи.

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

2. **Payload (полезные данные)** - содержит информацию о пользователе, который выполнил аутентификацию. Может содержать в себе как стандартные данные (например, `sub`, `iat`, `exp`), так и данные пользователя (например, `name`, `admin`). Так как данные с этого блока легко достаются, то ни в коем случае не храните в них `sensetive data` (например, пароль пользователя, данные карты и т.д.).

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true
}
```

3. **Signature (Подпись)** - подпись токена, созданная путем шифрования с использованием секретного ключа. Этот блок позволяет проверить подлинность токена и убедиться, что он не был изменен злоумышленником. При попытке злоумышленником изменить данные в первых двух блоках, токен станет не валидным.

> 1 и 2 часть также дополнительно шифрутся в формате base64

```json title="Пример JWT токена с разшифрованными 1 и 2 частями"
{
  "alg": "HS256",
  "typ": "JWT"
}.{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true
}.xxJ3N6lszE55FzgmmunxRzhvQBh6cs_pr5FXyvK7mko
```

# Как его используют для авторизации?

На самом деле для авторизации пользователя используется 2 токена:

**Access token (Токен доступа)** - самый обычный JWT токен, хранящий в себе информация о пользователе. Используется для авторизации отправляемых запросов на сервер. Добавляется в каждый запрос с помощью HTTP заголовка `Authorization: Bearer <token>`. На все запросы без токена отправляйте ошибку **401 Unauthorized**. Данный токен не хранится в базе данных, а лишь локально на клиенте.

**Refresh token (Токен сброса)** - еше один JWT токен используемый для получения нового **Access token**'а. На сервере - хранится в базе данных, а после использования удаляется и создается новый. На клиенте - хранится исключительно в **httpOnly куке**.

```json title="Пример записи Refresh token'а в базе данных"
{
	userId: uuid,
	fingerprint: string, // Или IP адрес клиента
	refreshToken: JWT token,
}
```

**Запись Refresh token'а должна содержать** в себе либо **fingerprint**, либо **ip адресс** клиента, создавшего этот токен. Это нужно, что бы злоумышленник, скомпрометировав данный токен не смог получить новый **Access token.**

Каждый токен имеет свой срок действия (TTL - Time To Live), по истечении которого он не может быть использован. **TTL Access токена обычно равен 3-10 минут**, а **TTL Refresh токена — равен 1 недели**. Их сроки жизни могут быть изменены в зависимости от нужд вашего приложения.

# План авторизации

1. Пользователь передает логин и пароль на сервер.
2. Сервер проверяет логин и пароль.
3. Если логин и пароль верны, тогда сервер подписывает **Access token** и **Refresh token** и создает запись в базе данных с **Refresh token**'ом.
4. Сервер устанавливает **Refresh token** в **httpOnly** куку, а **Access token** отдает на клиент.
5. Клиент получает **Access token** и сохраняет его в локальном сторе приложения или localStorage (Не рекомендуется).
6. Клиент добавляет полученный **Access token** ко всем запросам для авторизации.
7. В случае окончания срока действия **Access token'а**: клиент отправляет запрос на специально отведенный **api endpoint**, который берет **Refresh token из куки**, ищет запись с данным токеном в базе данных и сверяет **Fingerprint (Или IP адрес) клиента и Fingerprint (Или IP адрес) из базы**. Если всё сходится, то создается **новая пара ключей** и повторяются пункты плана описанные выше.

### Важно!

- В **куке с Refresh token'ом** в `path` установите корневой путь auth контроллера (/api/auth). Таким образом токен получат только те хендлеры которым он нужен (/api/auth/logout и /api/auth/refreshTokens).
- Храните **Refresh token** в базе данных только в зашифрованном виде с целью избежания его кражи злоумышленниками.

# Зачем использовать JWT токены?

### Гибкость

JWT содержит всю **необходимую информацию** о пользователе и его правах доступа. Это избавляет от необходимости хранить сессии на сервере, что **снижает нагрузку** на сервер и **упрощает масштабирование**.

### Масшабируемость

Поскольку JWT **не требует постоянного хранения сессий на сервере**, его легко использовать в распределенных системах или в **микросервисной архитектуре**, где могут быть задействованы несколько серверов.

### Безопасность

При использовании JWT мы **видим проблему с безопасностью** и стараемся предусмотреть механизмы контроля в **случае каржи** авторизационных данных.

_Однако, у каждой задачи есть свой подход. Если ваше приложение небольшое, то используйте sessions auth, если наоборот, то Token Based Auth_

# Подведем итоги

- **Access token** храним только на клиенте в **глобальном сторе** или **localStorage** (Лучше в глобальном сторе)
- **Refresh token** храним на сервере в базе данных и в **httpOnly куке**
- При запросе (/api/auth/reffeshTokens) для рефреша токенов **сверяйте fingerprint или ip адрес клиента** с записью в базе данных и только после генерируйте **новые токены**.
