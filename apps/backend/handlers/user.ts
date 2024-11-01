import { MikroORMInstance } from '@backend/services/mikro-orm';
import { BackendENV } from '@repo/env';
import { User } from '@repo/orm-entities/user';
import { IncomingMessage, ServerResponse } from 'http';

const mikro = MikroORMInstance.getInstance();

export const handleGetUserByCredentials = async (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & {
    req: IncomingMessage;
  }
) => {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${BackendENV.INTERNAL_SECRET}`) {
    res.writeHead(401);
    res.end();
    return;
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    try {
      const { email, password } = JSON.parse(body);
      // Check if email and password are correct
      const em = await mikro.getEM();
      const user = await em.findOne(User, {
        email,
        password: User.hashPassword(password),
      });
      if (!user) {
        res.writeHead(401);
        res.end();
        return;
      }
      // Return the user
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user));
    } catch (e) {
      res.writeHead(500);
      res.end();
    }
  });
};

export const handleGetUserByEmail = async (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & {
    req: IncomingMessage;
  }
) => {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${BackendENV.INTERNAL_SECRET}`) {
    res.writeHead(401);
    res.end();
    return;
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    try {
      const { email } = JSON.parse(body);
      // Check if email and password are correct
      const em = await mikro.getEM();
      const user = await em.fork().findOne(User, { email: email });
      if (!user) {
        res.writeHead(401);
        res.end();
        return;
      }
      // Return the user
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user));
    } catch (e) {
      res.writeHead(500);
      res.end();
    }
  });
};
