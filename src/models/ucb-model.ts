import { Schema, Types, model, Model, Document } from "mongoose";

export interface IUcbDocument extends Document {
  experimentId: string;
  arms: number;
  counts: Types.Array<Number>;
  values: Types.Array<Number>;
}

const UcbSchema: Schema = new Schema<IUcbDocument>({
  experimentId: { type: String, required: true },
  arms: { type: Number, required: true },
  counts: [Number],
  values: [Number],
});

export const UcbModel: Model<IUcbDocument> = model<IUcbDocument>("Ucb", UcbSchema);

