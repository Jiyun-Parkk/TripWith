import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert, SafeAreaView } from 'react-native';
import { useTripStore } from '../../store/useTripStore';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ChecklistExpenseScreen({ route }) {
  const activeTripId = useTripStore(state => state.activeTripId);
  const trips = useTripStore(state => state.trips);
  const users = useTripStore(state => state.users);
  const checklist = useTripStore(state => state.checklist);
  const expenses = useTripStore(state => state.expenses);
  const addChecklistItem = useTripStore(state => state.addChecklistItem);
  const toggleChecklistItem = useTripStore(state => state.toggleChecklistItem);
  const addExpenseItem = useTripStore(state => state.addExpenseItem);
  const getNetBalances = useTripStore(state => state.getNetBalances);

  // 대시보드 위젯에서 진입할 때 탭을 설정할 수 있도록 처리
  const initialSubTab = route?.params?.initialTab || 'checklist';
  const [subTab, setSubTab] = useState(initialSubTab);

  // 상태 감지하여 탭 업데이트
  useEffect(() => {
    if (route?.params?.initialTab) {
      setSubTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  // 준비물 폼 상태
  const [checkText, setCheckText] = useState('');
  const [checkAssigned, setCheckAssigned] = useState('');
  const [checkCat, setCheckCat] = useState('shared');

  // 지출 폼 상태
  const [expDesc, setExpDesc] = useState('');
  const [expAmt, setExpAmt] = useState('');
  const [expPayer, setExpPayer] = useState('');
  const [expCat, setExpCat] = useState('식비');

  const currentTrip = trips.find(t => t.id === activeTripId);
  if (!currentTrip) return null;

  const tripMembers = users.filter(u => currentTrip.participants.includes(u.uid));

  // 초기 콤보박스 선택자 세팅
  useEffect(() => {
    if (tripMembers.length > 0) {
      setCheckAssigned(tripMembers[0].uid);
      setExpPayer(tripMembers[0].uid);
    }
  }, [currentTrip.participants.length]);

  // --- 준비물 데이터 계산 ---
  const tripChecklist = checklist[activeTripId] || [];
  const completedCount = tripChecklist.filter(c => c.completed).length;
  const progressPercent = tripChecklist.length === 0 ? 0 : Math.round((completedCount / tripChecklist.length) * 100);

  // --- 가계부 데이터 계산 ---
  const tripExpenses = expenses[activeTripId] || [];
  const totalExpense = tripExpenses.reduce((sum, e) => sum + e.amount, 0);
  const shareAmount = tripMembers.length === 0 ? 0 : Math.round(totalExpense / tripMembers.length);
  const netBalances = getNetBalances(activeTripId);

  const handleAddChecklist = () => {
    if (!checkText.trim()) {
      Alert.alert('오류', '준비물 명칭을 입력해주세요.');
      return;
    }
    addChecklistItem(activeTripId, checkText.trim(), checkAssigned, checkCat);
    Alert.alert('성공', '📋 새로운 준비물이 공동 체크리스트에 추가되었습니다.');
    setCheckText('');
  };

  const handleAddExpense = () => {
    if (!expDesc.trim() || !expAmt) {
      Alert.alert('오류', '지출 내역과 금액을 입력해주세요.');
      return;
    }
    addExpenseItem(activeTripId, expDesc.trim(), expAmt, expPayer, expCat);
    Alert.alert('성공', `💸 공용 경비에 ${parseInt(expAmt).toLocaleString()}원이 등록되었습니다.`);
    setExpDesc('');
    setExpAmt('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sub-tab Switches */}
      <View style={styles.tabContainer}>
        <View style={styles.tabsWrapper}>
          <TouchableOpacity
            style={[styles.tab, subTab === 'checklist' && styles.activeTab]}
            onPress={() => setSubTab('checklist')}
          >
            <Ionicons name="list-sharp" size={14} color={subTab === 'checklist' ? theme.colors.card : theme.colors.textMuted} />
            <Text style={[styles.tabText, subTab === 'checklist' && styles.activeTabText]}>준비물</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, subTab === 'expenses' && styles.activeTab]}
            onPress={() => setSubTab('expenses')}
          >
            <Ionicons name="calculator-outline" size={14} color={subTab === 'expenses' ? theme.colors.card : theme.colors.textMuted} />
            <Text style={[styles.tabText, subTab === 'expenses' && styles.activeTabText]}>공용 가계부</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ===================== 준비물 탭 콘텐츠 ===================== */}
        {subTab === 'checklist' && (
          <View style={styles.section}>
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>공동 준비물 달성도</Text>
                <Text style={styles.progressVal}>{completedCount} / {tripChecklist.length} 개 ({progressPercent}%)</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
            </View>

            {/* 체크리스트 목록 */}
            <View style={styles.checkList}>
              {tripChecklist.length === 0 ? (
                <Text style={styles.emptyText}>등록된 준비물이 존재하지 않습니다.</Text>
              ) : (
                tripChecklist.map(item => {
                  const assignedUser = users.find(u => u.uid === item.assignedTo) || { name: '알 수 없음', avatar: '' };
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.checkCard, item.completed && styles.checkCardCompleted]}
                      onPress={() => toggleChecklistItem(activeTripId, item.id)}
                    >
                      <View style={styles.checkLeft}>
                        <View style={[styles.checkBox, item.completed && styles.checkBoxChecked]}>
                          {item.completed && <Ionicons name="checkmark" size={12} color={theme.colors.card} />}
                        </View>
                        <View>
                          <Text style={[styles.checkText, item.completed && styles.checkTextCompleted]}>
                            {item.text}
                          </Text>
                          <View style={[styles.catBadge, item.category === 'shared' ? styles.badgeShared : styles.badgePersonal]}>
                            <Text style={[styles.catBadgeText, item.category === 'shared' ? styles.textShared : styles.textPersonal]}>
                              {item.category === 'shared' ? '공동' : '개인'}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.checkRight}>
                        <Text style={styles.assignedName}>{assignedUser.name.split(' ')[0]} 담당</Text>
                        <Image source={{ uri: assignedUser.avatar }} style={styles.assignedAvatar} />
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            {/* 준비물 등록 폼 */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                <Ionicons name="add-circle" size={14} color={theme.colors.primary} /> 새 준비물 등록 및 담당 지정
              </Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>준비물 명칭</Text>
                <TextInput
                  style={styles.input}
                  placeholder="예: 멀티탭, 비상약 등"
                  value={checkText}
                  onChangeText={setCheckText}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flexHalf]}>
                  <Text style={styles.inputLabel}>담당 지정</Text>
                  <View style={styles.selectWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSelect}>
                      {tripMembers.map(m => (
                        <TouchableOpacity
                          key={m.uid}
                          style={[styles.selectChip, checkAssigned === m.uid && styles.activeSelectChip]}
                          onPress={() => setCheckAssigned(m.uid)}
                        >
                          <Text style={[styles.selectChipText, checkAssigned === m.uid && styles.activeSelectChipText]}>
                            {m.name.split(' ')[0]}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <View style={[styles.inputGroup, styles.flexHalf, { marginLeft: 12 }]}>
                  <Text style={styles.inputLabel}>분류</Text>
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={[styles.catBtn, checkCat === 'shared' && styles.activeCatBtn]}
                      onPress={() => setCheckCat('shared')}
                    >
                      <Text style={[styles.catBtnText, checkCat === 'shared' && styles.activeCatBtnText]}>공동</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.catBtn, checkCat === 'personal' && styles.activeCatBtn, { marginLeft: 4 }]}
                      onPress={() => setCheckCat('personal')}
                    >
                      <Text style={[styles.catBtnText, checkCat === 'personal' && styles.activeCatBtnText]}>개인</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddChecklist}>
                <Text style={styles.submitBtnText}>체크리스트에 등록하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ===================== 공용 가계부 탭 콘텐츠 ===================== */}
        {subTab === 'expenses' && (
          <View style={styles.section}>
            {/* 정산 계산서 요약 카드 */}
            <View style={styles.expenseSummaryCard}>
              <Text style={styles.expenseSummarySubtitle}>정산 계산서 (1/N)</Text>
              <View style={styles.expenseTotalRow}>
                <Text style={styles.expenseTotalLabel}>총 지출 경비</Text>
                <Text style={styles.expenseTotalVal}>{totalExpense.toLocaleString()}원</Text>
              </View>
              <View style={styles.expenseSummaryDivider} />
              <View style={styles.expenseSummaryFooter}>
                <Text style={styles.expenseSummaryMuted}>참가 인원: {tripMembers.length}명</Text>
                <Text style={styles.expenseSummaryHighlight}>1인당 분담액: {shareAmount.toLocaleString()}원</Text>
              </View>
            </View>

            {/* 멤버별 1/N 정산 밸런스 결과 */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceHeader}>가족 구성원별 상계 정산 현황</Text>
              <View style={styles.balanceList}>
                {netBalances.map(item => (
                  <View key={item.uid} style={styles.balanceItem}>
                    <View style={styles.userInfo}>
                      <Image source={{ uri: item.avatar }} style={styles.balanceAvatar} />
                      <View>
                        <Text style={styles.balanceName}>{item.name}</Text>
                        <Text style={styles.balancePaid}>총 선결제: {item.paid.toLocaleString()}원</Text>
                      </View>
                    </View>
                    <View style={[styles.balanceBadge, item.net >= 0 ? styles.badgeReceive : styles.badgeSend]}>
                      <Text style={[styles.balanceBadgeText, item.net >= 0 ? styles.textReceive : styles.textSend]}>
                        {item.net >= 0 
                          ? `+${item.net.toLocaleString()}원 받기` 
                          : `${Math.abs(item.net).toLocaleString()}원 보낼 돈`}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* 지출 리스트 */}
            <View style={styles.ledgerCard}>
              <Text style={styles.ledgerHeader}>세부 지출 기록</Text>
              <View style={styles.ledgerList}>
                {tripExpenses.length === 0 ? (
                  <Text style={styles.emptyText}>등록된 지출 내역이 없습니다.</Text>
                ) : (
                  tripExpenses.map(item => {
                    const payerUser = users.find(u => u.uid === item.payer) || { name: '알 수 없음' };
                    return (
                      <View key={item.id} style={styles.ledgerItem}>
                        <View>
                          <Text style={styles.ledgerDesc} numberOfLines={1}>{item.desc}</Text>
                          <Text style={styles.ledgerMeta}>
                            {item.category} | {payerUser.name.split(' ')[0]} 선결제
                          </Text>
                        </View>
                        <Text style={styles.ledgerAmount}>{item.amount.toLocaleString()}원</Text>
                      </View>
                    );
                  })
                )}
              </View>
            </View>

            {/* 지출 등록 폼 */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                <Ionicons name="card" size={14} color={theme.colors.primary} /> 여행 경비 / 지출 등록
              </Text>
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flexHalf]}>
                  <Text style={styles.inputLabel}>지출 내역</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="예: 맛집 저녁 식사"
                    value={expDesc}
                    onChangeText={setExpDesc}
                  />
                </View>
                <View style={[styles.inputGroup, styles.flexHalf, { marginLeft: 12 }]}>
                  <Text style={styles.inputLabel}>금액(원)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="예: 75000"
                    keyboardType="numeric"
                    value={expAmt}
                    onChangeText={setExpAmt}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flexHalf]}>
                  <Text style={styles.inputLabel}>결제 주체</Text>
                  <View style={styles.selectWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSelect}>
                      {tripMembers.map(m => (
                        <TouchableOpacity
                          key={m.uid}
                          style={[styles.selectChip, expPayer === m.uid && styles.activeSelectChip]}
                          onPress={() => setExpPayer(m.uid)}
                        >
                          <Text style={[styles.selectChipText, expPayer === m.uid && styles.activeSelectChipText]}>
                            {m.name.split(' ')[0]}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <View style={[styles.inputGroup, styles.flexHalf, { marginLeft: 12 }]}>
                  <Text style={styles.inputLabel}>카테고리</Text>
                  <View style={styles.selectWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSelect}>
                      {['식비', '숙박', '항공/교통', '관광/체험'].map(cat => (
                        <TouchableOpacity
                          key={cat}
                          style={[styles.selectChip, expCat === cat && styles.activeSelectChip]}
                          onPress={() => setExpCat(cat)}
                        >
                          <Text style={[styles.selectChipText, expCat === cat && styles.activeSelectChipText]}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddExpense}>
                <Text style={styles.submitBtnText}>공동 가계부에 지출 반영하기</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContainer: {
    backgroundColor: theme.colors.card,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 3,
    borderRadius: 14,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  tabText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: theme.colors.card,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    gap: 16,
  },
  progressSection: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    ...theme.shadows.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
  },
  progressVal: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: 3,
  },
  checkList: {
    gap: 8,
  },
  emptyText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  checkCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    ...theme.shadows.sm,
  },
  checkCardCompleted: {
    backgroundColor: '#f0fdf4', // Light success green background
    borderColor: '#bbf7d0',
  },
  checkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
  },
  checkBoxChecked: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success,
  },
  checkText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    maxWidth: 200,
  },
  checkTextCompleted: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  catBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    marginTop: 3,
  },
  badgeShared: {
    backgroundColor: theme.colors.secondaryLight,
  },
  badgePersonal: {
    backgroundColor: theme.colors.warningLight,
  },
  catBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  textShared: {
    color: theme.colors.secondary,
  },
  textPersonal: {
    color: theme.colors.warning,
  },
  checkRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assignedName: {
    fontSize: 9,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  assignedAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  formCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    ...theme.shadows.md,
  },
  formTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8,
    marginBottom: 12,
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
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 11,
    color: theme.colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexHalf: {
    flex: 1,
  },
  selectWrapper: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingVertical: 4,
  },
  horizontalSelect: {
    paddingHorizontal: 6,
    gap: 6,
    alignItems: 'center',
  },
  selectChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeSelectChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  selectChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  activeSelectChipText: {
    color: theme.colors.card,
  },
  catBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  activeCatBtn: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  catBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  activeCatBtnText: {
    color: theme.colors.card,
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
    fontSize: 11,
    fontWeight: 'bold',
  },
  expenseSummaryCard: {
    backgroundColor: theme.colors.dark,
    padding: 14,
    borderRadius: 16,
    ...theme.shadows.md,
  },
  expenseSummarySubtitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#38bdf8', // Light sky blue
    textTransform: 'uppercase',
  },
  expenseTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 4,
  },
  expenseTotalLabel: {
    fontSize: 13,
    color: '#cbd5e1',
  },
  expenseTotalVal: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.card,
  },
  expenseSummaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 10,
  },
  expenseSummaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseSummaryMuted: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  expenseSummaryHighlight: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.card,
  },
  balanceCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    ...theme.shadows.sm,
  },
  balanceHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8,
    marginBottom: 10,
  },
  balanceList: {
    gap: 8,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  balanceName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  balancePaid: {
    fontSize: 8,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  balanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeReceive: {
    backgroundColor: theme.colors.successLight,
  },
  badgeSend: {
    backgroundColor: theme.colors.dangerLight,
  },
  balanceBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  textReceive: {
    color: theme.colors.success,
  },
  textSend: {
    color: theme.colors.danger,
  },
  ledgerCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    ...theme.shadows.sm,
  },
  ledgerHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8,
    marginBottom: 10,
  },
  ledgerList: {
    gap: 6,
    maxHeight: 120,
    overflow: 'scroll',
  },
  ledgerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ledgerDesc: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
    maxWidth: 160,
  },
  ledgerMeta: {
    fontSize: 8,
    color: theme.colors.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },
  ledgerAmount: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.colors.text,
  },
});
