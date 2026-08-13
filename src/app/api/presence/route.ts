import { NextRequest, NextResponse } from 'next/server';

// Fallback in-memory map for local development (single persistent process)
// Stored outside the handler to persist across local requests
const localPresenceMap = new Map<string, number>();

/**
 * Helper to clean up expired sessions from the local in-memory presence map.
 * Inactive duration is 30 seconds.
 */
function cleanLocalPresence() {
  const now = Date.now();
  const cutoff = now - 30000;
  for (const [sessId, timestamp] of localPresenceMap.entries()) {
    if (timestamp < cutoff) {
      localPresenceMap.delete(sessId);
    }
  }
}

/**
 * POST /api/presence
 * 
 * Handles heartbeat and disconnect events for active user presence tracking.
 * 
 * Supports two backend modes:
 * 1. Vercel KV / Upstash Redis: Used in production (detected via env variables).
 *    Uses Redis sorted sets (`ZADD`, `ZREMRANGEBYSCORE`, `ZCARD`) via REST Pipeline.
 * 2. In-memory Map: Used in local development or if Vercel KV is not linked.
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId, action } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;
    const now = Date.now();

    if (kvUrl && kvToken) {
      // Vercel KV / Upstash Redis Mode (Production Edge / Serverless)
      const pipelineUrl = `${kvUrl}/pipeline`;
      const cutoff = now - 30000;

      // Define pipeline commands
      const commands = [];
      if (action === 'disconnect') {
        commands.push(['ZREM', 'agomoni:presence', sessionId]);
      } else {
        commands.push(['ZADD', 'agomoni:presence', now.toString(), sessionId]);
      }

      commands.push(
        ['ZREMRANGEBYSCORE', 'agomoni:presence', '-inf', cutoff.toString()],
        ['EXPIRE', 'agomoni:presence', '120'],
        ['ZCARD', 'agomoni:presence']
      );

      const res = await fetch(pipelineUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commands),
      });

      if (!res.ok) {
        throw new Error(`KV REST Pipeline failed: ${res.statusText}`);
      }

      const results = await res.json();
      // The last command in pipeline is ZCARD, which returns the active count
      const activeCount = results[results.length - 1]?.result ?? 1;

      return NextResponse.json({ online: activeCount });
    } else {
      // Local fallback using memory Map
      cleanLocalPresence();

      if (action === 'disconnect') {
        localPresenceMap.delete(sessionId);
      } else {
        localPresenceMap.set(sessionId, now);
      }

      const activeCount = localPresenceMap.size;
      return NextResponse.json({ online: Math.max(1, activeCount) });
    }
  } catch (error: any) {
    console.error('Presence API POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * GET /api/presence
 * 
 * Simple reader to fetch the current active user count.
 */
export async function GET() {
  try {
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;
    const now = Date.now();

    if (kvUrl && kvToken) {
      const pipelineUrl = `${kvUrl}/pipeline`;
      const cutoff = now - 30000;

      const commands = [
        ['ZREMRANGEBYSCORE', 'agomoni:presence', '-inf', cutoff.toString()],
        ['ZCARD', 'agomoni:presence']
      ];

      const res = await fetch(pipelineUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commands),
      });

      if (!res.ok) {
        throw new Error(`KV REST Pipeline failed: ${res.statusText}`);
      }

      const results = await res.json();
      const activeCount = results[results.length - 1]?.result ?? 1;

      return NextResponse.json({ online: activeCount });
    } else {
      cleanLocalPresence();
      const activeCount = localPresenceMap.size;
      return NextResponse.json({ online: Math.max(1, activeCount) });
    }
  } catch (error: any) {
    console.error('Presence API GET error:', error);
    return NextResponse.json({ online: 1 });
  }
}
