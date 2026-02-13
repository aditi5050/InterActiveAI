import mongoose, { Schema, Document } from "mongoose";

export interface IWorkflow extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    name: string;
    nodes: object[];
    edges: object[];
    createdAt: Date;
    updatedAt: Date;
}

const WorkflowSchema = new Schema<IWorkflow>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true, default: "Untitled Workflow" },
        nodes: { type: [Schema.Types.Mixed], default: [] },
        edges: { type: [Schema.Types.Mixed], default: [] },
    },
    { timestamps: true }
);

// Index for faster queries
WorkflowSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.models.Workflow || mongoose.model<IWorkflow>("Workflow", WorkflowSchema);
