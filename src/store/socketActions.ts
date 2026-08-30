import { createAction } from '@reduxjs/toolkit';

/** Поднять соединение и отправить подписки. Обрабатывается socketMiddleware. */
export const socketStarted = createAction('socket/started');

/** Закрыть соединение. */
export const socketStopped = createAction('socket/stopped');
