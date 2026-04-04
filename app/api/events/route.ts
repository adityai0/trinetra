import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/mongodb';
import EventLogModel, { type EventLogDocument } from '@/models/EventLog';
import type { EventLog } from '@/types/event';

/**
 * Returns latest event logs sorted by timestamp in descending order.
 */
export async function GET(): Promise<
  NextResponse<EventLog[] | { error: string }>
> {
  try {
    await connectDB();

    const logs = await EventLogModel.find()
      .sort({ timestamp: -1 })
      .lean<EventLogDocument[]>();

    const payload: EventLog[] = logs.map((log) => ({
      _id: String((log as EventLogDocument & { _id: unknown })._id),
      personId: log.personId,
      riskLevel: log.riskLevel,
      timestamp: log.timestamp.toISOString(),
      message: log.message,
    }));

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch event logs' },
      { status: 500 }
    );
  }
}
