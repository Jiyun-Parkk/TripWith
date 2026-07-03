import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert, SafeAreaView, ScrollView, Linking } from 'react-native';
import { useTripStore } from '../../store/useTripStore';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function TimelineScreen() {
  const activeTripId = useTripStore(state => state.activeTripId);
  const users = useTripStore(state => state.users);
  const currentUser = useTripStore(state => state.currentUser);
  const timeline = useTripStore(state => state.timeline);
  const timelineComments = useTripStore(state => state.timelineComments);
  const addTimelineItem = useTripStore(state => state.addTimelineItem);
  const deleteTimelineItem = useTripStore(state => state.deleteTimelineItem);
  const addComment = useTripStore(state => state.addComment);

  const [activeDay, setActiveDay] = useState(1);
  const [expandedItemId, setExpandedItemId] = useState(null); // 댓글창 열기/닫기용
  
  // 일정 등록 폼 상태
  const [time, setTime] = useState('12:00');
  const [type, setType] = useState('sightseeing');
  const [naverLink, setNaverLink] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  // 댓글 입력 상태
  const [commentText, setCommentText] = useState({});

  const tripTimeline = timeline[activeTripId] || [];
  const filteredTimeline = tripTimeline.filter(item => item.day === activeDay);

  // 이동 수단/시간 Mock 데이터 생성 헬퍼
  const getTravelTime = (idx) => {
    const times = [
      '🚗 차량 이동 24분 (16.5km)',
      '🚗 차량 이동 12분 (7.2km)',
      '🚗 차량 이동 35분 (28.1km)',
      '🚌 버스 202번 48분',
      '🚗 차량 이동 18분 (11.2km)'
    ];
    return times[idx % times.length];
  };

  // 네이버 지도 링크 입력 시 자동 완성 시뮬레이션
  const handleNaverLinkChange = (val) => {
    setNaverLink(val);
    if (val.includes('naver.me') || val.includes('map.naver')) {
      setName('📍 애월 한담해안산책로 (네이버 지도 연동됨)');
      setAddress('제주 제주시 애월읍 애월리 2540');
      setType('sightseeing');
      Alert.alert('연동 성공', '🔍 네이버 지도 주소 및 도로명 정보를 완벽하게 실시간 파싱해 왔습니다!');
    }
  };

  const handleCreateTimeline = () => {
    if (!name.trim()) {
      Alert.alert('오류', '장소명을 입력해주세요.');
      return;
    }
    addTimelineItem(activeTripId, activeDay, time, type, name, address, naverLink);
    Alert.alert('성공', '🎉 새로운 일정을 타임라인에 등록했습니다!');
    setName('');
    setAddress('');
    setNaverLink('');
    setTime('12:00');
  };

  const handleDeleteItem = (itemId) => {
    Alert.alert(
      '일정 삭제',
      '이 일정을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => deleteTimelineItem(activeTripId, itemId) }
      ]
    );
  };

  const handleOpenLink = (link) => {
    if (link) {
      Linking.openURL(link).catch(() => {
        Alert.alert('오류', '링크를 열 수 없습니다.');
      });
    }
  };

  const handleSendComment = (itemId) => {
    const txt = commentText[itemId];
    if (!txt || !txt.trim()) return;

    addComment(itemId, txt);
    setCommentText(prev => ({ ...prev, [itemId]: '' }));
    Alert.alert('피드백 등록', '💬 일정에 소중한 피드백이 등록되었습니다.');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'flight': return 'airplane-sharp';
      case 'food': return 'restaurant';
      case 'cafe': return 'cafe';
      default: return 'trail-sign';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 일차 탭 전환 */}
        <View style={styles.dayTabs}>
          {[1, 2, 3].map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.dayTab, activeDay === d && styles.activeDayTab]}
              onPress={() => setActiveDay(d)}
            >
              <Text style={[styles.dayTabText, activeDay === d && styles.activeDayTabText]}>Day {d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 타임라인 노드 리스트 */}
        <View style={styles.timelineContainer}>
          {filteredTimeline.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>등록된 일정이 없습니다.{'\n'}아래 폼에서 새 일정을 추가해보세요!</Text>
            </View>
          ) : (
            filteredTimeline.map((item, index) => {
              const creator = users.find(u => u.uid === item.creator) || { name: '알 수 없음', avatar: '' };
              const comments = timelineComments[item.id] || [];
              const isExpanded = expandedItemId === item.id;

              return (
                <View key={item.id} style={styles.timelineNodeWrapper}>
                  
                  {/* 일정 카드 메인 */}
                  <View style={styles.nodeCard}>
                    <View style={styles.nodeHeader}>
                      <View style={styles.nodeHeaderLeft}>
                        <View style={styles.timeBadge}>
                          <Text style={styles.timeText}>{item.time}</Text>
                        </View>
                        <View style={styles.typeIconBox}>
                          <Ionicons name={getTypeIcon(item.type)} size={14} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.nodeName} numberOfLines={1}>{item.name}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
                        <Ionicons name="trash-outline" size={16} color={theme.colors.textMuted} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.nodeBody}>
                      <Text style={styles.nodeAddress}>{item.address}</Text>
                      <View style={styles.nodeFooter}>
                        <View style={styles.creatorInfo}>
                          <Image source={{ uri: creator.avatar }} style={styles.creatorAvatar} />
                          <Text style={styles.creatorName}>{creator.name.split(' ')[0]} 제안</Text>
                        </View>
                        <View style={styles.actionIcons}>
                          {item.link && (
                            <TouchableOpacity onPress={() => handleOpenLink(item.link)} style={styles.linkIconBtn}>
                              <Ionicons name="map-outline" size={14} color={theme.colors.primary} />
                              <Text style={styles.linkIconText}>네이버지도</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity 
                            style={styles.commentToggle} 
                            onPress={() => setExpandedItemId(isExpanded ? null : item.id)}
                          >
                            <Ionicons name="chatbubble-ellipses-outline" size={14} color={theme.colors.textMuted} />
                            <Text style={styles.commentCountText}>{comments.length}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {/* 아코디언 댓글창 */}
                    {isExpanded && (
                      <View style={styles.commentSection}>
                        <View style={styles.commentsList}>
                          {comments.length === 0 ? (
                            <Text style={styles.noCommentsText}>댓글이 없습니다. 첫 의견을 남겨보세요!</Text>
                          ) : (
                            comments.map(c => (
                              <View key={c.id} style={styles.commentItem}>
                                <Image source={{ uri: c.avatar }} style={styles.commentAvatar} />
                                <View style={styles.commentContent}>
                                  <View style={styles.commentInfo}>
                                    <Text style={styles.commentUser}>{c.userName}</Text>
                                    <Text style={styles.commentTime}>{c.timestamp}</Text>
                                  </View>
                                  <Text style={styles.commentText}>{c.text}</Text>
                                </View>
                              </View>
                            ))
                          )}
                        </View>
                        <View style={styles.commentInputRow}>
                          <TextInput
                            style={styles.commentInput}
                            placeholder="의견을 남기세요..."
                            value={commentText[item.id] || ''}
                            onChangeText={(txt) => setCommentText(prev => ({ ...prev, [item.id]: txt }))}
                          />
                          <TouchableOpacity style={styles.commentSendBtn} onPress={() => handleSendComment(item.id)}>
                            <Text style={styles.commentSendBtnText}>등록</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* 일정 간 소요 시간 및 차량 구분선 */}
                  {index < filteredTimeline.length - 1 && (
                    <View style={styles.travelTimeIndicator}>
                      <View style={styles.dashedLine} />
                      <View style={styles.travelBadge}>
                        <Ionicons name="car" size={12} color={theme.colors.primary} />
                        <Text style={styles.travelText}>{getTravelTime(index)}</Text>
                      </View>
                      <View style={styles.dashedLine} />
                    </View>
                  )}

                </View>
              );
            })
          )}
        </View>

        {/* 새 일정 등록 폼 */}
        <View style={styles.addForm}>
          <Text style={styles.formSectionTitle}>
            <Ionicons name="add-circle" size={16} color={theme.colors.primary} /> 새 일정 등록 및 네이버 지도 연동
          </Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flexThird]}>
              <Text style={styles.inputLabel}>방문 시간</Text>
              <TextInput
                style={styles.input}
                value={time}
                onChangeText={setTime}
                placeholder="12:00"
              />
            </View>
            <View style={[styles.inputGroup, styles.flexTwoThird, { marginLeft: 12 }]}>
              <Text style={styles.inputLabel}>장소 구분</Text>
              <View style={styles.typeSelectorRow}>
                {['sightseeing', 'food', 'cafe', 'flight'].map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, type === t && styles.activeTypeBtn]}
                    onPress={() => setType(t)}
                  >
                    <Ionicons 
                      name={getTypeIcon(t)} 
                      size={12} 
                      color={type === t ? theme.colors.card : theme.colors.textMuted} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>네이버 지도 링크 붙여넣기 (체험)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://naver.me/... 입력 시 자동 정보 로드"
              value={naverLink}
              onChangeText={handleNaverLinkChange}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flexHalf]}>
              <Text style={styles.inputLabel}>장소명</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 협재 해수욕장"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={[styles.inputGroup, styles.flexHalf, { marginLeft: 12 }]}>
              <Text style={styles.inputLabel}>도로명 주소</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 한림읍 협재리 24"
                value={address}
                onChangeText={setAddress}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleCreateTimeline}>
            <Text style={styles.submitBtnText}>Day {activeDay} 타임라인 일정으로 등록하기</Text>
          </TouchableOpacity>
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
  dayTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.border,
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  dayTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeDayTab: {
    backgroundColor: theme.colors.card,
    ...theme.shadows.sm,
  },
  dayTabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
  },
  activeDayTabText: {
    color: theme.colors.primary,
  },
  timelineContainer: {
    marginBottom: 20,
  },
  emptyContainer: {
    backgroundColor: theme.colors.card,
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  timelineNodeWrapper: {
    marginBottom: 4,
  },
  nodeCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    ...theme.shadows.sm,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nodeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  timeBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timeText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  typeIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  nodeName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  nodeBody: {
    paddingLeft: 4,
  },
  nodeAddress: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  nodeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  creatorAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  creatorName: {
    fontSize: 9,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  linkIconText: {
    fontSize: 9,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  commentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentCountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
  },
  travelTimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 0.5,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    opacity: 0.4,
  },
  travelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginHorizontal: 10,
    gap: 4,
  },
  travelText: {
    fontSize: 9,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
  },
  commentSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  commentsList: {
    gap: 8,
    marginBottom: 10,
    maxHeight: 120,
    overflow: 'scroll',
  },
  noCommentsText: {
    fontSize: 9,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: 6,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 2,
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 6,
    borderRadius: 8,
  },
  commentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentUser: {
    fontSize: 9,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  commentTime: {
    fontSize: 7,
    color: theme.colors.textMuted,
  },
  commentText: {
    fontSize: 10,
    color: '#334155',
    marginTop: 2,
  },
  commentInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 10,
  },
  commentSendBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  commentSendBtnText: {
    color: theme.colors.card,
    fontSize: 10,
    fontWeight: 'bold',
  },
  addForm: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    ...theme.shadows.md,
  },
  formSectionTitle: {
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
  flexThird: {
    flex: 1,
  },
  flexTwoThird: {
    flex: 2,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeTypeBtn: {
    backgroundColor: theme.colors.primary,
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
});
