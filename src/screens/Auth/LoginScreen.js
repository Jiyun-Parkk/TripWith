import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTripStore } from '../../store/useTripStore';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('friend@famtrip.com');
  const [password, setPassword] = useState('123456');
  const login = useTripStore(state => state.login);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    const result = login(email, password);
    if (result.success) {
      // Zustand 스토어의 currentUser가 업데이트되므로 AppNavigator가 자동으로 메인 화면으로 리라우팅합니다.
    } else {
      Alert.alert('로그인 실패', '이메일 또는 비밀번호를 확인해주세요.');
    }
  };

  const handleDemoLogin = () => {
    login('friend@famtrip.com', '123456');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <View style={styles.logoBadge}>
              <Ionicons name="paper-plane" size={32} color={theme.colors.card} />
            </View>
            <Text style={styles.logoText}>TripWith</Text>
            <Text style={styles.subtitle}>우정 여행 일정 계획 및 메신저 연동 플랫폼</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>이메일 주소</Text>
              <TextInput
                style={styles.input}
                placeholder="friend@famtrip.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>로그인하기</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.demoButton} onPress={handleDemoLogin}>
              <Ionicons name="flash" size={16} color={theme.colors.secondary} />
              <Text style={styles.demoButtonText}>테스트 데모 계정으로 바로 통과</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerText}>
                계정이 아직 없으신가요? <Text style={styles.signUpHighlight}>간편 가입</Text>
              </Text>
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
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoBadge: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 24,
    ...theme.shadows.md,
  },
  logoText: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: '900',
    fontSize: 32,
    color: theme.colors.primary,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  formContainer: {
    marginTop: 40,
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: theme.colors.text,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    ...theme.shadows.sm,
  },
  loginButtonText: {
    color: theme.colors.card,
    fontSize: 14,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  demoButton: {
    flexDirection: 'row',
    backgroundColor: '#eef2ff', // Indigo-50
    borderWidth: 1,
    borderColor: '#c7d2fe', // Indigo-200
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  demoButtonText: {
    color: theme.colors.secondary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  signUpHighlight: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});
