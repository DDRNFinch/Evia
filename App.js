import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native';
import ksbData from './ksb-data.json';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Apprentice+</Text>
        <Text style={styles.subtitle}>{ksbData.standard}</Text>
      </View>
      <ScrollView style={styles.body}>
        {ksbData.collections.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.id}. {item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.totalUnits} Units Mapped</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f5f7' },
  header: { padding: 20, backgroundColor: '#1e293b' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  body: { padding: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 8, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#2563eb' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  cardSubtitle: { fontSize: 12, color: '#64748b', marginTop: 4 }
});
