export async function getData(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" }); // ✅ SSR safe
    if (!res.ok) throw new Error("Failed to fetch data");
    return res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}
