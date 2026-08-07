import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Vercel Serverless Function Timeout (5 minutes)
export const maxDuration = 300; 

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // 1. User ki photo
    const userImage = formData.get("userImage") as File;
    
    // 2. Custom Garment ki photo (UI se jo upload hogi)
    const customGarmentFile = formData.get("garmentImage") as File | null;
    
    // 3. Agar upload nahi hui, to selected template name
    const selectedGarment =
      (formData.get("templateId") as string) ||
      (formData.get("category") as string) ||
      "jacket";

    if (!userImage) {
      return NextResponse.json({ error: "User image is required" }, { status: 400 });
    }

    const apiKey = process.env.YOUCAM_API_KEY?.trim();
    const baseUrl = (process.env.YOUCAM_BASE_URL || "https://yce-api-01.makeupar.com").replace(/\/$/, "");
    const vtoPath = (process.env.YOUCAM_VTO_PATH || "/s2s/v2.0/task/cloth-v4").trim();

    // ✅ Cloudinary Config
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
      api_key: process.env.CLOUDINARY_API_KEY?.trim(),
      api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
    });

    // ✅ Step 1: Upload User Image to Cloudinary
    const arrayBuffer = await userImage.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const dataUri = `data:${userImage.type || "image/jpeg"};base64,${fileBuffer.toString("base64")}`;

    let userImageUrl: string;
    try {
      const upJson = await cloudinary.uploader.upload(dataUri, { folder: "mirrorfit-vto" });
      userImageUrl = upJson.secure_url ?? upJson.url;
      if (!userImageUrl) {
        return NextResponse.json({ error: "Cloudinary user upload failed" }, { status: 502 });
      }
    } catch (e: any) {
      return NextResponse.json({ error: "Cloudinary upload error", details: e?.message ?? String(e) }, { status: 502 });
    }

    // ✅ Step 2: Handle Garment Image
    let finalGarmentUrl: string = "";

    if (customGarmentFile && customGarmentFile.size > 0) {
      try {
        const gArrayBuffer = await customGarmentFile.arrayBuffer();
        const gBuffer = Buffer.from(gArrayBuffer);
        const gDataUri = `data:${customGarmentFile.type || "image/jpeg"};base64,${gBuffer.toString("base64")}`;
        
        const gUpJson = await cloudinary.uploader.upload(gDataUri, { folder: "mirrorfit-garments" });
        finalGarmentUrl = gUpJson.secure_url ?? gUpJson.url;
      } catch (e: any) {
        console.warn("Custom garment Cloudinary upload failed:", e?.message);
        return NextResponse.json({ error: "Failed to upload custom garment image" }, { status: 502 });
      }
    } else {
      const garmentMap: Record<string, string> = {
        "Deep Teal Blazer": "https://fakestoreapi.com/img/71li-ujtlTG._AC_UX679_.jpg",
        "Navy Knit": "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
        "Cool Taupe Trench": "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
        "Forest Green Jacket": "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg",
        "Camel Overcoat": "https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_.jpg",
        "Olive Utility Shirt": "https://fakestoreapi.com/img/71HblAHs5xL._AC_UY879_-2.jpg",
        "Ivory Silk Top": "https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_.jpg",
        "Terracotta Cardigan": "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg",
        "Warm Beige Sweater": "https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_.jpg",
      };

      finalGarmentUrl =
        garmentMap[selectedGarment] ||
        "https://fakestoreapi.com/img/71li-ujtlTG._AC_UX679_.jpg";
    }

    // ✅ Step 3: JSON body bhejo YouCam ko
    const startUrl = `${baseUrl}${vtoPath.startsWith("/") ? vtoPath : "/" + vtoPath}`;

    const createRes = await fetch(startUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        src_file_url: userImageUrl,
        ref_file_url: finalGarmentUrl,
        garment_category: "auto",
      }),
      cache: "no-store",
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error("❌ VTO Task Creation Failed. Status:", createRes.status, "Body:", errText);
      return NextResponse.json(
        { error: errText, status: createRes.status, stage: "create" },
        { status: 502 }
      );
    }

    const createData = await createRes.json();
    const taskId = createData?.data?.task_id ?? createData?.task_id ?? createData?.taskId;

    if (!taskId) {
      console.error("❌ No taskId in response:", createData);
      return NextResponse.json(
        { error: "No taskId returned by YouCam", raw: createData, stage: "create" },
        { status: 502 }
      );
    }

    // ✅ Step 4: Poll karo jab tak success na mile
    const maxAttempts = 40;
    const intervalMs = 4900;
    let resultUrl: string | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));

      const pollUrl = `${baseUrl}${vtoPath.startsWith("/") ? vtoPath : "/" + vtoPath}/${taskId}`;

      const pollRes = await fetch(pollUrl, {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      });

      if (!pollRes.ok) {
        const pollErrText = await pollRes.text();
        console.error("❌ Poll Failed. Status:", pollRes.status, "Body:", pollErrText);
        continue;
      }

      const pollData = await pollRes.json();
      console.log("🔍 YouCam VTO Poll Response:", JSON.stringify(pollData, null, 2));

      const status = pollData?.data?.task_status ?? pollData?.status;

      if (status === "success") {
        resultUrl =
          pollData?.data?.results?.url ??        // 👈 नया सही रास्ता (जो अभी लॉग में मिला है)
          pollData?.data?.result_image_url ??
          pollData?.result_image_url ??
          pollData?.image_url ??
          pollData?.data?.output?.[0]?.url ??
          null;
        break;
      }

      if (status === "failed" || status === "error") {
        console.error("❌ Task failed:", pollData);
        return NextResponse.json(
          { error: "YouCam task failed", raw: pollData, stage: "poll" },
          { status: 502 }
        );
      }
    }

    if (resultUrl) {
      return NextResponse.json({ tryOnImageUrl: resultUrl, source: "live" });
    }

    console.error("❌ Polling timed out for taskId:", taskId);
    return NextResponse.json(
      { error: "Timed out waiting for result", taskId, stage: "poll" },
      { status: 504 }
    );

  } catch (error) {
    console.error("VTO Route Error:", error);
    return NextResponse.json({ error: String(error), stage: "exception" }, { status: 500 });
  }
}