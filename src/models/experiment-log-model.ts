import { Schema, model, Model, Document } from "mongoose";

export interface IExperimentLogDocument extends Document {
  experimentId: string;
  experimentName: string;
  enabledAt: Date;
  disabledAt?: Date;
  variantCounts: Array<{ variantName: string, count: number }>,
}

const ExperimentLogSchema: Schema = new Schema<IExperimentLogDocument>({
  experimentId: { type: String, required: true },
  experimentName: { type: String, required: true },
  enabledAt: { type: Date, required: true },
  disabledAt: { type: Date, required: false },
  variantCounts: { type: [{ variantName: String, count: Number }], required: false },
});

export const ExperimentLogModel: Model<IExperimentLogDocument> = model<IExperimentLogDocument>("ExperimentLog", ExperimentLogSchema);

