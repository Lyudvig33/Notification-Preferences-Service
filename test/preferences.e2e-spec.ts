import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { resetDatabase, seedReferenceData } from './e2e-setup';

describe('Notification Preferences (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await resetDatabase(dataSource);
    await seedReferenceData(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('scenario 1: new user receives default preferences', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/user-1/preferences')
      .expect(200);

    expect(response.body.userId).toBe('user-1');
    expect(response.body.channels).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          notificationType: 'transactional_email',
          enabled: true,
          source: 'default',
        }),
        expect.objectContaining({
          notificationType: 'marketing_email',
          enabled: false,
          source: 'default',
        }),
      ]),
    );
  });

  it('scenario 2: user can disable marketing email while transactional stays enabled', async () => {
    await request(app.getHttpServer())
      .post('/users/user-2/preferences')
      .send({
        commandId: 'disable-marketing-email',
        changes: [
          {
            action: 'set_channel_preference',
            notificationType: 'marketing_email',
            channel: 'email',
            enabled: false,
          },
        ],
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/users/user-2/preferences')
      .expect(200);

    const marketing = response.body.channels.find(
      (item: { notificationType: string }) =>
        item.notificationType === 'marketing_email',
    );
    const transactional = response.body.channels.find(
      (item: { notificationType: string }) =>
        item.notificationType === 'transactional_email',
    );

    expect(marketing).toMatchObject({ enabled: false, source: 'user' });
    expect(transactional).toMatchObject({ enabled: true, source: 'default' });
  });

  it('scenario 3: quiet hours block marketing push but not transactional', async () => {
    await request(app.getHttpServer())
      .post('/users/user-3/preferences')
      .send({
        commandId: 'set-quiet-hours',
        changes: [
          {
            action: 'set_channel_preference',
            notificationType: 'marketing_push',
            channel: 'push',
            enabled: true,
          },
        ],
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00',
          timezone: 'Europe/Berlin',
        },
      })
      .expect(201);

    const marketingDuringQuietHours = await request(app.getHttpServer())
      .post('/evaluate')
      .send({
        userId: 'user-3',
        notificationType: 'marketing_push',
        channel: 'push',
        region: 'US',
        datetime: '2026-05-21T21:00:00Z',
      })
      .expect(201);

    const transactionalDuringQuietHours = await request(app.getHttpServer())
      .post('/evaluate')
      .send({
        userId: 'user-3',
        notificationType: 'transactional_push',
        channel: 'push',
        region: 'US',
        datetime: '2026-05-21T21:00:00Z',
      })
      .expect(201);

    expect(marketingDuringQuietHours.body).toEqual({
      decision: 'deny',
      reason: 'blocked_by_quiet_hours',
    });
    expect(transactionalDuringQuietHours.body).toEqual({
      decision: 'allow',
      reason: 'allowed',
    });
  });

  it('scenario 4: global policy blocks marketing sms in EU', async () => {
    await request(app.getHttpServer())
      .post('/users/user-4/preferences')
      .send({
        commandId: 'enable-marketing-sms',
        changes: [
          {
            action: 'set_channel_preference',
            notificationType: 'marketing_sms',
            channel: 'sms',
            enabled: true,
          },
        ],
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/evaluate')
      .send({
        userId: 'user-4',
        notificationType: 'marketing_sms',
        channel: 'sms',
        region: 'EU',
        datetime: '2026-05-21T21:30:00Z',
      })
      .expect(201);

    expect(response.body).toEqual({
      decision: 'deny',
      reason: 'blocked_by_global_policy',
    });
  });

  it('scenario 5: repeated preference updates are idempotent', async () => {
    const payload = {
      commandId: 'disable-marketing-email-twice',
      changes: [
        {
          action: 'set_channel_preference',
          notificationType: 'marketing_email',
          channel: 'email',
          enabled: false,
        },
      ],
    };

    const first = await request(app.getHttpServer())
      .post('/users/user-5/preferences')
      .send(payload)
      .expect(201);

    const second = await request(app.getHttpServer())
      .post('/users/user-5/preferences')
      .send(payload)
      .expect(201);

    expect(second.body).toEqual(first.body);
  });
});
