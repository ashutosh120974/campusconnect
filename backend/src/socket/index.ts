import type { Server as HttpServer } from 'node:http';
import { Server, type Socket } from 'socket.io';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { verifyAccessToken } from '../utils/token.js';
import { Conversation, Message } from '../models/Message.js';

interface AuthedSocket extends Socket {
  userId?: string;
}

const onlineUsers = new Map<string, Set<string>>();

export function initSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use((socket: AuthedSocket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = verifyAccessToken(token);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthedSocket) => {
    const userId = socket.userId!;
    const sockets = onlineUsers.get(userId) ?? new Set<string>();
    sockets.add(socket.id);
    onlineUsers.set(userId, sockets);
    io.emit('presence:update', { userId, online: true });
    logger.info(`Socket connected: ${userId}`);

    socket.on('conversation:join', (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on('typing', ({ conversationId, isTyping }: { conversationId: string; isTyping: boolean }) => {
      socket.to(conversationId).emit('typing', { userId, isTyping });
    });

    socket.on(
      'message:send',
      async (payload: { conversationId: string; text?: string; attachmentUrl?: string }) => {
        try {
          const message = await Message.create({
            conversation: payload.conversationId,
            sender: userId,
            text: payload.text,
            attachmentUrl: payload.attachmentUrl,
            readBy: [userId],
          });
          await Conversation.findByIdAndUpdate(payload.conversationId, {
            lastMessage: payload.text ?? 'Attachment',
            lastMessageAt: new Date(),
          });
          io.to(payload.conversationId).emit('message:new', message);
        } catch (error) {
          socket.emit('error', { message: 'Failed to send message' });
          logger.error('Socket message error', error);
        }
      },
    );

    socket.on('message:read', async ({ conversationId }: { conversationId: string }) => {
      await Message.updateMany(
        { conversation: conversationId, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } },
      );
      socket.to(conversationId).emit('message:read', { conversationId, userId });
    });

    socket.on('disconnect', () => {
      const set = onlineUsers.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          onlineUsers.delete(userId);
          io.emit('presence:update', { userId, online: false });
        }
      }
      logger.info(`Socket disconnected: ${userId}`);
    });
  });

  return io;
}
