import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import Workflow from "@/models/Workflow";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Get all workflows for current user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const workflows = await Workflow.find({ userId: user._id })
            .sort({ updatedAt: -1 })
            .lean();

        return NextResponse.json({ workflows });
    } catch (error) {
        console.error("Get workflows error:", error);
        return NextResponse.json(
            { error: "Failed to fetch workflows" },
            { status: 500 }
        );
    }
}

// POST - Create new workflow
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const body = await request.json();

        const workflow = await Workflow.create({
            userId: user._id,
            name: body.name || "Untitled Workflow",
            nodes: body.nodes || [],
            edges: body.edges || [],
        });

        return NextResponse.json({ workflow });
    } catch (error) {
        console.error("Create workflow error:", error);
        return NextResponse.json(
            { error: "Failed to create workflow" },
            { status: 500 }
        );
    }
}
