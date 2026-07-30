import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Cast to the Web API FormData type so TS stops complaining
    const formData = (await request.formData()) as unknown as globalThis.FormData;

    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded or invalid file type" },
        { status: 400 }
      );
    }

    const bytes = await fileEntry.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // TODO: your upload logic here
    // Example:
    // await uploadToStorage(buffer, fileEntry.name);

    return NextResponse.json(
      { success: true, filename: fileEntry.name },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
