import React, { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import { signUp, logIn } from "../../src/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      await signUp(email, password);
      Alert.alert("Success", "Account created!");
    } catch (error: any) {
      Alert.alert("Signup Error", error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await logIn(email, password);
      Alert.alert("Success", "Logged in!");
    } catch (error: any) {
      Alert.alert("Login Error", error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />

      <Text>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />

      <Button title="Sign Up" onPress={handleSignup} />
      <Button title="Log In" onPress={handleLogin} />
    </View>
  );
}
