import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTripStore } from '../../store/useTripStore';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signup = useTripStore(state => state.signup);

  const handleSignup = () => {
    if (!name || !email || !password) {
      Alert.alert('오류', '모든 가입 정보를 빠짐없이 입력해주세요.');
      return;
    }
    const result = signup(name, email, password);
    if (result.success) {
      // Zustand 스토어의 currentUser가 가입과 동시에 로그인 상태로 전환되므로 라우터가 자동 갱신됩니다.
    } else {
      Alert.alert('오류', '가입 도중 문제가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <View style={styles.logoBadge}>
              <Ionicons name="person-add" size={32} color={theme.colors.card} />
            </View>
            <Text style={styles.logoText}>TripWith 가입</Text>
            <Text style={styles.subtitle}>친구들과 소통하는 고유 계정을 만드세요</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>사용할 이름 / 닉네임 (실명 권장)</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 수아, 찬민, 우성"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>이메일 주소</Text>
              <TextInput
                style={styles.input}
                placeholder="example@gmail.com"
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
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
              <Text style={styles.signupButtonText}>가입 및 즉시 로그인</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerText}>
                이미 계정이 있으신가요? <Text style={styles.loginHighlight}>로그인하러 가기</Text>
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
    fontSize: 28,
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
    marginTop: 30,
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
  signupButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    ...theme.shadows.sm,
  },
  signupButtonText: {
    color: theme.colors.card,
    fontSize: 14,
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
  loginHighlight: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});
