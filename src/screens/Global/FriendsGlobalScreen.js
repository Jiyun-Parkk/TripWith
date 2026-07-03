import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useTripStore } from '../../store/useTripStore';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function FriendsGlobalScreen() {
  const currentUser = useTripStore(state => state.currentUser);
  const users = useTripStore(state => state.users);
  const friendships = useTripStore(state => state.friendships);
  const friendRequests = useTripStore(state => state.friendRequests);
  const sendFriendRequest = useTripStore(state => state.sendFriendRequest);
  const acceptFriendRequest = useTripStore(state => state.acceptFriendRequest);
  const rejectFriendRequest = useTripStore(state => state.rejectFriendRequest);
  const removeFriend = useTripStore(state => state.removeFriend);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // 내 친구 목록 필터링
  const myFriends = users.filter(u => {
    if (u.uid === currentUser.uid) return false;
    return friendships.some(f => 
      (f.u1 === currentUser.uid && f.u2 === u.uid) || 
      (f.u2 === currentUser.uid && f.u1 === u.uid)
    );
  });

  // 받은 친구 신청 필터링 (나에게 수신된 대기 상태 신청들)
  const incomingRequests = friendRequests.filter(r => r.receiverId === currentUser.uid && r.status === 'pending');

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

  const handleSendRequest = (targetUser) => {
    const res = sendFriendRequest(targetUser.uid);
    if (res.success) {
      Alert.alert('신청 완료', `${targetUser.name}님께 친구 신청을 보냈습니다.`);
    } else {
      Alert.alert('알림', res.message);
    }
    handleSearch(); // 상태 업데이트 후 재조회
  };

  const handleRemoveFriend = (friendUser) => {
    Alert.alert(
      '친구 해제',
      `${friendUser.name}님과 친구 관계를 해제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { text: '해제', style: 'destructive', onPress: () => removeFriend(friendUser.uid) }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 회원 조회 및 신청 영역 */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="search" size={16} color={theme.colors.primary} /> 가입 회원 조회 및 친구 신청
          </Text>
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

          {/* 검색 결과 표시 */}
          {hasSearched && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsHeader}>검색 결과</Text>
              {searchResults.length === 0 ? (
                <Text style={styles.noResultsText}>일치하는 가입된 사용자가 없습니다.</Text>
              ) : (
                searchResults.map(item => {
                  // 친구 여부
                  const isFriend = friendships.some(f => 
                    (f.u1 === currentUser.uid && f.u2 === item.uid) || 
                    (f.u2 === currentUser.uid && f.u1 === item.uid)
                  );
                  // 신청 발송 대기 여부
                  const sentReq = friendRequests.find(r => r.senderId === currentUser.uid && r.receiverId === item.uid && r.status === 'pending');
                  // 신청 수신 대기 여부
                  const recvReq = friendRequests.find(r => r.senderId === item.uid && r.receiverId === currentUser.uid && r.status === 'pending');

                  return (
                    <View key={item.uid} style={styles.resultItem}>
                      <View style={styles.userInfo}>
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                        <View>
                          <Text style={styles.userName}>{item.name}</Text>
                          <Text style={styles.userEmail}>{item.email}</Text>
                        </View>
                      </View>
                      <View>
                        {isFriend ? (
                          <View style={styles.statusBadge}>
                            <Text style={styles.statusBadgeText}>친구 ✓</Text>
                          </View>
                        ) : sentReq ? (
                          <View style={[styles.statusBadge, styles.badgePending]}>
                            <Text style={[styles.statusBadgeText, styles.textPending]}>신청대기</Text>
                          </View>
                        ) : recvReq ? (
                          <TouchableOpacity 
                            style={styles.acceptBtnInline} 
                            onPress={() => acceptFriendRequest(recvReq.id)}
                          >
                            <Text style={styles.acceptBtnInlineText}>수락</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity 
                            style={styles.requestBtn} 
                            onPress={() => handleSendRequest(item)}
                          >
                            <Text style={styles.requestBtnText}>친구 신청</Text>
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

        {/* 받은 친구 신청 */}
        {incomingRequests.length > 0 && (
          <View style={styles.requestSection}>
            <View style={styles.requestHeader}>
              <Ionicons name="notifications" size={16} color={theme.colors.secondary} />
              <Text style={styles.requestTitle}>받은 친구 신청 ({incomingRequests.length}건)</Text>
            </View>
            <View style={styles.requestList}>
              {incomingRequests.map(r => {
                const sender = users.find(u => u.uid === r.senderId);
                if (!sender) return null;
                return (
                  <View key={r.id} style={styles.requestItem}>
                    <View style={styles.userInfo}>
                      <Image source={{ uri: sender.avatar }} style={styles.avatar} />
                      <View>
                        <Text style={styles.userName}>{sender.name}</Text>
                        <Text style={styles.userEmail}>{sender.email}</Text>
                      </View>
                    </View>
                    <View style={styles.actionRow}>
                      <TouchableOpacity 
                        style={styles.acceptBtn} 
                        onPress={() => {
                          acceptFriendRequest(r.id);
                          Alert.alert('친구 추가', `${sender.name}님과 친구가 되었습니다.`);
                        }}
                      >
                        <Text style={styles.acceptBtnText}>수락</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.rejectBtn} 
                        onPress={() => rejectFriendRequest(r.id)}
                      >
                        <Text style={styles.rejectBtnText}>거절</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* 내 친구 목록 */}
        <View style={styles.friendsSection}>
          <View style={styles.friendsHeader}>
            <Ionicons name="people" size={18} color={theme.colors.primary} />
            <Text style={styles.friendsTitle}>나의 우정 친구 목록 ({myFriends.length}명)</Text>
          </View>

          {myFriends.length === 0 ? (
            <View style={styles.emptyFriendsContainer}>
              <Text style={styles.emptyFriendsText}>
                아직 등록된 친구가 없습니다.{'\n'}위 검색창에서 다른 회원을 찾아 친구 신청을 해보세요!
              </Text>
            </View>
          ) : (
            myFriends.map(friend => (
              <View key={friend.uid} style={styles.friendCard}>
                <View style={styles.userInfo}>
                  <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
                  <View>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <Text style={styles.friendEmail}>{friend.email}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleRemoveFriend(friend)} style={styles.deleteBtn}>
                  <Ionicons name="person-remove-outline" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))
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
  searchSection: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 20,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    gap: 8,
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
  resultsContainer: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 10,
  },
  resultsHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
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
  userName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  userEmail: {
    fontSize: 9,
    color: theme.colors.textMuted,
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
  acceptBtnInline: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  acceptBtnInlineText: {
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
  requestSection: {
    backgroundColor: '#f5f3ff', // Light purple
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    padding: 14,
    marginBottom: 20,
    ...theme.shadows.sm,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  requestTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5b21b6', // Dark purple
  },
  requestList: {
    gap: 8,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 4,
  },
  acceptBtn: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  acceptBtnText: {
    color: theme.colors.card,
    fontSize: 9,
    fontWeight: 'bold',
  },
  rejectBtn: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rejectBtnText: {
    color: theme.colors.textMuted,
    fontSize: 9,
    fontWeight: 'bold',
  },
  friendsSection: {
    gap: 8,
  },
  friendsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  friendsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  emptyFriendsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFriendsText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 8,
    ...theme.shadows.sm,
  },
  friendAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  deleteBtn: {
    padding: 8,
  },
});
