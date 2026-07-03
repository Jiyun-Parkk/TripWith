import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useTripStore } from '../../store/useTripStore';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const activeTripId = useTripStore(state => state.activeTripId);
  const currentUser = useTripStore(state => state.currentUser);
  const trips = useTripStore(state => state.trips);
  const groupChats = useTripStore(state => state.groupChats);
  const sendChatMessage = useTripStore(state => state.sendChatMessage);
  const users = useTripStore(state => state.users);

  const [text, setText] = useState('');
  const flatListRef = useRef(null);

  const currentTrip = trips.find(t => t.id === activeTripId);
  const chats = groupChats[activeTripId] || [];
  const participantsCount = currentTrip ? currentTrip.participants.length : 0;

  const handleSend = () => {
    if (!text.trim()) return;
    sendChatMessage(activeTripId, text.trim());
    setText('');
  };

  // 메시지가 추가될 때마다 최하단으로 스크롤
  useEffect(() => {
    if (chats.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chats.length]);

  const renderChatItem = ({ item }) => {
    const isMe = item.sender === currentUser.uid;
    
    return (
      <View style={[styles.chatRow, isMe ? styles.chatRowRight : styles.chatRowLeft]}>
        {!isMe && (
          <Image source={{ uri: item.avatar }} style={styles.senderAvatar} />
        )}
        <View style={styles.bubbleContainer}>
          {!isMe && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
            <Text style={[styles.chatText, isMe ? styles.chatTextRight : styles.chatTextLeft]}>
              {item.text}
            </Text>
          </View>
          <Text style={[styles.chatTime, isMe ? styles.chatTimeRight : styles.chatTimeLeft]}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  if (!currentTrip) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Chat Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconCircle}>
              <Ionicons name="chatbubbles" size={16} color={theme.colors.card} />
            </View>
            <View>
              <Text style={styles.headerTitle} numberOfLines={1}>{currentTrip.title} 단톡방</Text>
              <Text style={styles.headerSubtitle}>참여자 {participantsCount}명 실시간 우정 대화</Text>
            </View>
          </View>
        </View>

        {/* Chat List */}
        <FlatList
          ref={flatListRef}
          data={chats}
          keyExtractor={item => item.id.toString()}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="친구들과 공유할 대화를 입력하세요..."
            value={text}
            onChangeText={setText}
            placeholderTextColor={theme.colors.textMuted}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Ionicons name="paper-plane" size={16} color={theme.colors.card} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9', // Slate-100 배경
  },
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
    maxWidth: 240,
  },
  headerSubtitle: {
    fontSize: 8,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  chatRow: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
    alignItems: 'flex-start',
  },
  chatRowLeft: {
    alignSelf: 'flex-start',
    gap: 8,
  },
  chatRowRight: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bubbleContainer: {
    gap: 2,
  },
  senderName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
    marginBottom: 2,
    marginLeft: 4,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...theme.shadows.sm,
  },
  bubbleLeft: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  bubbleRight: {
    backgroundColor: theme.colors.primary,
    borderTopRightRadius: 0,
  },
  chatText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  chatTextLeft: {
    color: theme.colors.text,
  },
  chatTextRight: {
    color: theme.colors.card,
  },
  chatTime: {
    fontSize: 8,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  chatTimeLeft: {
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
  chatTimeRight: {
    alignSelf: 'flex-end',
    marginRight: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    color: theme.colors.text,
  },
  sendBtn: {
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
