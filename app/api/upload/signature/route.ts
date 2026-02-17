import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const TRANSLOADIT_KEY = process.env.TRANSLOADIT_KEY;
    const TRANSLOADIT_SECRET = process.env.TRANSLOADIT_SECRET;

    if (!TRANSLOADIT_KEY || !TRANSLOADIT_SECRET) {
      console.error("Transloadit credentials missing");
      return new NextResponse("Server Configuration Error", { status: 500 });
    }

    // Generate UTC expiration time (+1 hour)
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString();

    const params = {
      auth: {
        key: TRANSLOADIT_KEY,
        expires: expires,
      },
      // Using /upload/handle robot for simple file receiving
      steps: {
        ":original": {
          robot: "/upload/handle",
        },
      },
    };

    const paramsJson = JSON.stringify(params);
    
    // Calculate signature
    const signature = crypto
      .createHmac("sha1", TRANSLOADIT_SECRET)
      .update(paramsJson)
      .digest("hex");

    return NextResponse.json({
      url: "https://api2.transloadit.com/assemblies",
      params: paramsJson,
      signature: signature, 
    });
  } catch (error) {
    console.error("[SIGNATURE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
