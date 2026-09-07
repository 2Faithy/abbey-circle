import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import * as connectionsApi from "../api/connections";
import type { Connection } from "../types";

export function NetworkScreen() {
  const { user, logout } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await connectionsApi.listConnections();
    setConnections(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const pending = connections.filter((c) => c.status === "PENDING" && c.addresseeId === user?.id);
  const accepted = connections.filter((c) => c.status === "ACCEPTED");

  async function handleAccept(id: string) {
    await connectionsApi.acceptConnection(id);
    load();
  }

  async function handleDecline(id: string) {
    await connectionsApi.declineConnection(id);
    load();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Abbey Circle</Text>
        <TouchableOpacity onPress={() => logout()}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        data={[]}
        keyExtractor={() => "x"}
        renderItem={null}
        ListHeaderComponent={
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Pending Requests ({pending.length})</Text>
            {pending.map((c) => (
              <View key={c.id} style={styles.card}>
                <Text style={styles.cardName}>{c.requester.name}</Text>
                <Text style={styles.cardMeta}>
                  {c.requester.role.replace("_", " ")}
                  {c.requester.company ? ` · ${c.requester.company}` : ""}
                </Text>
                <View style={styles.row}>
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(c.id)}>
                    <Text style={styles.btnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineBtn} onPress={() => handleDecline(c.id)}>
                    <Text style={styles.btnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <Text style={styles.sectionTitle}>My Connections ({accepted.length})</Text>
            {accepted.map((c) => {
              const other = c.requesterId === user?.id ? c.addressee : c.requester;
              return (
                <View key={c.id} style={styles.card}>
                  <Text style={styles.cardName}>{other.name}</Text>
                  <Text style={styles.cardMeta}>
                    {other.role.replace("_", " ")}
                    {other.company ? ` · ${other.company}` : ""}
                  </Text>
                </View>
              );
            })}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  logout: { color: "#94a3b8" },
  content: { padding: 20 },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "600", marginTop: 16, marginBottom: 10 },
  card: { backgroundColor: "#1e293b", borderRadius: 10, padding: 14, marginBottom: 10 },
  cardName: { color: "#fff", fontWeight: "600", fontSize: 15 },
  cardMeta: { color: "#94a3b8", fontSize: 13, marginTop: 2 },
  row: { flexDirection: "row", gap: 8, marginTop: 10 },
  acceptBtn: { backgroundColor: "#16a34a", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  declineBtn: { backgroundColor: "#334155", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  btnText: { color: "#fff", fontSize: 13, fontWeight: "500" },
});