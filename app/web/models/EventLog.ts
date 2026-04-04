import { model, models, Schema, type Model } from 'mongoose';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface EventLogDocument {
  personId: number;
  riskLevel: RiskLevel;
  timestamp: Date;
  message: string;
}

const eventLogSchema = new Schema<EventLogDocument>(
  {
    personId: {
      type: Number,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    versionKey: false,
  }
);

const EventLogModel =
  (models.EventLog as Model<EventLogDocument> | undefined) ??
  model<EventLogDocument>('EventLog', eventLogSchema);

export default EventLogModel;
