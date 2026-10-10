import { ChartTerminal } from "@/components/dashboard";

export default async function DynamicChartPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  return <ChartTerminal initialSymbol={symbol} />;
}
