import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, Alert, SafeAreaView, ScrollView } from 'react-native';
import { useTripStore } from '../../store/useTripStore';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const trips = useTripStore(state => state.trips);
  const createTrip = useTripStore(state => state.createTrip);
  const setActiveTripId = useTripStore(state => state.setActiveTripId);

  const [showRegForm, setShowRegForm] = useState(false);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('2026-08-15');
  const [endDate, setEndDate] = useState('2026-08-17');

  const activeTrips = trips.filter(t => !t.isPast);
  const pastTrips = trips.filter(t => t.isPast);

  const handleCreateTrip = () => {
    if (!title || !startDate || !endDate) {
      Alert.alert('오류', '여행지 제목과 일정을 모두 채워주세요.');
      return;
    }
    const newTrip = createTrip(title, startDate, endDate);
    Alert.alert('성공', `🗺️ 새로운 여행 [${title}]이 개설되었습니다!`);
    setTitle('');
    setShowRegForm(false);
    // 상세 페이지로 자동 진입하게 할 수도 있습니다.
    setActiveTripId(newTrip.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="earth" size={20} color={theme.colors.primary} />
            <Text style={styles.headerTitle}>진행 중 & 예정인 우정 여행</Text>
          </View>
          {!showRegForm && (
            <TouchableOpacity style={styles.regToggleBtn} onPress={() => setShowRegForm(true)}>
              <Text style={styles.regToggleBtnText}>+ 새 여행 등록</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 새 여행 등록 폼 */}
        {showRegForm && (
          <View style={styles.regForm}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>🗺️ 새 우정 여행 계획 개설</Text>
              <TouchableOpacity onPress={() => setShowRegForm(false)}>
                <Ionicons name="close" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>우정 여행 제목</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 고교 절친 힐링캠프, 부산 정복기"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flexHalf]}>
                <Text style={styles.inputLabel}>시작 일자</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>
              <View style={[styles.inputGroup, styles.flexHalf, { marginLeft: 12 }]}>
                <Text style={styles.inputLabel}>종료 일자</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateTrip}>
              <Text style={styles.submitBtnText}>새 우정 플래너 생성하기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 활성 여행 카드 리스트 */}
        <View style={styles.listSection}>
          {activeTrips.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>예정된 여행이 없습니다. 새 여행을 개설해보세요!</Text>
            </View>
          ) : (
            activeTrips.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.tripCard}
                activeOpacity={0.9}
                onPress={() => setActiveTripId(item.id)}
              >
                <Image source={{ uri: item.cover }} style={styles.coverImage} />
                <LinearGradient
                  colors={['rgba(15, 23, 42, 0.85)', 'rgba(15, 23, 42, 0.45)', 'transparent']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.gradientOverlay}
                >
                  <View style={styles.badgeContainer}>
                    <View style={styles.ddayBadge}>
                      <Text style={styles.ddayText}>{item.dday}</Text>
                    </View>
                  </View>
                  <View style={styles.tripCardFooter}>
                    <Text style={styles.tripTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.tripRange}>
                      <Ionicons name="time-outline" size={10} color="#cbd5e1" /> {item.range}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* 추억 보관고 (지난 여행) */}
        <View style={styles.pastSection}>
          <View style={styles.pastHeader}>
            <Ionicons name="archive" size={18} color={theme.colors.textMuted} />
            <Text style={styles.pastTitle}>추억 보관고: 지난 여행 기록 ({pastTrips.length})</Text>
          </View>

          <View style={styles.pastGrid}>
            {pastTrips.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.pastCard}
                onPress={() => setActiveTripId(item.id)}
              >
                <View style={styles.pastImageContainer}>
                  <Image source={{ uri: item.cover }} style={styles.pastCoverImage} />
                  <View style={styles.pastDimOverlay} />
                </View>
                <View style={styles.pastCardBody}>
                  <Text style={styles.pastCardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.pastCardRange}>{item.range}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  regToggleBtn: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  regToggleBtnText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '800',
  },
  regForm: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 20,
    ...theme.shadows.md,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8,
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: theme.colors.text,
  },
  row: {
    flexDirection: 'row',
  },
  flexHalf: {
    flex: 1,
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: theme.colors.card,
    fontSize: 12,
    fontWeight: 'bold',
  },
  listSection: {
    marginBottom: 24,
  },
  emptyContainer: {
    backgroundColor: theme.colors.card,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  tripCard: {
    height: 112,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
    ...theme.shadows.sm,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 14,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  ddayBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ddayText: {
    color: theme.colors.card,
    fontSize: 9,
    fontWeight: '900',
  },
  tripCardFooter: {
    marginTop: 'auto',
  },
  tripTitle: {
    color: theme.colors.card,
    fontSize: 15,
    fontWeight: 'bold',
  },
  tripRange: {
    color: '#cbd5e1',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  pastSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 16,
  },
  pastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  pastTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  pastGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pastCard: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
    ...theme.shadows.sm,
  },
  pastImageContainer: {
    height: 64,
    position: 'relative',
  },
  pastCoverImage: {
    width: '100%',
    height: '100%',
  },
  pastDimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
  },
  pastCardBody: {
    padding: 8,
  },
  pastCardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  pastCardRange: {
    fontSize: 8,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
