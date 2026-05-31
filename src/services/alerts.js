import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ALERTS_PATH = join(__dirname, '../../data/alerts.json');

/**
 * @typedef {{ id: string, userId: string, channelId: string, targetPrice: number, direction: 'above' | 'below', triggered: boolean }} Alert
 */

/** @returns {Promise<Alert[]>} */
async function readAlerts() {
  try {
    const raw = await readFile(ALERTS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

/** @param {Alert[]} alerts */
async function writeAlerts(alerts) {
  await mkdir(dirname(ALERTS_PATH), { recursive: true });
  await writeFile(ALERTS_PATH, JSON.stringify(alerts, null, 2));
}

/**
 * @param {string} userId
 * @param {string} channelId
 * @param {number} targetPrice
 * @param {number} currentPrice
 * @returns {Promise<Alert>}
 */
export async function createAlert(userId, channelId, targetPrice, currentPrice) {
  const alerts = await readAlerts();
  const direction = targetPrice >= currentPrice ? 'above' : 'below';

  const alert = {
    id: `${userId}-${Date.now()}`,
    userId,
    channelId,
    targetPrice,
    direction,
    triggered: false,
  };

  alerts.push(alert);
  await writeAlerts(alerts);
  return alert;
}

/** @param {string} userId @returns {Promise<Alert[]>} */
export async function getUserAlerts(userId) {
  const alerts = await readAlerts();
  return alerts.filter((a) => a.userId === userId && !a.triggered);
}

/** @param {string} userId @param {string} alertId @returns {Promise<boolean>} */
export async function removeAlert(userId, alertId) {
  const alerts = await readAlerts();
  const index = alerts.findIndex((a) => a.id === alertId && a.userId === userId);
  if (index === -1) return false;
  alerts.splice(index, 1);
  await writeAlerts(alerts);
  return true;
}

/** @param {number} currentPrice @returns {Promise<Alert[]>} */
export async function checkAlerts(currentPrice) {
  const alerts = await readAlerts();
  const triggered = [];

  for (const alert of alerts) {
    if (alert.triggered) continue;

    const hit =
      (alert.direction === 'above' && currentPrice >= alert.targetPrice) ||
      (alert.direction === 'below' && currentPrice <= alert.targetPrice);

    if (hit) {
      alert.triggered = true;
      triggered.push({ ...alert });
    }
  }

  if (triggered.length > 0) {
    await writeAlerts(alerts);
  }

  return triggered;
}
