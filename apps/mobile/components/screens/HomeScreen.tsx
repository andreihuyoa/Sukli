import { Card } from "@/components/home/Card";
import { GreetingSection } from "@/components/home/GreetingSection";
import { SectionEmptyState } from "@/components/home/SectionEmptyState";
import { StatsContainer } from "@/components/home/StatsContainer";
import { TransactionSection } from "@/components/home/TransactionSection";
import { AppHeader } from "@/components/ui/AppHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useHomeDashboard } from "@/hooks/useHomeDashboard";
import { View } from "react-native";

export function HomeScreen() {
  const { dashboard, error, isEmpty, isLoading } = useHomeDashboard();
  const handleRefresh = () => {};

  return (
    <View className="flex-1 bg-screen-grouped">
      <AppHeader onRefresh={handleRefresh} />
      <ScreenShell bottomExtra={60}>
        <View className="gap-4 pb-6">
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
                amountDisplay={dashboard.revenueTodayDisplay}
                percentChange={dashboard.revenueChangePercent}
                isEmpty={isEmpty}
              />
              <StatsContainer
                activeStockDisplay={dashboard.activeStockDisplay}
                activeStockSubtitle={dashboard.activeStockSubtitle}
                profitEstDisplay={dashboard.profitEstDisplay}
                profitEstSubtitle={dashboard.profitEstSubtitle}
                gcashAmountDisplay={dashboard.gcashAmountDisplay}
                gcashChangeLabel={dashboard.gcashChangeLabel}
                cashSalesAmountDisplay={dashboard.cashSalesAmountDisplay}
                cashSalesShareLabel={dashboard.cashSalesShareLabel}
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
              />
            </>
          )}
        </View>
      </ScreenShell>
    </View>
  );
}

export default HomeScreen;
