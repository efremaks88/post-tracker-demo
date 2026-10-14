# D0 — первый вертикальный срез продюсерской

Продюсерская использует общие `projects`, `series` и `people`, но хранит собственные сущности в `production_blocks`, `production_task_groups` и `production_tasks`. Таблица постпродакшн-смен `tasks` не используется для продюсерских задач.

Запись выполняется отдельными API-командами в транзакции. `auditMutation` снимает подтверждённое состояние до и после изменения и пишет событие аудита в той же транзакции. Клиент не передаёт автора, время или готовую запись истории.

Маршруты:

- `GET /api/producer/dashboard`
- `GET /api/producer/projects/:projectId`
- `POST /api/producer/projects/:projectId/blocks`
- `GET /api/producer/blocks/:blockId`
- `POST /api/producer/blocks/:blockId/groups`
- `POST /api/producer/blocks/:blockId/tasks`
- `PATCH /api/producer/tasks/:taskId`

Доступ задают `producer.read` и `producer.write`, а изменение конкретного проекта дополнительно проверяется через существующую проектную область прав. В D0 доступ имеют роли `admin`, `lead` и `manager`; менеджер изменяет только назначенные ему проекты.

Локальные данные добавляются отдельным маркером `local_demo_producer_seeded`, поэтому обновление существующей локальной базы не пересоздаёт старые данные. `RESET_PRODUCER_DEMO.bat` работает только с файловой PGlite-базой в каталоге приложения.
