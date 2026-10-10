import { redirect } from "next/navigation";

export default async function TopLevelChartRedirect({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  redirect(`/dashboard/chart/${encodeURIComponent(symbol)}`);
}
