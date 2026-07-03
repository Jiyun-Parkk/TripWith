import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTripStore } from '../../store/useTripStore';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function MyPageGlobalScreen() {
  const currentUser = useTripStore(state => state.currentUser);
  const updateProfile = useTripStore(state => state.updateProfile);
  const logout = useTripStore(state => state.logout);

  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  const handleUpdate = () => {
    if (!name.trim()) {
      Alert.alert('오류', '닉네임을 입력해주세요.');
      return;
    }
    updateProfile(name, bio);
    Alert.alert('성공', '프로필 정보가 저장되었습니다!');
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '로그아웃', style: 'destructive', onPress: () => logout() }
      ]
    );
  };

  if (!currentUser) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* 프로필 요약 카드 */}
          <View style={styles.profileCard}>
            <View style={styles.cardHeader}>
              <View style={styles.userInfo}>
                <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
                <View>
                  <View style={styles.nameRow}>
                    <Text style={styles.nameText}>{currentUser.name}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>나</Text>
                    </View>
                  </View>
                  <Text style={styles.emailText}>{currentUser.email}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutBtnText}>로그아웃</Text>
                <Ionicons name="log-out-outline" size={14} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>
            <View style={styles.bioContainer}>
              <Text style={styles.bioText}>"{currentUser.bio}"</Text>
            </View>
          </View>

          {/* 프로필 정보 수정 폼 */}
          <View style={styles.editSection}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="settings" size={16} color={theme.colors.primary} /> 프로필 정보 수정
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>나의 명칭/닉네임</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="닉네임을 입력하세요"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>상태 메모</Text>
              <TextInput
                style={styles.input}
                value={bio}
                onChangeText={setBio}
                placeholder="상태 소개글을 입력하세요"
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
              <Text style={styles.saveBtnText}>프로필 카드 업데이트</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 20,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  badge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  emailText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.dangerLight,
    borderWidth: 1,
    borderColor: '#fecaca', // Red-200
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  logoutBtnText: {
    fontSize: 9,
    color: theme.colors.danger,
    fontWeight: 'bold',
  },
  bioContainer: {
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  bioText: {
    fontSize: 11,
    color: theme.colors.text,
    fontWeight: '500',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  editSection: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
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
  inputGroup: {
    marginBottom: 12,
  },
  label: {
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
  saveBtn: {
    backgroundColor: theme.colors.dark,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: theme.colors.card,
    fontSize: 11,
    fontWeight: 'bold',
  },
});
