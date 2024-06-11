import path from 'path';
import cookie from '@fastify/cookie';
import formBody from '@fastify/formbody';
import staticFiles from '@fastify/static';
import dotenv from 'dotenv';
import Fastify from 'fastify';
import nunjucks from 'nunjucks';
import { z } from 'zod';
import { connect, newDb, SqliteSession, SqliteUserRepository } from './db';

dotenv.config();

const environment = process.env.NODE_ENV;
const cookieSecret = process.env.COOKIE_SECRET;

if (cookieSecret === undefined) {
  console.error('must set COOKIE_SECRET enviroment variable');
  process.exit(1);
}

const templates = new nunjucks.Environment(
  new nunjucks.FileSystemLoader('src/backend/templates')
);
const USERS_DB = './users.sqlite';

const fastify = Fastify({
  logger: true,
});

const accountCreateReqSchema = z.object({
  email: z.string(),
  password: z.string(),
  agreedToTerms: z.string().optional(),
});

type AccountCreateReq = z.infer<typeof accountCreateReqSchema>;

{
  fastify.register(formBody);
  fastify.register(cookie, {
    secret: cookieSecret,
  });
  fastify.register(staticFiles, {
    root: path.join(__dirname, '../../dist'),
  });
}

fastify.get('/', async (req, res) => {
  await res.redirect('/signin');
});

fastify.get('/signup', async (req, res) => {
  const rendered = templates.render('signup.njk', { environment });
  return await res
    .header('Content-Type', 'text/html; charset=utf-8')
    .send(rendered);
});

fastify.post('/account/signup', async (req, res) => {
  let reqData: AccountCreateReq;
  try {
    reqData = accountCreateReqSchema.parse(req.body);
  } catch (e) {
    return await res.redirect('/signup');
  }

  if (reqData.agreedToTerms !== 'on') {
    return await res.redirect('/signup');
  }
  const db = await connect(USERS_DB);
  const userRepository = new SqliteUserRepository(db);

  try {
    const newUser = {
      ...reqData,
      id: 0,
      agreedToTerms: true,
      hashedPassword: 'FIXME',
    };
    const user = await userRepository.create(newUser);
    console.log(user)
    return await res.redirect('/welcome');
  } catch (error) {
    console.error(error)
    return await res.redirect('/signup');
  }
});

fastify.get('/signin', async (req, res) => {
  const rendered = templates.render('signin.njk', { environment });
  return await res
    .header('Content-Type', 'text/html; charset=utf-8')
    .send(rendered);
});

const start = async (): Promise<void> => {
  try {
    const db = await connect(USERS_DB);
    newDb(db);
    await fastify.listen({ port: 8089 });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
