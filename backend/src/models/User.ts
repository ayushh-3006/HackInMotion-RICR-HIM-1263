import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // optional for oauth if added later
    name: { type: String, required: false },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", UserSchema);
