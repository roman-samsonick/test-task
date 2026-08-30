import { store, socketStarted, socketStopped } from './store/index.ts';
import { useBetSlip } from './betslip/useBetSlip.ts';
import { mountApp } from './ui/mount.tsx';
import './ui/demo/demo.css';

const root = document.getElementById('root');
if (!root) throw new Error('Не найден #root');

mountApp(root);

store.dispatch(socketStarted());
window.addEventListener('beforeunload', () => store.dispatch(socketStopped()));

Object.assign(window, { store, betSlip: useBetSlip() });
