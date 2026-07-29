import { Card } from "@/components/home/Card";
import { GreetingSection } from "@/components/home/GreetingSection";
import { SectionEmptyState } from "@/components/home/SectionEmptyState";
import { TransactionSection } from "@/components/home/TransactionSection";
import { Header } from "@/components/ui/Header";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useHomeDashboard } from "@/lib/hooks/api/reporting/useHomeDashboard";
import { View } from "react-native";

export default function DashboardScreen() {
  const { dashboard, error, isEmpty, isLoading } = useHomeDashboard();

  return (
    <View className="flex-1 bg-background">
      <Header />
      <ScreenShell bottomExtra={2}>
        <View className="gap-4">
          {isLoading ? (
            <Card className="p-4">
              <SectionEmptyState
                iconKey="sync"
                title="Loading dashboard"
                body="Reading local data from this device."
                tone="forest"
              />
            </Card>
          ) : error ? (
            <Card className="p-4">
              <SectionEmptyState
                iconKey="warning"
                title="Dashboard unavailable"
                body="We couldn't load the local dashboard right now."
                tone="warn"
              />
            </Card>
          ) : (
            <>
              <GreetingSection
                dateLabel={dashboard.dateLabel}
                greetingLine={dashboard.greetingLine}
                displayName={dashboard.displayName}
                amountDisplay={dashboard.revenueTodayDisplay}
                percentChange={dashboard.revenueChangePercent}
                isEmpty={isEmpty}
              />

              <TransactionSection
                bars={dashboard.weeklyChartBars}
                weeklyTotalDisplay={dashboard.weeklyTotalDisplay}
                dailyAvgDisplay={dashboard.dailyAvgDisplay}
                alerts={dashboard.restockAlerts}
                transactions={dashboard.transactions}
                totalToday={dashboard.transactionTotalToday}
                isEmpty={isEmpty}
                showWeeklyTrend={false}
                showRestockAlerts={false}
              />
            </>
          )}
        </View>
      </ScreenShell>
    </View>
  );
}
