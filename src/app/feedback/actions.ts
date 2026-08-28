"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function submitFeedback(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const message = String(formData.get("message") || "").trim();
  if (!message) throw new Error("문의 내용을 입력해주세요.");

  const image = formData.get("image");
  let imagePath: string | null = null;

  // Privileged client — storage upload and the insert both go through the
  // service-role key so we don't need to stand up storage.objects RLS
  // policies just for this one upload path.
  const admin = createAdminClient();

  if (image instanceof File && image.size > 0) {
    if (image.size > MAX_IMAGE_BYTES) throw new Error("이미지는 5MB 이하로 업로드해주세요.");
    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      throw new Error("이미지 파일만 업로드할 수 있습니다.");
    }

    const ext = image.name.split(".").pop() || "png";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await admin.storage
      .from("feedback")
      .upload(path, image, { contentType: image.type });

    if (uploadError) throw new Error("이미지 업로드에 실패했습니다: " + uploadError.message);
    imagePath = path;
  }

  const { error } = await admin.from("feedback").insert({
    reporter_id: user.id,
    message,
    image_path: imagePath,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/feedback");
}
