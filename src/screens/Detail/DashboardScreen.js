import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, SafeAreaView, ScrollView, TextInput, Clipboard } from 'react-native';
import { useTripStore } from '../../store/useTripStore';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen({ navigation }) {
  const activeTripId = useTripStore(state => state.activeTripId);
  const setActiveTripId = useTripStore(state => state.setActiveTripId);
  const trips = useTripStore(state => state.trips);
  const users = useTripStore(state => state.users);
  const updateTripMemo = useTripStore(state => state.updateTripMemo);
  const checklist = useTripStore(state => state.checklist);
  const expenses = useTripStore(state => state.expenses);
  const timeline = useTripStore(state => state.timeline);

  const [editMemo, setEditMemo] = useState(false);
  const [memoInput, setMemoInput] = useState('');

  // 현재 여행 데이터 추출
  const currentTrip = trips.find(t => t.id === activeTripId);
  if (!currentTrip) return null;

  // 여행 멤버 리스트 추출
  const members = users.filter(u => currentTrip.participants.includes(u.uid));

  // 준비물 통계
  const tripChecklist = checklist[activeTripId] || [];
  const completedChecklist = tripChecklist.filter(c => c.completed).length;

  // 가계부 통계
  const tripExpenses = expenses[activeTripId] || [];
  const totalExpense = tripExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 오늘의 대표 동선 (Day 1 타임라인의 첫 3개 아이템)
  const tripTimeline = timeline[activeTripId] || [];
  const day1Timeline = tripTimeline.filter(t => t.day === 1).slice(0, 3);

  const handleCopyInviteLink = () => {
    const inviteLink = `https://tripwith.app/invite/${activeTripId}`;
    Clipboard.setString(inviteLink);
    Alert.alert('링크 복사 완료', '💬 카카오톡 친구 초청 링크가 클립보드에 복사되었습니다.');
  };

  const handleToggleMemoEdit = () => {
    setMemoInput(currentTrip.memo?.text || '');
    setEditMemo(!editMemo);
  };

  const handleSaveMemo = () => {
    if (!memoInput.trim()) {
      Alert.alert('오류', '공지 텍스트를 입력해주세요.');
      return;
    }
    updateTripMemo(activeTripId, memoInput);
    setEditMemo(false);
    Alert.alert('성공', '📢 새로운 한줄 공지 메모가 실시간으로 변경되었습니다!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 목록으로 돌아가기 버튼 */}
        <TouchableOpacity style={styles.backButton} onPress={() => setActiveTripId(null)}>
          <Ionicons name="arrow-back" size={16} color={theme.colors.primary} />
          <Text style={styles.backButtonText}>다른 여행 목록으로 돌아가기</Text>
        </TouchableOpacity>

        {/* 여행 요약 카드 */}
        <View style={styles.tripCard}>
          <Image source={{ uri: currentTrip.cover }} style={styles.coverImage} />
          <LinearGradient
            colors={['rgba(2, 132, 199, 0.85)', 'rgba(79, 70, 229, 0.45)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradientOverlay}
          >
            <View style={styles.tripCardHeader}>
              <Text style={styles.tripCardSubTitle}>ACTIVE TRIP GROUP</Text>
              <Text style={styles.tripCardTitle} numberOfLines={1}>
                {currentTrip.title}
              </Text>
              <View style={styles.badgeRow}>
                <View style={styles.rangeBadge}>
                  <Text style={styles.rangeText}>{currentTrip.range}</Text>
                </View>
                <View style={styles.ddayBadge}>
                  <Text style={styles.ddayText}>{currentTrip.dday}</Text>
                </View>
              </View>
            </View>

            <View style={styles.tripCardFooter}>
              <View style={styles.avatarRow}>
                {members.slice(0, 5).map(m => (
                  <Image key={m.uid} source={{ uri: m.avatar }} style={styles.memberAvatar} title={m.name} />
                ))}
                {members.length > 5 && (
                  <View style={styles.moreAvatarBadge}>
                    <Text style={styles.moreAvatarText}>+{members.length - 5}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity style={styles.inviteBtn} onPress={handleCopyInviteLink}>
                <Ionicons name="person-add" size={12} color={theme.colors.primary} />
                <Text style={styles.inviteBtnText}>초대 링크</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* 통계 그리드 위젯 */}
        <View style={styles.statsGrid}>
          <TouchableOpacity 
            style={styles.statsWidget}
            onPress={() => navigation.navigate('Checklist/Expense', { initialTab: 'checklist' })}
          >
            <View style={[styles.statsIconContainer, { backgroundColor: theme.colors.successLight }]}>
              <Ionicons name="checkbox-outline" size={18} color={theme.colors.success} />
            </View>
            <View>
              <Text style={styles.statsLabel}>준비물 완료</Text>
              <Text style={styles.statsValue}>{completedChecklist} / {tripChecklist.length} 개</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.statsWidget}
            onPress={() => navigation.navigate('Checklist/Expense', { initialTab: 'expenses' })}
          >
            <View style={[styles.statsIconContainer, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="wallet-outline" size={18} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={styles.statsLabel}>공용 지출</Text>
              <Text style={styles.statsValue}>{totalExpense.toLocaleString()}원</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 오늘의 대표 동선 */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderTitle}>
              <Ionicons name="calendar" size={16} color={theme.colors.primary} />
              <Text style={styles.sectionTitleText}>오늘의 대표 동선</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Timeline')}>
              <Text style={styles.seeMoreText}>더보기 &gt;</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timelineList}>
            {day1Timeline.length === 0 ? (
              <Text style={styles.emptyTimelineText}>등록된 첫날 일정이 없습니다.</Text>
            ) : (
              day1Timeline.map(item => {
                const creator = users.find(u => u.uid === item.creator) || { avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100' };
                return (
                  <View key={item.id} style={styles.timelineItem}>
                    <View style={styles.timelineItemLeft}>
                      <Text style={styles.timelineItemTime}>{item.time}</Text>
                      <View>
                        <Text style={styles.timelineItemName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.timelineItemAddress} numberOfLines={1}>{item.address}</Text>
                      </View>
                    </View>
                    <Image source={{ uri: creator.avatar }} style={styles.timelineCreatorAvatar} />
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* 채팅방 이동 링크 */}
        <TouchableOpacity style={styles.chatLinkBanner} onPress={() => navigation.navigate('Chat')}>
          <View style={styles.chatLinkLeft}>
            <View style={styles.chatIconBadge}>
              <Ionicons name="chatbubbles" size={18} color={theme.colors.card} />
            </View>
            <View>
              <Text style={styles.chatLinkTitle}>친구 단체 채팅방 가기</Text>
              <Text style={styles.chatLinkSubtitle}>최근 대화 및 여행 꿀팁 실시간 공유</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>

        {/* 실시간 한줄 메모판 (Notice Board) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderTitle}>
              <Ionicons name="megaphone" size={16} color="#f97316" />
              <Text style={styles.sectionTitleText}>친구 한줄 메모판</Text>
            </View>
            {!editMemo && (
              <TouchableOpacity onPress={handleToggleMemoEdit} style={styles.editBtn}>
                <Ionicons name="pencil" size={10} color={theme.colors.primary} />
                <Text style={styles.editBtnText}>수정/등록</Text>
              </TouchableOpacity>
            )}
          </View>

          {editMemo ? (
            <View style={styles.memoForm}>
              <TextInput
                style={styles.memoInput}
                value={memoInput}
                onChangeText={setMemoInput}
                placeholder="친구들과 공유할 새로운 긴급 공지를 적으세요..."
                maxLength={65}
              />
              <View style={styles.memoFormAction}>
                <TouchableOpacity style={styles.memoCancelBtn} onPress={() => setEditMemo(false)}>
                  <Text style={styles.memoCancelBtnText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.memoSaveBtn} onPress={handleSaveMemo}>
                  <Text style={styles.memoSaveBtnText}>공지 등록</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.memoDisplay}>
              <Text style={styles.memoContent}>
                "{currentTrip.memo?.text || '등록된 공지 메모가 아직 없습니다.'}"
              </Text>
              <Text style={styles.memoFooter}>
                - {currentTrip.memo?.authorName || '시스템'}가 남김 ({currentTrip.memo?.time || '방금 전'})
              </Text>
            </View>
          )}
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
    padding: 16,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd', // Sky-200
    marginBottom: 16,
    gap: 6,
  },
  backButtonText: {
    fontSize: 11,
    color: '#0369a1', // Sky-700
    fontWeight: 'bold',
  },
  tripCard: {
    height: 144,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
    ...theme.shadows.md,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
  },
  tripCardHeader: {
    marginTop: 4,
  },
  tripCardSubTitle: {
    color: '#e0f2fe',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tripCardTitle: {
    color: theme.colors.card,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  rangeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rangeText: {
    color: theme.colors.card,
    fontSize: 9,
    fontWeight: '600',
  },
  ddayBadge: {
    backgroundColor: '#34d399', // Emerald-400
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ddayText: {
    color: theme.colors.dark,
    fontSize: 9,
    fontWeight: 'bold',
  },
  tripCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.card,
    marginRight: -6,
  },
  moreAvatarBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1.5,
    borderColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  moreAvatarText: {
    color: theme.colors.card,
    fontSize: 8,
    fontWeight: 'bold',
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    ...theme.shadows.sm,
  },
  inviteBtnText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  statsWidget: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 12,
    gap: 10,
    ...theme.shadows.sm,
  },
  statsIconContainer: {
    padding: 8,
    borderRadius: 10,
  },
  statsLabel: {
    fontSize: 9,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
  },
  statsValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 1,
  },
  sectionContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitleText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  seeMoreText: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  timelineList: {
    gap: 8,
  },
  emptyTimelineText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timelineItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  timelineItemTime: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  timelineItemName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
    maxWidth: 200,
  },
  timelineItemAddress: {
    fontSize: 9,
    color: theme.colors.textMuted,
    marginTop: 1,
    maxWidth: 200,
  },
  timelineCreatorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chatLinkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  chatLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatIconBadge: {
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatLinkTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0369a1',
  },
  chatLinkSubtitle: {
    fontSize: 9,
    color: theme.colors.primary,
    marginTop: 1,
    fontWeight: '600',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  editBtnText: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  memoForm: {
    marginTop: 4,
    gap: 8,
  },
  memoInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 11,
    color: theme.colors.text,
  },
  memoFormAction: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  memoCancelBtn: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  memoCancelBtnText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
  },
  memoSaveBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  memoSaveBtnText: {
    fontSize: 10,
    color: theme.colors.card,
    fontWeight: 'bold',
  },
  memoDisplay: {
    backgroundColor: '#fffbeb', // Light amber
    borderWidth: 1,
    borderColor: '#fef3c7',
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  memoContent: {
    fontSize: 11,
    color: '#b45309', // Dark amber
    fontWeight: 'bold',
    lineHeight: 16,
  },
  memoFooter: {
    fontSize: 9,
    color: theme.colors.textMuted,
    textAlign: 'right',
    fontWeight: '600',
  },
});
