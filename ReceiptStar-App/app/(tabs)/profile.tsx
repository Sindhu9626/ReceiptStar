import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { logOut } from "../../src/authService";
import { auth } from "../../src/firebaseConfig";

export default function SettingsScreen() {
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = auth.currentUser;
    setEmail(currentUser?.email ?? null);
  }, []);

  const handleLogout = async () => {
    try {
      await logOut(); 
      router.replace("/loginScreen"); 
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Signed In As:</Text>
        <Text style={styles.email}>{email ?? "Loading..."}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>LOG OUT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#A78BFA",
    paddingTop: 70,
    paddingBottom: 30,
    alignItems: "center",
  },
  title: { color: "#fff", fontSize: 34, fontWeight: "bold" },
  subtitle: { color: "#F5F3FF", fontSize: 16, marginTop: 6, opacity: 0.9 },
  content: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  label: { fontSize: 18, color: "#4B5563", marginBottom: 8 },
  email: { fontSize: 20, fontWeight: "600", color: "#4F46E5" },
  logoutButton: {
    backgroundColor: "#A78BFA",
    marginHorizontal: 40,
    marginBottom: 60,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
