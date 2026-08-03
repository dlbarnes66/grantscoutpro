import { createClient } from "@supabase/supabase-js";

export async function createNotification({
  userId,
  type,
  title,
  message,
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
  });

  if (error) console.error("Notification insert error:", error);
}
