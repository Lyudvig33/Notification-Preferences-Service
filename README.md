# Notification Preferences Service

Сервис управления предпочтениями уведомлений — единый источник правды для решений `allow` / `deny` по типу уведомления, каналу, региону и quiet hours.

**Стек:** TypeScript, NestJS, TypeORM, PostgreSQL.

## Быстрый старт

### 1. PostgreSQL

```bash
docker compose up -d
```

### 2. Переменные окружения

```bash
cp .env.example .env
```

### 3. Установка и запуск

```bash
yarn install
yarn start:dev
```

Сервис поднимется на `http://localhost:3000`. При старте TypeORM синхронизирует схему, а seed заполнит дефолтные предпочтения и глобальные политики.

### Swagger

Интерактивная документация API: [http://localhost:3000/api](http://localhost:3000/api)

## API

### Получить предпочтения пользователя

```bash
curl http://localhost:3000/users/user-1/preferences
```

### Изменить предпочтения

```bash
curl -X POST http://localhost:3000/users/user-1/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "commandId": "cmd-1",
    "changes": [
      {
        "action": "set_channel_preference",
        "notificationType": "marketing_email",
        "channel": "email",
        "enabled": false
      }
    ],
    "quietHours": {
      "enabled": true,
      "start": "22:00",
      "end": "08:00",
      "timezone": "Europe/Berlin"
    }
  }'
```

### Проверить возможность отправки

```bash
curl -X POST http://localhost:3000/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-1",
    "notificationType": "marketing_sms",
    "channel": "sms",
    "region": "EU",
    "datetime": "2026-05-21T21:30:00Z"
  }'
```

## Тесты

Unit-тесты (доменная логика, без БД):

```bash
yarn test
```

E2E-тесты (нужен запущенный PostgreSQL):

```bash
docker compose up -d
yarn test:e2e
```

E2E покрывают все 5 сценариев из ТЗ: дефолты, изменение настроек, quiet hours, глобальные политики, идемпотентность.

## Архитектура

```
notification-preferences-service/
├── entities/              # TypeORM entities (корень проекта)
├── src/
│   ├── resources/         # Controllers + Services
│   │   ├── controllers/
│   │   └── services/
│   └── modules/           # NestJS modules
│       ├── config/
│       ├── database/
│       └── preferences/
│           ├── dto/
│           ├── repositories/
│           └── domain/    # Чистая бизнес-логика
└── test/
```

**Ключевые решения:**

- **REST API** — три endpoint'а из ТЗ.
- **Hexagonal-style слои** — домен не зависит от инфраструктуры; репозитории реализуют ports.
- **Эффективные предпочтения** = defaults ∪ user overrides (lazy init пользователя при первом запросе).
- **Pipeline evaluate:** глобальная политика → user preference → quiet hours (только `marketing_*`).
- **Идемпотентность** — `commandId` или hash payload в `preference_change_log`.
- **Таймзоны** — Luxon (IANA timezone).
- **Логирование** — structured logs для изменений настроек и решений evaluate.

**Метрики (куда добавить в prod):**

- `notification_evaluations_total{decision, reason}` — в `EvaluateNotificationUseCase`
- `preference_updates_total` — в `UpdateUserPreferencesUseCase`
- `evaluation_duration_ms` — histogram вокруг evaluator

## Что добавил бы для продакшена

- Миграции TypeORM вместо `synchronize`
- Аутентификация сервис-сервис (mTLS / JWT)
- Admin API для global policies
- Redis-кэш resolved preferences для hot path `/evaluate`
- Event bus (`PreferencesUpdated`) для синхронизации с downstream
- OpenTelemetry (traces + metrics)
- Audit trail с версионированием предпочтений
- Health checks (`/health`, `/ready`)

## License

UNLICENSED
