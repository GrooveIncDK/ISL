// ============================================================
// Shared Supabase client — loaded on every page that needs auth
// or gated content. Uses the publishable (client-safe) key only.
// ============================================================
const SUPABASE_URL = "https://rzvdpeodhzacwsccymmb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_2Yk8VUHYT9CcA0p_fmt_HQ_Kwv6t-Rz";

// Loaded via <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// before this file, which exposes the global `supabase` factory.
if (typeof supabase === "undefined") {
  console.error("Supabase SDK failed to load — check your network connection.");
  document.addEventListener("DOMContentLoaded", () => {
    const banner = document.createElement("div");
    banner.style.cssText = "background:#fdf0ef;border-bottom:1px solid #c0392b;color:#c0392b;text-align:center;padding:10px;font-family:Arial,sans-serif;font-size:.9rem;";
    banner.textContent = "We couldn't connect to our account system. Please check your connection and refresh the page.";
    document.body.prepend(banner);
  });
}
const sb = typeof supabase !== "undefined" ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// ---- Small shared helpers used across pages ----

async function getCurrentUser() {
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

async function requireAuth(redirectTo = "signin.html") {
  const user = await getCurrentUser();
  if (!user) {
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `${redirectTo}?returnTo=${returnTo}`;
    return null;
  }
  return user;
}

async function getMyPurchases() {
  const { data, error } = await sb
    .from("purchases")
    .select("course_id, status, created_at")
    .eq("status", "paid");
  if (error) { console.error(error); return []; }
  return data;
}

async function hasPurchased(courseId) {
  const purchases = await getMyPurchases();
  return purchases.some(p => p.course_id === courseId);
}

async function getGatedContent(courseId) {
  // RLS on course_content only returns rows if this user has a
  // paid purchase for this course — no client-side check needed
  // to keep it secure, but we still gate the UI nicely too.
  const { data, error } = await sb
    .from("course_content")
    .select("id, week_number, title, body, download_url, content_type, sort_order")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });
  if (error) { console.error(error); return []; }
  return data;
}

async function markAttempted(contentId) {
  const user = await getCurrentUser();
  if (!user) return;
  await sb.from("progress").upsert({ user_id: user.id, content_id: contentId });
}

// Saves a student's written exercise text and marks that content item
// attempted in the same call. Requires the progress.reflection_text
// column added by migration_course_room.sql.
async function saveReflection(contentId, text) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in" };
  const { error } = await sb.from("progress").upsert({
    user_id: user.id, content_id: contentId, reflection_text: text, attempted_at: new Date().toISOString(),
  });
  return { error };
}

async function getBookingEligibility() {
  const { data, error } = await sb.from("booking_eligibility").select("course_id");
  if (error) { console.error(error); return []; }
  return data.map(r => r.course_id);
}

async function createPayPalOrder(courseId) {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error("Not signed in");

  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
    body: JSON.stringify({ courseId }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Could not start checkout");
  return result.orderId;
}

async function capturePayPalOrder(orderId, courseId) {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error("Not signed in");

  const res = await fetch(`${SUPABASE_URL}/functions/v1/capture-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
    body: JSON.stringify({ orderId, courseId }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Payment could not be confirmed");
  return result;
}
