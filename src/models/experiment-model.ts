import { Schema, model, Model, Document } from "mongoose";

export interface IExperimentDocument extends Document {
  name: string;
  isEnabled: boolean;
}

const ExperimentSchema: Schema = new Schema<IExperimentDocument>({
  name: { type: String, required: true },
  isEnabled: { type: Boolean, required: false },
});

export const ExperimentModel: Model<IExperimentDocument> = model<IExperimentDocument>("Experiment", ExperimentSchema);

