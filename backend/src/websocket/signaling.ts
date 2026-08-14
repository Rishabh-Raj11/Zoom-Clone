import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { db } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
import { WSMessage, Poll } from '../types/index.js';

interface ClientConnection {
  ws: WebSocket;
  userId: string;
  userName: string;
  roomId: string;
  role: 'host' | 'co-host' | 'participant';
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  avatarUrl?: string;
  breakoutRoomId?: string;
}

const rooms = new Map<string, Map<string, ClientConnection>>();
const lockedRooms = new Set<string>();
const roomPolls = new Map<string, Poll[]>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  console.log('[WebSocket] Signaling Server initialized on /ws');

  wss.on('connection', (ws: WebSocket) => {
    let currentConnection: ClientConnection | null = null;

    ws.on('message', (data: string) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        const { type, roomId, senderId, senderName, targetId, payload } = message;

        if (!roomId || !senderId) return;

        const cleanRoomId = roomId.replace(/[\s-]/g, '');

        switch (type) {
          case 'join-room': {
            if (lockedRooms.has(cleanRoomId)) {
              ws.send(JSON.stringify({
                type: 'error',
                payload: { message: 'This meeting is locked by the host.' }
              }));
              return;
            }

            if (!rooms.has(cleanRoomId)) {
              rooms.set(cleanRoomId, new Map());
            }

            const room = rooms.get(cleanRoomId)!;
            const role = payload?.role || (room.size === 0 ? 'host' : 'participant');
            const userName = senderName || (role === 'host' ? 'Host User' : `Guest-${senderId.slice(-4)}`);

            currentConnection = {
              ws,
              userId: senderId,
              userName,
              roomId: cleanRoomId,
              role,
              isMuted: payload?.isMuted ?? false,
              isVideoOff: payload?.isVideoOff ?? false,
              isHandRaised: false,
              avatarUrl: payload?.avatarUrl
            };

            room.set(senderId, currentConnection);

            // Send existing roster
            const existingParticipants = Array.from(room.values())
              .filter((client) => client.userId !== senderId)
              .map((client) => ({
                userId: client.userId,
                userName: client.userName,
                role: client.role,
                isMuted: client.isMuted,
                isVideoOff: client.isVideoOff,
                isHandRaised: client.isHandRaised,
                avatarUrl: client.avatarUrl,
                breakoutRoomId: client.breakoutRoomId
              }));

            ws.send(JSON.stringify({
              type: 'existing-participants',
              roomId: cleanRoomId,
              senderId: 'server',
              payload: {
                participants: existingParticipants,
                yourRole: role,
                activePolls: roomPolls.get(cleanRoomId) || []
              }
            }));

            broadcastToRoom(cleanRoomId, senderId, {
              type: 'user-joined',
              roomId: cleanRoomId,
              senderId,
              senderName: userName,
              payload: {
                role,
                isMuted: currentConnection.isMuted,
                isVideoOff: currentConnection.isVideoOff,
                isHandRaised: currentConnection.isHandRaised,
                avatarUrl: currentConnection.avatarUrl
              }
            });

            console.log(`[WebSocket] ${userName} (${senderId}) joined room ${cleanRoomId}. Total: ${room.size}`);
            break;
          }

          case 'offer':
          case 'answer':
          case 'ice-candidate': {
            if (targetId) {
              sendToUser(cleanRoomId, targetId, {
                type,
                roomId: cleanRoomId,
                senderId,
                senderName,
                targetId,
                payload
              });
            }
            break;
          }

          case 'chat-message': {
            const msgId = uuidv4();
            const timestamp = new Date().toISOString();
            const text = payload?.text || '';

            try {
              const meeting = db.prepare(`
                SELECT id FROM meetings 
                WHERE id = ? OR meeting_id = ? OR REPLACE(REPLACE(meeting_id, ' ', ''), '-', '') = ?
              `).get(cleanRoomId, cleanRoomId, cleanRoomId) as any;

              if (meeting) {
                db.prepare(`
                  INSERT INTO chat_messages (id, meeting_id, sender_id, sender_name, message, timestamp, is_direct, recipient_id)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `).run(msgId, meeting.id, senderId, senderName || 'Participant', text, timestamp, targetId ? 1 : 0, targetId || null);
              }
            } catch (err) {
              console.error('Chat storage error:', err);
            }

            const chatPayload = {
              id: msgId,
              senderId,
              senderName: senderName || 'Participant',
              message: text,
              timestamp,
              isDirect: Boolean(targetId),
              recipientId: targetId
            };

            if (targetId) {
              sendToUser(cleanRoomId, targetId, { type: 'chat-message', roomId: cleanRoomId, senderId, payload: chatPayload });
              ws.send(JSON.stringify({ type: 'chat-message', roomId: cleanRoomId, senderId, payload: chatPayload }));
            } else {
              broadcastToRoom(cleanRoomId, null, { type: 'chat-message', roomId: cleanRoomId, senderId, payload: chatPayload });
            }
            break;
          }

          case 'create-poll': {
            if (!roomPolls.has(cleanRoomId)) {
              roomPolls.set(cleanRoomId, []);
            }
            const polls = roomPolls.get(cleanRoomId)!;
            const newPoll: Poll = {
              id: uuidv4(),
              question: payload.question,
              options: payload.options.map((optText: string) => ({
                id: uuidv4(),
                text: optText,
                votes: 0,
                votedUserIds: []
              })),
              status: 'active',
              creatorId: senderId,
              totalVotes: 0
            };
            polls.push(newPoll);

            broadcastToRoom(cleanRoomId, null, {
              type: 'poll-update',
              roomId: cleanRoomId,
              senderId,
              payload: { polls }
            });
            break;
          }

          case 'vote-poll': {
            const { pollId, optionId } = payload;
            const polls = roomPolls.get(cleanRoomId);
            if (polls) {
              const targetPoll = polls.find((p) => p.id === pollId);
              if (targetPoll && targetPoll.status === 'active') {
                targetPoll.options.forEach((opt) => {
                  if (opt.votedUserIds.includes(senderId)) {
                    opt.votedUserIds = opt.votedUserIds.filter((id) => id !== senderId);
                    opt.votes = Math.max(0, opt.votes - 1);
                  }
                  if (opt.id === optionId) {
                    opt.votedUserIds.push(senderId);
                    opt.votes += 1;
                  }
                });
                targetPoll.totalVotes = targetPoll.options.reduce((sum, o) => sum + o.votes, 0);

                broadcastToRoom(cleanRoomId, null, {
                  type: 'poll-update',
                  roomId: cleanRoomId,
                  senderId,
                  payload: { polls }
                });
              }
            }
            break;
          }

          case 'live-caption': {
            broadcastToRoom(cleanRoomId, senderId, {
              type: 'live-caption',
              roomId: cleanRoomId,
              senderId,
              senderName: currentConnection?.userName || senderName,
              payload
            });
            break;
          }

          case 'breakout-update': {
            if (currentConnection?.role === 'host') {
              broadcastToRoom(cleanRoomId, null, {
                type: 'breakout-update',
                roomId: cleanRoomId,
                senderId,
                payload
              });
            }
            break;
          }

          case 'user-state-change': {
            if (currentConnection) {
              if (payload.isMuted !== undefined) currentConnection.isMuted = payload.isMuted;
              if (payload.isVideoOff !== undefined) currentConnection.isVideoOff = payload.isVideoOff;
              if (payload.isHandRaised !== undefined) currentConnection.isHandRaised = payload.isHandRaised;
            }

            broadcastToRoom(cleanRoomId, senderId, {
              type: 'user-state-change',
              roomId: cleanRoomId,
              senderId,
              payload
            });
            break;
          }

          case 'reaction': {
            broadcastToRoom(cleanRoomId, null, {
              type: 'reaction',
              roomId: cleanRoomId,
              senderId,
              senderName: currentConnection?.userName || senderName,
              payload
            });
            break;
          }

          case 'host-mute-all': {
            if (currentConnection?.role === 'host' || currentConnection?.role === 'co-host') {
              broadcastToRoom(cleanRoomId, senderId, {
                type: 'host-mute-all',
                roomId: cleanRoomId,
                senderId,
                payload: {}
              });
            }
            break;
          }

          case 'host-mute-user': {
            if ((currentConnection?.role === 'host' || currentConnection?.role === 'co-host') && targetId) {
              sendToUser(cleanRoomId, targetId, {
                type: 'host-mute-user',
                roomId: cleanRoomId,
                senderId,
                payload: {}
              });
            }
            break;
          }

          case 'host-kick-user': {
            if ((currentConnection?.role === 'host' || currentConnection?.role === 'co-host') && targetId) {
              sendToUser(cleanRoomId, targetId, {
                type: 'host-kick-user',
                roomId: cleanRoomId,
                senderId,
                payload: { reason: 'Removed by host' }
              });

              const room = rooms.get(cleanRoomId);
              if (room && room.has(targetId)) {
                const kickedClient = room.get(targetId);
                kickedClient?.ws.close();
                room.delete(targetId);
                broadcastToRoom(cleanRoomId, null, {
                  type: 'user-left',
                  roomId: cleanRoomId,
                  senderId: targetId,
                  payload: { userId: targetId }
                });
              }
            }
            break;
          }

          case 'host-lock-room': {
            if (currentConnection?.role === 'host') {
              const locked = Boolean(payload?.locked);
              if (locked) {
                lockedRooms.add(cleanRoomId);
              } else {
                lockedRooms.delete(cleanRoomId);
              }
              broadcastToRoom(cleanRoomId, null, {
                type: 'host-lock-room',
                roomId: cleanRoomId,
                senderId,
                payload: { isLocked: locked }
              });
            }
            break;
          }

          case 'whiteboard-draw':
          case 'whiteboard-clear': {
            broadcastToRoom(cleanRoomId, senderId, {
              type,
              roomId: cleanRoomId,
              senderId,
              payload
            });
            break;
          }
        }
      } catch (err) {
        console.error('[WebSocket] Processing error:', err);
      }
    });

    ws.on('close', () => {
      if (currentConnection) {
        const { roomId, userId, userName } = currentConnection;
        const room = rooms.get(roomId);
        if (room) {
          room.delete(userId);
          console.log(`[WebSocket] ${userName} (${userId}) left room ${roomId}.`);
          if (room.size === 0) {
            rooms.delete(roomId);
            lockedRooms.delete(roomId);
            roomPolls.delete(roomId);
          } else {
            broadcastToRoom(roomId, null, {
              type: 'user-left',
              roomId,
              senderId: userId,
              payload: { userId, userName }
            });
          }
        }
      }
    });
  });
}

function broadcastToRoom(roomId: string, excludeUserId: string | null, message: WSMessage) {
  const cleanRoomId = roomId.replace(/[\s-]/g, '');
  const room = rooms.get(cleanRoomId);
  if (!room) return;

  const data = JSON.stringify(message);
  for (const [userId, client] of room.entries()) {
    if (excludeUserId && userId === excludeUserId) continue;
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  }
}

function sendToUser(roomId: string, targetUserId: string, message: WSMessage) {
  const cleanRoomId = roomId.replace(/[\s-]/g, '');
  const room = rooms.get(cleanRoomId);
  if (!room) return;

  const client = room.get(targetUserId);
  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(message));
  }
}
