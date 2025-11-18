import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";


import { auth } from "../../src/firebaseConfig";
import { fetchAllReceipts } from "../../src/ml/firestoreReads";
import { predictNextMonth } from "../../src/ml/mlService";
import { mockReceipts as importedMockReceipts } from "../../src/mock/mockData";

const screenWidth = Dimensions.get("window").width;

type LocalReceipt = {
  id: string;
  store: string;
  date: string; 
  total: number;
  category?: string;
};

function formatDateToMDY(d: Date) {
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function normalizeIncoming(receiptsFromBackend: any[]): LocalReceipt[] {
  const seen = new Set<string>();

  const receipts = receiptsFromBackend
    .map((r): LocalReceipt | null => {
      if (!r) return null;

      // --- date handling ---
      let dateObj: Date | null = null;

      if (r.Date && typeof r.Date === "object" && typeof (r.Date as any).toDate === "function") {
        try {
          dateObj = (r.Date as any).toDate();
        } catch {
          dateObj = null;
        }
      } else if (r.Date instanceof Date) {
        dateObj = r.Date;
      } else if (typeof r.date === "string") {
        const [m, d, y] = r.date.split("/").map(Number);
        if (!isNaN(m) && !isNaN(d) && !isNaN(y)) {
          dateObj = new Date(y, m - 1, d);
        }
      } else if (r.date && typeof r.date === "object" && typeof (r.date as any).toDate === "function") {
        try {
          dateObj = (r.date as any).toDate();
        } catch {
          dateObj = null;
        }
      } else if (typeof r.Date === "string") {
        const d = new Date(r.Date);
        if (!isNaN(d.getTime())) dateObj = d;
      }

      const normalizedDate = dateObj ? formatDateToMDY(dateObj) : formatDateToMDY(new Date());

      return {
        id: r.id ?? String(Math.random()),
        store: r.Store ?? r.store ?? r.title ?? "Unknown",
        date: normalizedDate,
        total: Number(r.Total ?? r.total ?? 0),
        category: r.Category ?? r.category ?? "Uncategorized",
      };
    })
    .filter((r): r is LocalReceipt => r !== null); // TS type narrowing

  // Remove duplicates
  const unique = receipts.filter((receipt): receipt is LocalReceipt => {
    const key = `${receipt.store}|${receipt.date}|${receipt.total}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique;
}



export default function AnalysisScreen() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [spendingSummary, setSpendingSummary] = useState<[string, number][]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [rawReceipts, setRawReceipts] = useState<any[]>([]);  
  const [allReceipts, setAllReceipts] = useState<LocalReceipt[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      try {
        const user = auth?.currentUser;

        if (!user) {
           
          if (mounted) {
            setRawReceipts(importedMockReceipts);
            setLoading(false);
          }
          return;
        }

        const fetched = await fetchAllReceipts({ uid: user.uid });

        if (mounted) {
           
          setRawReceipts(
            fetched && fetched.length > 0 ? fetched : importedMockReceipts
          );
          setLoading(false);
        }
      } catch (e) {
        console.warn("Error fetching receipts, falling back to mock:", e);
        if (mounted) {
          setRawReceipts(importedMockReceipts);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);


  
  useEffect(() => {
    const normalized = normalizeIncoming(rawReceipts);
    setAllReceipts(normalized);
     
    if (normalized.length > 0) {
      processReceipts(normalized);
    } else {
       
      setChartData([]);
      setSpendingSummary([]);
      setRecommendations([]);
    }
  }, [rawReceipts]);

  const parseDate = (str: string) => {
    const [month, day, year] = str.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  const processReceipts = (receipts: LocalReceipt[]) => {
    const categoryTotals: Record<string, number> = {};
    receipts.forEach((r) => {
      const cat = r.category || "Uncategorized";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + r.total;
    });

    const colorPool = ["#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE", "#FCE7F3", "#FDE68A"];

    const prettyName = (cat: string) => {
      if (cat.toLowerCase() === "miscellaneous") return "Misc.";
      if (cat.toLowerCase() === "entertainment") return "Entertain.";
      return cat;
    };

    const chartReady = Object.keys(categoryTotals).map((cat, i) => ({
      name: prettyName(cat),
      amount: categoryTotals[cat],
      color: colorPool[i % colorPool.length],
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
  };

  const generateRecommendations = (receipts: LocalReceipt[]) => {
    if (!receipts || receipts.length === 0) {
      setRecommendations([]);
      return;
    }

    const highSpendStore = receipts.reduce(
      (prev, curr) => (curr.total > prev.total ? curr : prev),
      receipts[0]
    );

     
    const freq: Record<string, number> = {};
    receipts.forEach((r) => (freq[r.store] = (freq[r.store] || 0) + 1));
    const frequentStore = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? receipts[0].store;

    const recs = [
      `You tend to spend the most at ${highSpendStore.store}.`,
      `You shop frequently at ${frequentStore}.`,
      `Try checking for discounts at ${highSpendStore.store} next time.`,
    ];

    setRecommendations(recs);
  };

  const applyFilter = (filterType: string) => {
    let filtered = [...allReceipts];
    const now = new Date();

    if (filterType === "month") {
      filtered = filtered.filter((r) => {
        const d = parseDate(r.date);
        if (search) {
          const monthName = d.toLocaleString("default", { month: "long" }).toLowerCase();
          const searchLower = search.toLowerCase();
          return monthName.includes(searchLower) || Number(search) === d.getMonth() + 1;
        }
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (filterType === "week") {
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
      filtered = filtered.filter((r) => r.store.toLowerCase().includes(search.toLowerCase()));
    } else if (filterType === "top") {
      filtered = [...filtered].sort((a, b) => b.total - a.total).slice(0, 3);
    }

    const valid = filtered.filter((r): r is LocalReceipt => !!r && typeof r.store === "string");

    if (valid.length === 0) {
      setChartData([]);
      setSpendingSummary([]);
      setRecommendations([]);
      return;
    }

    processReceipts(valid);
  };

  const mlChartData = useMemo(() => { 
     
    const shaped = rawReceipts
      .map((r) => {
        let date: Date | null = null;

        if (r.Date instanceof Date) {
          date = r.Date;
        } else if (typeof r.date === "string") {
          const [m, d, y] = r.date.split("/").map(Number);
          date = new Date(y, m - 1, d);
        } else if (r.Date && typeof r.Date.toDate === "function") {
          try {
            date = r.Date.toDate();
          } catch {
            date = null;
          }
        }

        return {
          date,
          total: Number(r.Total ?? r.total ?? 0),
        };
      })
      .filter((x) => x.date && !isNaN(x.date.getTime()));

    if (shaped.length === 0) {
      return { labels: [], historyData: [], predictionData: [] };
    }

     
    const monthly = (() => {
      const map: Record<string, number> = {};

      shaped.forEach((h) => {
        const d = h.date!; 
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        map[key] = (map[key] || 0) + h.total;
      });

      return Object.entries(map)
        .map(([key, total]) => {
          const [year, month] = key.split("-").map(Number);
          return { date: new Date(year, month - 1, 1), total };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    })();

    if (monthly.length === 0) {
      return { labels: [], historyData: [], predictionData: [] };
    }

     
    const next = predictNextMonth(
      monthly.map((m) => ({ date: m.date, total: m.total }))
    );

     
    const labels = monthly.map(
      (m) => `${m.date.toLocaleString("default", { month: "short" })}`
    );

    const historyData: (number | null)[] = monthly.map((m) => m.total);

    let predictionData = Array(monthly.length).fill(null);

    if (next) {
      labels.push(
        next.date.toLocaleString("default", { month: "short" })
      );
      historyData.push(null);
      predictionData.push(Number(next.predicted));
    }

    return { labels, historyData, predictionData };
    
  }, [rawReceipts]);


  const NoDataMessage: React.FC<{ message: string }> = ({ message }) => (
    <Text
      style={{
        color: "#6B7280",
        textAlign: "center",
        fontStyle: "italic",
        marginTop: 10,
      }}
    >
      {message}
    </Text>
  );

   
  useEffect(() => {
     
    if (allReceipts.length > 0 && selectedFilter === "all") {
      processReceipts(allReceipts);
    }
  }, [allReceipts]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analysis</Text>
        <Text style={styles.subtitle}>Track your spending trends!</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Spending Breakdown</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#6B21A8" />
        ) : chartData.length > 0 ? (
          <PieChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(74, 20, 140, ${opacity})`,
            }}
            accessor={"amount"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            hasLegend={true}
            style={styles.chart}
          />
        ) : (
          <NoDataMessage message="No category data to display." />
        )}

        <View style={styles.filterContainer}>
          <Text style={styles.sectionTitle}>Filter</Text>

          <TextInput
            style={[
              styles.input,
              !["store", "date", "month", "week"].includes(selectedFilter) && {
                backgroundColor: "#F3F3F3",
              },
            ]}
            placeholder={
              selectedFilter === "month"
                ? "Enter month name or number and click Month"
                : selectedFilter === "week"
                ? "Enter date in the week range and click Week"
                : selectedFilter === "date"
                ? "Enter date MM/DD/YYYY and click Date button"
                : selectedFilter === "store"
                ? "Enter store name and click Store button"
                : "Enter search filter details here"
            }
            placeholderTextColor="#9CA3AF"  
            value={search}
            onChangeText={setSearch}
            editable={["store", "date", "month", "week"].includes(selectedFilter)}
          />

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
              <Text key={index} style={styles.recommendationText}>
                • {rec}
              </Text>
            ))
          ) : (
            <NoDataMessage message="No recommendations yet — upload more receipts!" />
          )}
        </View>

        <View style={styles.mlGraphContainer}>
          <Text style={styles.chartHeader}>Projected Spending for Next Month</Text>

          {mlChartData.historyData && mlChartData.historyData.length > 0 ? (
            <LineChart
              data={{
                labels: mlChartData.labels,
                datasets: [
                  {
                    data: mlChartData.historyData,
                    color: () => "rgba(74, 20, 140, 1)",  
                    strokeWidth: 2,
                  },
                  {
                    data: mlChartData.predictionData,
                    color: () => "rgba(199, 116, 232, 1)",  
                    strokeWidth: 2,
                  },
                ],
                legend: ["History", "Prediction (Next Month)"],
              }}
              width={screenWidth - 40}
              height={260}
              yAxisLabel="$"
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(74, 20, 140, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(51,51,51, ${opacity})`,
                propsForDots: { r: "3" },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 12 }}
            />
          ) : (
            <NoDataMessage message="Not enough data to build prediction graph." />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#A78BFA",
    paddingTop: 70,
    paddingBottom: 20,
    alignItems: "center",
  },
  title: { color: "#fff", fontSize: 34, fontWeight: "bold" },
  subtitle: { color: "#F5F3FF", fontSize: 16, marginTop: 6, opacity: 0.95 },
  contentContainer: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "600", color: "#333", marginBottom: 10 },
  chart: { marginVertical: 10, borderRadius: 16, alignSelf: "center" },
  filterContainer: { marginTop: 20, padding: 15, backgroundColor: "#F5F3FF", borderRadius: 16 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 10, marginBottom: 10 },
  filterButtons: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around" },
  filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#EDE9FE", margin: 4 },
  activeFilterButton: { backgroundColor: "#A78BFA" },
  filterButtonText: { color: "#4F46E5", fontWeight: "600" },
  activeFilterButtonText: { color: "#fff" },
  listContainer: { marginTop: 20 },
  listItem: { backgroundColor: "#F9F9FF", borderRadius: 12, padding: 15, marginVertical: 6 },
  listText: { color: "#333" },
  recommendationContainer: { backgroundColor: "#F5F3FF", borderRadius: 20, padding: 16, marginVertical: 12, alignItems: "flex-start" },
  recommendationText: { fontSize: 16, color: "#4F46E5", marginBottom: 6 },
  chartHeader: { fontSize: 18, fontWeight: "600", color: "#1e1e1e", marginBottom: 8, textAlign: "center" },
  mlGraphContainer: { marginTop: 20, alignItems: "center", backgroundColor: "#fff" },

   
  sourceButton: { padding: 8, paddingHorizontal: 14, borderRadius: 16, backgroundColor: "transparent", marginHorizontal: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  sourceButtonActive: { backgroundColor: "#fff" },
  sourceText: { color: "#fff", fontWeight: "600" },
  sourceTextActive: { color: "#4F46E5" },
});
