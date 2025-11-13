import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

type Receipt = {
  id: string;
  title: string;
  date: string;
  address: string;
  items: { title: string; cost: number }[];
  total: number;
  store: string;
  category?: string;
};


export default function AnalysisScreen() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [spendingSummary, setSpendingSummary] = useState<[string, number][]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [prediction, setPrediction] = useState<string>("");
  const [trendData, setTrendData] = useState<number[]>([]);
  const [trendLabels, setTrendLabels] = useState<string[]>([]);

  const mockReceipts: Receipt[] = [
    { id: "1", title: "Target Receipt", store: "Target", date: "11/03/2025", address: "123 Main St", items: [], total: 120, category: "Home" },
    { id: "2", title: "Trader Joe’s Receipt", store: "Trader Joe’s", date: "11/01/2025", address: "789 Maple Rd", items: [], total: 80, category: "Groceries" },
    { id: "3", title: "Amazon Order", store: "Amazon", date: "10/15/2025", address: "Online", items: [], total: 200, category: "Electronics" },
    { id: "4", title: "Nike Receipt", store: "Nike", date: "10/28/2025", address: "Mall Ave", items: [], total: 150, category: "Clothing" },
    { id: "5", title: "Target Receipt", store: "Target", date: "11/02/2025", address: "123 Main St", items: [], total: 90, category: "Home" },
  ];

  const parseDate = (str: string) => {
    const [month, day, year] = str.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  const processReceipts = (receipts: Receipt[]) => {
    const categoryTotals: Record<string, number> = {};
    receipts.forEach((r) => {
      const cat = r.category || "Uncategorized";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + r.total;
    });

    const chartReady = Object.keys(categoryTotals).map((cat, i) => ({
      name: cat,
      amount: categoryTotals[cat],
      color: ["#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE"][i % 4],
      legendFontColor: "#333",
      legendFontSize: 14,
    }));

    const storeTotals: Record<string, number> = {};
    receipts.forEach((r) => {
      storeTotals[r.store] = (storeTotals[r.store] || 0) + r.total;
    });

    const sortedStores = Object.entries(storeTotals).sort((a, b) => b[1] - a[1]);
    setChartData(chartReady);
    setSpendingSummary(sortedStores);
    generateRecommendations(receipts);
    calculatePrediction(receipts);
  };

  const generateRecommendations = (receipts: Receipt[]) => {
    const highSpendStore = receipts.reduce((prev, curr) => (curr.total > prev.total ? curr : prev), receipts[0]);
    const frequentStore = receipts.sort((a, b) => receipts.filter(r => r.store === b.store).length - receipts.filter(r => r.store === a.store).length)[0];
    const recs = [
      `You tend to spend the most at ${highSpendStore.store}.`,
      `You shop frequently at ${frequentStore.store}.`,
      `Try checking for discounts at ${highSpendStore.store} next time.`,
    ];
    setRecommendations(recs);
  };

  const calculatePrediction = (receipts: Receipt[]) => {
    const byCategory: Record<string, { date: number; total: number }[]> = {};
    receipts.forEach((r) => {
      const cat = r.category || "Uncategorized";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push({ date: parseDate(r.date).getTime(), total: r.total });
    });

    let maxGrowth = -Infinity;
    let predictedCategory = "";
    let trend: number[] = [];
    let labels: string[] = [];

    Object.entries(byCategory).forEach(([cat, values]) => {
      values.sort((a, b) => a.date - b.date);
      if (values.length > 1) {
        const first = values[0].total;
        const last = values[values.length - 1].total;
        const growth = (last - first) / first;
        if (growth > maxGrowth) {
          maxGrowth = growth;
          predictedCategory = cat;
          trend = values.map((v) => v.total);
          labels = values.map((v) => {
            const d = new Date(v.date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          });
        }
      }
    });

    if (predictedCategory) {
      setPrediction(`You're likely to spend more on ${predictedCategory} next week.`);
      setTrendData(trend);
      setTrendLabels(labels);
    } else {
      setPrediction("No clear trend detected yet.");
      setTrendData([]);
      setTrendLabels([]);
    }
  };

  const applyFilter = (filterType: string) => {
    let filtered = [...mockReceipts];
    const now = new Date();

    if (filterType === "month") {
      filtered = filtered.filter((r) => {
        const d = parseDate(r.date);
        if (search) {
          const monthName = d.toLocaleString("default", { month: "long" }).toLowerCase();
          const searchLower = search.toLowerCase();
          return (
            monthName.includes(searchLower) ||
            (parseInt(search) === d.getMonth() + 1) // allows typing "10" for October
          );
        }
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } 
    else if (filterType === "week") {
      if (search) {
        const inputDate = parseDate(search);
        const startOfWeek = new Date(inputDate);
        startOfWeek.setDate(inputDate.getDate() - inputDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        filtered = filtered.filter((r) => {
          const d = parseDate(r.date);
          return d >= startOfWeek && d <= endOfWeek;
        });
      } else {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        filtered = filtered.filter((r) => {
          const d = parseDate(r.date);
          return d >= oneWeekAgo && d <= now;
        });
      }
    } else if (filterType === "date" && search) {
      filtered = filtered.filter((r) => {
        const inputDate = parseDate(search);
        const rDate = parseDate(r.date);
        return (
          rDate.getFullYear() === inputDate.getFullYear() &&
          rDate.getMonth() === inputDate.getMonth() &&
          rDate.getDate() === inputDate.getDate()
        );
      });
    } else if (filterType === "store" && search) {
      filtered = filtered.filter((r) =>
        r.store.toLowerCase().includes(search.toLowerCase())
      );
    } else if (filterType === "top") {
      filtered = [...filtered].sort((a, b) => b.total - a.total).slice(0, 3);
    }

    const valid = filtered.filter((r): r is Receipt => !!r && typeof r.store === "string");
    if (valid.length === 0) {
      setChartData([]);
      setSpendingSummary([]);
      setRecommendations([]);
      setPrediction("No data available for this filter.");
      setTrendData([]);
      setTrendLabels([]);
      return;
    }

    processReceipts(valid);
  };

  const NoDataMessage: React.FC<{ message: string }> = ({ message }) => (
    <Text style={{ color: "#6B7280", textAlign: "center", fontStyle: "italic", marginTop: 10 }}>
      {message}
    </Text>
  );



  useEffect(() => {
    processReceipts(mockReceipts);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analysis</Text>
        <Text style={styles.subtitle}>Track your spending trends!</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Spending Breakdown</Text>
        {chartData.length > 0 ? (
          <PieChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{ color: (opacity = 1) => `rgba(74, 20, 140, ${opacity})` }}
            accessor={"amount"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            hasLegend={true}
            absolute
            style={styles.chart}
          />
        ) : (
          <NoDataMessage message="No category data to display." />
        )}
        <View style={styles.filterContainer}>
          <Text style={styles.sectionTitle}>Filter</Text>
          <View style={styles.filterInputs}>
            <TextInput
              style={[
                styles.input,
                (!["store", "date", "month", "week"].includes(selectedFilter)) && { backgroundColor: "#F3F3F3" },
              ]}
              placeholder={
                selectedFilter === "date"
                  ? "Enter date mm/dd/yyyy and click Date button"
                  : selectedFilter === "store"
                  ? "Enter store name and click Store button"
                  : selectedFilter === "month"
                  ? "Enter month name or number and click Month"
                  : selectedFilter === "week"
                  ? "Enter a date in the week range and click Week"
                  : "Select Date, Store, Month, or Week to type here"
}
              value={search}
              onChangeText={setSearch}
              editable={["store", "date", "month", "week"].includes(selectedFilter)}
              selectTextOnFocus={["store", "date", "month", "week"].includes(selectedFilter)}

            />

          </View>

          <View style={styles.filterButtons}>
            {["all", "top", "month", "week", "date", "store"].map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterButton,
                  selectedFilter === f && styles.activeFilterButton,
                ]}
                onPress={() => {
                  setSelectedFilter(f);
                  setSearch(""); 
                  applyFilter(f);
                }}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === f && styles.activeFilterButtonText,
                  ]}
                >
                  {f === "top" ? "Most Spent" : f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        </View>

        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>
            {selectedFilter === "top" ? "Most Money Spent" : "Spending Summary"}
          </Text>
          {spendingSummary.length > 0 ? (
           spendingSummary.map(([store, total], index) => (
              <View key={store} style={styles.listItem}>
                <Text style={styles.listText}>
                  {index + 1}. {store} - ${total.toFixed(2)}
                </Text>
              </View>
            ))
          ) : (
            <NoDataMessage message="No receipts found for this selection." />
          )}
        </View>

        <View style={styles.recommendationContainer}>
          <Text style={styles.sectionTitle}>Smart Recommendations</Text>
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <Text key={index} style={styles.recommendationText}>• {rec}</Text>
            ))
          ) : (
            <NoDataMessage message="No recommendations available — try uploading more receipts!" />
          )}
        </View>

        <View style={styles.predictionContainer}>
          <Text style={styles.sectionTitle}>Smart Prediction</Text>
          {prediction && prediction !== "No data available for this filter." ? (
            <>
              <Text style={styles.predictionText}>{prediction}</Text>
              {trendData.length > 0 && (
                <LineChart
                  data={{
                    labels: trendLabels,
                    datasets: [{ data: trendData, color: () => "#A78BFA" }],
                  }}
                  width={screenWidth - 80}
                  height={180}
                  yAxisLabel="$"
                  chartConfig={{
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                    color: (opacity = 1) => `rgba(74, 20, 140, ${opacity})`,
                    strokeWidth: 2,
                    decimalPlaces: 0,
                  }}
                  style={styles.lineChart}
                />
              )}
            </>
          ) : (
            <NoDataMessage message="No spending trend data available." />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },

  header: { 
    backgroundColor: "#A78BFA", 
    paddingTop: 70, 
    paddingBottom: 30, 
    alignItems: "center" 
  },

  subtitle: {
    color: "#F5F3FF",
    fontSize: 16,
    marginTop: 6,
    opacity: 0.9,
  },

  title: { 
    color: "#fff", 
    fontSize: 34, 
    fontWeight: "bold" 
  },

  contentContainer: { 
    padding: 20 
  },
  
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: "600", 
    color: "#333", 
    marginBottom: 10 
  },

  chart: { 
    marginVertical: 10, 
    borderRadius: 16, 
    alignSelf: "center" 
  },

  filterContainer: { 
    marginTop: 30, 
    padding: 15,
    backgroundColor: "#F5F3FF", 
    borderRadius: 16 
  },

  filterInputs: { 
    marginBottom: 10 
  },

  input: { 
    backgroundColor: "#fff", 
    borderWidth: 1, 
    borderColor: "#DDD", 
    borderRadius: 10, 
    padding: 10 
  },
  filterButtons: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-around" 
  },

  filterButton: { paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    backgroundColor: "#EDE9FE", 
    margin: 4 
  },

  activeFilterButton: { 
    backgroundColor: "#A78BFA" 
  },

  filterButtonText: { 
    color: "#4F46E5", 
    fontWeight: "600" 
  },

  activeFilterButtonText: { 
    color: "#fff" 
  },

  listContainer: { 
    marginTop: 30 
  },

  listItem: { 
    backgroundColor: "#F9F9FF", 
    borderRadius: 12, 
    padding: 15, 
    marginVertical: 6 
  },

  listText: { 
    color: "#333" 
  },

  recommendationContainer: { 
    marginTop: 30 
  },

  recommendationText: { 
    fontSize: 16, 
    color: "#4F46E5", 
    marginBottom: 6 
  },

  predictionContainer: { 
    marginTop: 30, 
    padding: 15, 
    backgroundColor: "#F5F3FF", 
    borderRadius: 16, 
    alignItems: "center" 
  },

  predictionText: { 
    fontSize: 16, 
    color: "#4F46E5", 
    fontWeight: "500", 
    marginBottom: 10, 
    textAlign: "center" 
  },

  lineChart: { 
    borderRadius: 16 
  },

});
