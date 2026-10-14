# Процесс безопасности

Сертификат не входит в этот набор работ: его меняет ИТ.

Перед выкладкой изменений, связанных с безопасностью:

1. Если менялся `src/index.jsx`, собрать фронт: `npm run build`.
2. Запустить синтаксические проверки: `npm run check`.
3. Запустить smoke-проверку безопасности: `npm run security:smoke`.
4. Хранить рабочие секреты вне папки приложения: `/etc/postprod-tracker/postprod-tracker.env`.
5. В `public/` держать только файлы, которые должны отдаваться браузеру: никаких backup, dump, old-copy и tmp-файлов.
6. Не держать старый `index.html` и `.txt`-документы в корне приложения.
7. Серверные изменения применять на сервере командой: `bash scripts/apply-server-security.sh`.
8. После применения проверить живые заголовки: `curl -k -I https://127.0.0.1/`.

Серверный apply-скрипт делает:

- перенос `.env` в `/etc/postprod-tracker/postprod-tracker.env`;
- обновление systemd `EnvironmentFile`;
- nginx CSP без внешних CDN;
- `ssl_protocols TLSv1.2 TLSv1.3;`;
- `server_tokens off;`;
- nginx deny для `.txt` и backup-like файлов;
- удаление production-файла `test_ldap.js`, если он остался на сервере;
- выравнивание владельца файлов приложения на `tracker:tracker`;
- `npm install` для применения dependency overrides;
- `nginx -t`, `npm run check`, `npm run security:smoke`, рестарт приложения, reload nginx.
Текущий CSP для работающего интерфейса:

`default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`

## Новый аудит от 22.07.2026

Закрывается кодом и apply-скриптом:

- session fixation: после успешного LDAP-входа сессия регенерируется до записи пользователя;
- LDAP injection: логин валидируется и экранируется перед подстановкой в LDAP filter;
- cookie name: вместо стандартного `connect.sid` используется `tracker.sid`;
- CSRF/cookie: `sameSite: "strict"` сохранён;
- pg session TTL: явно задано 24 часа;
- принудительное удаление других сессий пользователя стало opt-in через `SINGLE_SESSION_PER_USER=true`;
- JSON body limit: снижен до `5mb`;
- rate limit: ключ теперь учитывает авторизованного пользователя, а не только IP;
- IDOR/RBAC: список пользователей только для admin/manager, изменение ролей и проектных доступов только для admin;
- editor больше не может неявно создать новый проект через `POST /api/data/project`;
- `body-parser` закреплён через `overrides`, применяется после `npm install`;
- `test_ldap.js` запрещён smoke-проверкой и удаляется apply-скриптом.

Остаётся за инфраструктурой/ИТ:

- ротировать все пароли, которые попадали в тестовые файлы или аудит;
- перевести LDAP на LDAPS/StartTLS, когда будет готов сертификат AD;
- обновить runtime Node.js на сервере до 20/22 LTS;
- остановить/удалить cloudflared, если туннель действительно не используется;
- настроить централизованный vault или другой защищённый способ хранения секретов.
