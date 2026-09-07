import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import * as accountApi from "../api/account";
import type { User } from "../types";

export function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", company: "", bio: "", phone: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    accountApi.getMe().then((u) => {
      setUser(u);
      setForm({
        name: u.name || "",
        company: u.company || "",
        bio: u.bio || "",
        phone: u.phone || "",
      });
    });
  }, []);

  async function handleSave() {
    const updated = await accountApi.updateMe(form);
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.role}>{user.role.replace("_", " ")}</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
      />

      <Text style={styles.label}>Company</Text>
      <TextInput
        style={styles.input}
        value={form.company}
        onChangeText={(v) => setForm((f) => ({ ...f, company: v }))}
      />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={form.phone}
        onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, { height: 90 }]}
        multiline
        value={form.bio}
        onChangeText={(v) => setForm((f) => ({ ...f, bio: v }))}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>{saved ? "Saved ✓" : "Save Changes"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  email: { color: "#94a3b8", fontSize: 14 },
  role: { color: "#94a3b8", fontSize: 14, marginBottom: 20 },
  label: { color: "#cbd5e1", fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: "#1e293b",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});