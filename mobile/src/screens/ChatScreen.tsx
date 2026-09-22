import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../services/api';

interface ChatScreenProps {
  onBack?: () => void;
  onNavigate: (screen: string) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'friends' | 'groups'>('all');
  const [search, setSearch] = useState('');
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsgText, setNewMsgText] = useState('');

  useEffect(() => {
    loadThreads();
  }, [activeTab]);

  const loadThreads = async () => {
    try {
      const res = await api.getChatThreads(activeTab);
      setThreads(res.data || []);
    } catch (err: any) {
      console.warn('Error loading threads:', err);
    }
  };

  const openThread = async (thread: any) => {
    setActiveThread(thread);
    try {
      const res = await api.getChatMessages(thread.id);
      setMessages(res.data || []);
    } catch (err: any) {
      Alert.alert('Restricted', err.message);
      setActiveThread(null);
    }
  };

  const handleSendMessage = async () => {
    if (!newMsgText.trim() || !activeThread) return;
    const textToSend = newMsgText.trim();
    setNewMsgText('');

    try {
      const res = await api.sendChatMessage(activeThread.id, textToSend);
      if (res.warning) {
        Alert.alert('Content Moderation Notice', res.warning);
      }
      // Refresh messages
      const msgRes = await api.getChatMessages(activeThread.id);
      setMessages(msgRes.data || []);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.topRow}>
        <Text style={styles.pageTitle}>Chat</Text>
        <TouchableOpacity style={styles.campusAiBadge} onPress={() => onNavigate('Chatbot')}>
          <Text style={styles.aiBadgeText}>🤖 Campus AI</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {(['all', 'friends', 'groups'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Conversation list */}
      <ScrollView style={styles.threadList} showsVerticalScrollIndicator={false}>
        {threads.map(thread => (
          <TouchableOpacity
            key={thread.id}
            style={styles.threadItem}
            onPress={() => openThread(thread)}
            activeOpacity={0.7}
          >
            <View style={styles.avatarBox}>
              <Text style={styles.threadEmoji}>
                {thread.type === 'direct_friend' ? '👤' : thread.type === 'team' ? '💻' : thread.type === 'club_announcements' ? '📢' : '👥'}
              </Text>
            </View>

            <View style={styles.threadInfo}>
              <View style={styles.threadTopLine}>
                <Text style={styles.threadTitle} numberOfLines={1}>{thread.title}</Text>
                <Text style={styles.threadTime}>{thread.last_message?.created_at || '10:24 AM'}</Text>
              </View>
              <Text style={styles.threadSnippet} numberOfLines={1}>
                {thread.last_message?.content || 'No messages yet'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Scoped Chat Thread Modal */}
      <Modal visible={!!activeThread} animationType="slide">
        <View style={styles.chatModalContainer}>
          {/* Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setActiveThread(null)} style={styles.backBtn}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatHeaderTitle}>{activeThread?.title}</Text>
              <Text style={styles.chatHeaderSubtitle}>
                {activeThread?.type === 'direct_friend' ? 'Friend DM' : `${activeThread?.member_count || 2} members • Scoped Thread`}
              </Text>
            </View>
            <TouchableOpacity onPress={() => onNavigate('Report')}>
              <Text style={styles.reportIcon}>🚩</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView style={styles.messageScroll} contentContainerStyle={{ paddingVertical: 12 }}>
            {messages.map(msg => (
              <View
                key={msg.id}
                style={[
                  styles.msgWrapper,
                  msg.is_mine ? styles.myMsgWrapper : styles.theirMsgWrapper
                ]}
              >
                {!msg.is_mine && <Text style={styles.msgSenderName}>{msg.sender_name}</Text>}
                <View style={[styles.bubble, msg.is_mine ? styles.myBubble : styles.theirBubble]}>
                  <Text style={[styles.msgText, msg.is_mine ? styles.myMsgText : styles.theirMsgText]}>
                    {msg.content}
                  </Text>
                </View>
                <Text style={styles.msgTime}>{msg.created_at}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Composer */}
          <View style={styles.composer}>
            <TextInput
              style={styles.composerInput}
              placeholder="Type a message..."
              placeholderTextColor={colors.textMuted}
              value={newMsgText}
              onChangeText={setNewMsgText}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
              <Text style={styles.sendBtnText}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    paddingTop: 48
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary
  },
  campusAiBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#8B5CF6',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14
  },
  aiBadgeText: {
    color: '#C084FC',
    fontSize: 12,
    fontWeight: '700'
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  activeTabBtn: {
    backgroundColor: '#1E293B'
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600'
  },
  activeTabText: {
    color: colors.textPrimary
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 14
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
    color: colors.textMuted
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13
  },
  threadList: {
    flex: 1,
    marginBottom: 70
  },
  threadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14
  },
  threadEmoji: {
    fontSize: 22
  },
  threadInfo: {
    flex: 1
  },
  threadTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  threadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1
  },
  threadTime: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 8
  },
  threadSnippet: {
    fontSize: 13,
    color: colors.textSecondary
  },
  chatModalContainer: {
    flex: 1,
    backgroundColor: colors.bg
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backBtn: {
    padding: 6,
    marginRight: 10
  },
  backArrow: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700'
  },
  chatHeaderInfo: {
    flex: 1
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  chatHeaderSubtitle: {
    fontSize: 11,
    color: colors.textMuted
  },
  reportIcon: {
    fontSize: 18,
    padding: 6
  },
  messageScroll: {
    flex: 1,
    paddingHorizontal: 16
  },
  msgWrapper: {
    marginBottom: 12,
    maxWidth: '80%'
  },
  myMsgWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end'
  },
  theirMsgWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start'
  },
  msgSenderName: {
    fontSize: 11,
    color: '#38BDF8',
    marginBottom: 3
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16
  },
  myBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4
  },
  theirBubble: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderBottomLeftRadius: 4
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20
  },
  myMsgText: {
    color: '#0A0E17',
    fontWeight: '600'
  },
  theirMsgText: {
    color: colors.textPrimary
  },
  msgTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  composerInput: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 44,
    color: colors.textPrimary,
    fontSize: 14
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10
  },
  sendBtnText: {
    color: '#0A0E17',
    fontSize: 16,
    fontWeight: '900'
  }
});
