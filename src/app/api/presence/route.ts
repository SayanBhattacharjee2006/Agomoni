import { NextResponse } from 'next/server';

/**
 * GET /api/presence
 * 
 * Returns the current active user presence count.
 * Designed for approximately 50 concurrent active users.
 * 
 * In this implementation, it returns a dynamically varying mock count 
 * between 42 and 48 to simulate live activity. This is stateless and 
 * lightweight, but can easily be wired to a Redis store or database 
 * presence tracking later.
 */
export async function GET() {
  // Generate a base count around 45 (varies between 42 and 48)
  const baseCount = 45;
  const variance = Math.floor(Math.random() * 7) - 3; // -3 to +3
  const onlineCount = baseCount + variance;

  return NextResponse.json({
    online: onlineCount,
  });
}
