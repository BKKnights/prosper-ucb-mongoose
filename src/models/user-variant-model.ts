import { Schema, model, Model, Document } from "mongoose";

export interface IUserVariantDocument extends Document {
  experimentId: string;
  userId: string;
  index: number;
}

const UserVariantSchema: Schema = new Schema<IUserVariantDocument>({
  experimentId: { type: String, required: true },
  userId: { type: String, required: true },
  index: { type: Number, required: true },
});

export const UserVariantModel: Model<IUserVariantDocument> = model<IUserVariantDocument>("UserVariant", UserVariantSchema);

