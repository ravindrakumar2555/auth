import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Server } from 'http';
import request, { type Response } from 'supertest';
import { AppModule } from './../src/app.module';

interface AuthBody {
  accessToken?: string;
  user?: {
    email?: string;
  };
}

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer() as Server;
  });

  it('/ (GET)', () => {
    return request(httpServer).get('/').expect(200).expect({
      message: 'Auth API is running',
    });
  });

  it('/auth/signup (POST)', () => {
    return request(httpServer)
      .post('/auth/signup')
      .send({
        name: 'Ravi',
        email: 'ravi@example.com',
        password: 'secret123',
      })
      .expect(201)
      .expect((response: Response) => {
        const body = response.body as AuthBody;
        expect(body.accessToken).toBeDefined();
        expect(body.user?.email).toBe('ravi@example.com');
      });
  });

  it('/auth/signin (POST)', async () => {
    await request(httpServer).post('/auth/signup').send({
      name: 'Ravi',
      email: 'ravi@example.com',
      password: 'secret123',
    });

    return request(httpServer)
      .post('/auth/signin')
      .send({
        email: 'ravi@example.com',
        password: 'secret123',
      })
      .expect(201)
      .expect((response: Response) => {
        const body = response.body as AuthBody;
        expect(body.accessToken).toBeDefined();
        expect(body.user?.email).toBe('ravi@example.com');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
