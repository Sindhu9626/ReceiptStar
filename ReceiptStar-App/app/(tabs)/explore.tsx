import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, FlatList, ActivityIndicator, Pressable, Keyboard, Platform, } from "react-native";

//Setting up reciept structure
type Receipt = {
  id: string;
  vendor: string;
  total: number;
  date: string;        
  previewText?: string;
};

//mock receupts
const MOCK_RECEIPTS: Receipt[] = [
  { id: "r1", vendor: "Target", total: 24.39, date: "2025-09-01T13:02:11Z", previewText: "Milk, bread, paper towels" },
  { id: "r2", vendor: "Costco", total: 112.07, date: "2025-08-21T10:15:00Z", previewText: "Rotisserie chicken, rice, batteries" },
  { id: "r3", vendor: "Starbucks", total: 6.58, date: "2025-10-02T08:44:12Z", previewText: "Latte, banana bread" },
  { id: "r4", vendor: "Publix", total: 48.92, date: "2025-07-12T17:30:00Z", previewText: "Apples, eggs, cheese" },
  { id: "r5", vendor: "Best Buy", total: 219.99, date: "2025-09-29T14:10:00Z", previewText: "USB-C hub, HDMI cable" },
  { id: "r6", vendor: "Chipotle", total: 12.85, date: "2025-10-15T12:20:00Z", previewText: "Chicken bowl, chips" },
];


const DEBOUNCE_MS = 300;
const FAKE_DELAY_MS = 450; 
const MIN_QUERY_LEN = 1;
const HIGHLIGHT_MATCHES = true;

export default function ExploreSearch() {

  const [query, setQuery] = useState("");

  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Receipt[]>([]);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    setError(null);

    // Reset for short or empty queries
    if (!debouncedQuery.trim() || debouncedQuery.trim().length < MIN_QUERY_LEN) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const t = setTimeout(() => {
      if (cancelled) return;

      try {
        const q = normalize(debouncedQuery);
        // Simple contains match on vendor + previewText
        const filtered = MOCK_RECEIPTS.filter(r => {
          const hay = `${r.vendor} ${r.previewText ?? ""}`;
          return normalize(hay).includes(q);
        });
        setResults(filtered);
      } catch (e: any) {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }, FAKE_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [debouncedQuery]);

  const header = (
    <View style={{ padding: 12, paddingTop: 60 }}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search receipts"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={() => Keyboard.dismiss()}
        style={{
          borderWidth: 1,
          borderColor: "#a86ae7ff",
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 14,
          backgroundColor: "#cbaae3ff",
          fontSize: 16,
        }}
      />
      <View style={{ height: 8 }} />
      
    </View>
  );

  const bodyState = (() => {
    if (!query.trim() || query.trim().length < MIN_QUERY_LEN) {
      return <View style={{ height: 0 }} />;
    }
    if (loading) {
      return (
        <Centered>
          <ActivityIndicator />
          <View style={{ height: 8 }} />
          <Text style={{ color: "#bd97f2ff" }}>Searching…</Text>
        </Centered>
      );
    }
    if (error) {
      return (
        <Centered>
          <Text style={{ color: "#B00020" }}>{error}</Text>
          <View style={{ height: 10 }} />
          <Pressable onPress={() => setQuery(q => q + " ")}>
            <Text style={{ color: "#2563EB", fontWeight: "600" }}>Try again</Text>
          </Pressable>
        </Centered>
      );
    }
    if (results.length === 0) {
      return (
        <Centered>
          <Text style={{ color: "#6B7280" }}>No matches found.</Text>
          <View style={{ height: 6 }} />
        </Centered>
      );
    }
    return null;
  })();

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <FlatList
        data={results}
        keyExtractor={(r) => r.id}
        ListHeaderComponent={header}
        ListEmptyComponent={bodyState}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <ReceiptCard
            receipt={item}
            query={debouncedQuery}
            highlight={HIGHLIGHT_MATCHES}
            onPress={() => {
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}

// recipet card set up
function ReceiptCard({
  receipt,
  query,
  highlight,
  onPress,
}: {
  receipt: Receipt;
  query: string;
  highlight: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 1,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
        <Text style={{ fontWeight: "700", fontSize: 16 }}>{receipt.vendor}</Text>
        <Text style={{ fontWeight: "600" }}>${receipt.total.toFixed(2)}</Text>
      </View>
      <Text style={{ color: "#6B7280", marginBottom: 6 }}>
        {new Date(receipt.date).toLocaleDateString()}
      </Text>

      {receipt.previewText ? (
        <Text numberOfLines={2} style={{ color: "#374151" }}>
          {highlight ? highlightText(receipt.previewText, query) : receipt.previewText}
        </Text>
      ) : null}
    </Pressable>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 40 }}>
      {children}
    </View>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function normalize(s: string) {
  return s.normalize("NFKC").toLowerCase().trim();
}

function highlightText(text: string, rawQuery: string) {
  const q = normalize(rawQuery);
  if (!q) return text;

  const i = normalize(text).indexOf(q);
  if (i === -1) return text;

  const before = text.slice(0, i);
  const match = text.slice(i, i + rawQuery.length);
  const after = text.slice(i + rawQuery.length);

  return (
    <>
      {before}
      <Text style={{ fontWeight: "700" }}>{match}</Text>
      {after}
    </>
  );
}

/*
export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Explore
        </ThemedText>
      </ThemedView>
      <ThemedText>This app includes example code to help you get started.</ThemedText>
      <Collapsible title="File-based routing">
        <ThemedText>
          This app has two screens:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <ThemedText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Images">
        <ThemedText>
          For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
          different screen densities
        </ThemedText>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Light and dark mode components">
        <ThemedText>
          This template has light and dark mode support. The{' '}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <ThemedText>
          This template includes an example of an animated component. The{' '}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
          the powerful{' '}
          <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
            react-native-reanimated
          </ThemedText>{' '}
          library to create a waving hand animation.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              component provides a parallax effect for the header image.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
*/