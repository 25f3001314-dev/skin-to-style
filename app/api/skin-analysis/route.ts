import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageUrlField = (formData.get("imageUrl") ?? formData.get("src_file_url") ?? formData.get("srcFileUrl")) as string | null;
    const uploadedFile = formData.get("image");

    let finalImageUrl: string | null = imageUrlField ?? null;

    if (!finalImageUrl && uploadedFile instanceof File) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
      const cloudKey = process.env.CLOUDINARY_API_KEY?.trim();
      const cloudSecret = process.env.CLOUDINARY_API_SECRET?.trim();

      if (!cloudName || !cloudKey || !cloudSecret) {
        return NextResponse.json({ error: "Cloudinary config missing" }, { status: 400 });
      }

      cloudinary.config({ cloud_name: cloudName, api_key: cloudKey, api_secret: cloudSecret });

      const arrayBuffer = await uploadedFile.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      const dataUri = `data:image/jpeg;base64,${fileBuffer.toString("base64")}`;

      const upJson = await cloudinary.uploader.upload(dataUri, { folder: "mirrorfit" });
      finalImageUrl = upJson.secure_url ?? upJson.url ?? null;
    }

    if (!finalImageUrl) {
      return NextResponse.json({ error: "Missing image URL." }, { status: 400 });
    }

    const apiKey = process.env.YOUCAM_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "YouCam API key missing." }, { status: 500 });
    }

    const baseUrl = (process.env.YOUCAM_BASE_URL || "https://yce-api-01.makeupar.com").replace(/\/$/, "");
    const path = (process.env.YOUCAM_SKIN_PATH || "/s2s/v2.0/task/skin-analysis").trim();
    const startUrl = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

    const startBody = {
      src_file_url: finalImageUrl,
      dst_actions: [
        "wrinkle", "pore", "texture", "acne", "moisture", "oiliness",
        "radiance", "redness", "dark_circle_v2", "eye_bag",
        "droopy_upper_eyelid", "droopy_lower_eyelid", "firmness",
        "age_spot", "skin_type"
      ],
      miniserver_args: { enable_mask_overlay: false },
      format: "json",
      pf_camera_kit: false
    };

    const startResp = await fetch(startUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(startBody),
    });

    if (!startResp.ok) {
      const text = await startResp.text();
      return NextResponse.json({ error: `YouCam rejected: ${startResp.status} - ${text}` }, { status: 502 });
    }

    const startJson = await startResp.json();
    const taskId = startJson?.data?.task_id;

    if (!taskId) {
      return NextResponse.json({ error: "No task_id from YouCam." }, { status: 502 });
    }

    return NextResponse.json({ taskId }, { status: 202 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal Server Error" }, { status: 500 });
  }
}