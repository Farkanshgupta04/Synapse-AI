import test from 'node:test';
import assert from 'node:assert/strict';
import { User } from '../model/user.model.js';
import { Promt } from '../model/promt.model.js';
import { ChatSession } from '../model/chatSession.model.js';
import { ChatMessage } from '../model/chatMessage.model.js';

test('user model has useful indexes', () => {
  const indexes = User.schema.indexes();
  assert.ok(indexes.some(([spec]) => spec.email === 1));
  assert.ok(indexes.some(([spec]) => spec.firstName === 1 && spec.lastName === 1));
});

test('promt model has query indexes', () => {
  const indexes = Promt.schema.indexes();
  assert.ok(indexes.some(([spec]) => spec.userId === 1 && spec.createdAt === -1));
  assert.ok(indexes.some(([spec]) => spec.userId === 1 && spec.role === 1 && spec.createdAt === -1));
});

test('chat session and message models have indexes', () => {
  const sessionIndexes = ChatSession.schema.indexes();
  const messageIndexes = ChatMessage.schema.indexes();

  assert.ok(sessionIndexes.some(([spec]) => spec.userId === 1 && spec.createdAt === -1));
  assert.ok(sessionIndexes.some(([spec]) => spec.userId === 1 && spec.lastMessageAt === -1));
  assert.ok(messageIndexes.some(([spec]) => spec.sessionId === 1 && spec.createdAt === 1));
  assert.ok(messageIndexes.some(([spec]) => spec.userId === 1 && spec.createdAt === -1));
});
