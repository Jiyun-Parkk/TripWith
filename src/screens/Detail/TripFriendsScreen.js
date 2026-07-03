import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useTripStore } from '../../store/useTripStore';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function TripFriendsScreen() {
  const activeTripId = useTripStore(state => state.activeTripId);
  const trips = useTripStore(state => state.trips);
  const users = useTripStore(state => state.users);
  const currentUser = useTripStore(state => state.currentUser);
  const friendships = useTripStore(state => state.friendships);
  const friendRequests = useTripStore(state => state.friendRequests);
  const inviteFriendToTrip = useTripStore(state => state.inviteFriendToTrip);
  const sendFriendRequest = useTripStore(state => state.sendFriendRequest);
  const acceptFriendRequest = useTripStore(state => state.acceptFriendRequest);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const currentTrip = trips.find(t => t.id === activeTripId);
  if (!currentTrip) return null;

  // 내 글로벌 친구 목록 필터링
  const myFriends = users.filter(u => {
    if (u.uid === currentUser.uid) return false;
    return friendships.some(f => 
      (f.u1 === currentUser.uid && f.u2 === u.uid) || 
      (f.u2 === currentUser.uid && f.u1 === u.uid)
    );
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('알림', '검색어를 입력해주세요.');
      return;
    }
    const query = searchQuery.toLowerCase().trim();
    const results = users.filter(u => 
      u.uid !== currentUser.uid && 
      (u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
    );
    setSearchResults(results);
    setHasSearched(true);
  };

  const handleInviteToggle = (friend) => {
    inviteFriendToTrip(activeTripId, friend.uid);
    const isNowInvited = !currentTrip.participants.includes(friend.uid);
    if (isNowInvited) {
      Alert.alert('초대 완료', `${friend.name}님이 이번 여행의 공동 기획자로 추가되었습니다.`);
    } else {
      Alert.alert('제외 완료', `${friend.name}님이 기획자 명단에서 제외되었습니다.`);
    }
  };

  const handleSendRequest = (targetUser) => {
    const res = sendFriendRequest(targetUser.uid);
    if (res.success) {
      Alert.alert('신청 완료', `${targetUser.name}님께 친구 신청을 보냈습니다.`);
    } else {
      Alert.alert('알림', res.message);
    }
    handleSearch();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 현재 여행 참가자 리스트 관리 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={18} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>나의 우정 친구 초대하기 ({myFriends.length}명)</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            내 친구 목록 중 이번 여행의 공동 기획 및 정산에 참여할 멤버를 선택하세요.
          </Text>

          <View style={styles.friendsList}>
            {myFriends.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  아직 친구가 없습니다.{'\n'}아래 검색창에서 친구를 찾아 먼저 추가해주세요!
                </Text>
              </View>
            ) : (
              myFriends.map(friend => {
                const isAdded = currentTrip.participants.includes(friend.uid);
                return (
                  <View key={friend.uid} style={styles.friendCard}>
                    <View style={styles.userInfo}>
                      <Image source={{ uri: friend.avatar }} style={styles.avatar} />
                      <View>
                        <Text style={styles.friendName}>{friend.name}</Text>
                        <Text style={styles.friendEmail}>{friend.email}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.inviteToggleBtn, isAdded ? styles.btnAdded : styles.btnNotAdded]}
                      onPress={() => handleInviteToggle(friend)}
                    >
                      <Text style={[styles.inviteToggleBtnText, isAdded ? styles.textAdded : styles.textNotAdded]}>
                        {isAdded ? '초대됨 ✓' : '여행 초대'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* 신규 친구 찾기 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-add" size={16} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>새로운 여행 친구 찾기</Text>
          </View>

          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="이름 또는 이메일 검색 (지원, 성민 등)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Text style={styles.searchBtnText}>검색</Text>
            </TouchableOpacity>
          </View>

          {hasSearched && (
            <View style={styles.searchResults}>
              {searchResults.length === 0 ? (
                <Text style={styles.noResultsText}>검색 결과가 없습니다.</Text>
              ) : (
                searchResults.map(item => {
                  const isFriend = friendships.some(f => 
                    (f.u1 === currentUser.uid && f.u2 === item.uid) || 
                    (f.u2 === currentUser.uid && f.u1 === item.uid)
                  );
                  const sentReq = friendRequests.find(r => r.senderId === currentUser.uid && r.receiverId === item.uid && r.status === 'pending');
                  const recvReq = friendRequests.find(r => r.senderId === item.uid && r.receiverId === currentUser.uid && r.status === 'pending');

                  return (
                    <View key={item.uid} style={styles.searchResultItem}>
                      <View style={styles.userInfo}>
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                        <View>
                          <Text style={styles.friendName}>{item.name}</Text>
                          <Text style={styles.friendEmail}>{item.email}</Text>
                        </View>
                      </View>
                      <View>
                        {isFriend ? (
                          <View style={styles.statusBadge}>
                            <Text style={styles.statusBadgeText}>친구 ✓</Text>
                          </View>
                        ) : sentReq ? (
                          <View style={[styles.statusBadge, styles.badgePending]}>
                            <Text style={[styles.statusBadgeText, styles.textPending]}>대기중</Text>
                          </View>
                        ) : recvReq ? (
                          <TouchableOpacity
                            style={styles.acceptBtn}
                            onPress={() => acceptFriendRequest(recvReq.id)}
                          >
                            <Text style={styles.acceptBtnText}>수락</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={styles.requestBtn}
                            onPress={() => handleSendRequest(item)}
                          >
                            <Text style={styles.requestBtnText}>친구신청</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
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
    gap: 20,
  },
  section: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    ...theme.shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: 9,
    color: theme.colors.textMuted,
    marginTop: 6,
    lineHeight: 14,
    fontWeight: '600',
  },
  friendsList: {
    marginTop: 12,
    gap: 8,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  friendName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  friendEmail: {
    fontSize: 9,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  inviteToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnAdded: {
    backgroundColor: theme.colors.successLight,
    borderColor: '#a7f3d0', // Emerald-200
  },
  btnNotAdded: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: '#bae6fd', // Sky-200
  },
  inviteToggleBtnText: {
    fontSize: 9,
    fontWeight: '900',
  },
  textAdded: {
    color: theme.colors.success,
  },
  textNotAdded: {
    color: theme.colors.primary,
  },
  searchBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: theme.colors.text,
  },
  searchBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    color: theme.colors.card,
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchResults: {
    marginTop: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 10,
  },
  noResultsText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: 10,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusBadge: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
  },
  badgePending: {
    backgroundColor: theme.colors.warningLight,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  textPending: {
    color: theme.colors.warning,
  },
  acceptBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  acceptBtnText: {
    color: theme.colors.card,
    fontSize: 9,
    fontWeight: 'bold',
  },
  requestBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  requestBtnText: {
    color: theme.colors.card,
    fontSize: 9,
    fontWeight: 'bold',
  },
});
