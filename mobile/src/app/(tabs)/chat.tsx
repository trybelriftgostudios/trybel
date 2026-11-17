import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useFeedback } from '../../context/FeedbackContext';

interface Thread {
  id: string;
  title: string;
  type: 'team' | 'study_group' | 'friend_dm' | 'club_announcement';
  lastMessage: string;
  time: string;
  unreadCount: number;
  avatar: string;
  scopeBadge: string;
}

export default function ChatScreen() {
  const { showFeedback } = useFeedback();
  const [activeFilter, setActiveFilter] = useState<'all' | 'friends' | 'groups'>('all');
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ id: string; sender: string; text: string; time: string; isMe: boolean }[]>([
    {
      id: 'm1',
      sender: 'Sana Khan',
      text: 'Working on the computer vision model pipeline for SIH now.',
      time: '10:08 AM',
      isMe: false
    },
    {
      id: 'm2',
      sender: 'Varun Dulam',
      text: 'Awesome, I updated the project prototype architecture on GitHub!',
      time: '10:14 AM',
      isMe: true
    }
  ]);

  const threads: Thread[] = [
    {
      id: 'th_1',
      title: 'Smart India Hackathon Squad',
      type: 'team',
      lastMessage: 'Varun: I updated the project prototype architecture on GitHub!',
      time: '10:14 AM',
      unreadCount: 2,
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120',
      scopeBadge: 'TEAM THREAD'
    },
    {
      id: 'th_2',
      title: 'Sana Khan',
      type: 'friend_dm',
      lastMessage: 'Sounds great! Let us meet at the library at 5 PM.',
      time: 'Yesterday',
      unreadCount: 0,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
      scopeBadge: 'FRIEND DM'
    },
    {
      id: 'th_3',
      title: 'DBMS Revision Cohort',
      type: 'study_group',
      lastMessage: 'Arjun: Shared the SQL indexing cheat sheet in notes.',
      time: '2 days ago',
      unreadCount: 0,
      avatar: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=120',
      scopeBadge: 'STUDY GROUP'
    },
    {
      id: 'th_4',
      title: 'GDSC Official Announcements',
      type: 'club_announcement',
      lastMessage: 'President: Workshop registration links are live.',
      time: '3 days ago',
      unreadCount: 0,
      avatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=120',
      scopeBadge: 'ADMIN ONLY'
    }
  ];

  const filteredThreads = threads.filter((t) => {
    if (activeFilter === 'friends') return t.type === 'friend_dm';
    if (activeFilter === 'groups') return t.type !== 'friend_dm';
    return true;
  });

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    // Content moderation preview check
    const toxicWords = ['kill', 'hate', 'bomb', 'attack'];
    const isToxic = toxicWords.some((w) => chatInput.toLowerCase().includes(w));

    if (isToxic) {
      showFeedback('Message flagged by campus automated moderation filter (quarantined).', 'warning');
      return;
    }

    const newMsg = {
      id: `m_${Date.now()}`,
      sender: 'Varun Dulam',
      text: chatInput.trim(),
      time: 'Just now',
      isMe: true
    };

    setMessages([...messages, newMsg]);
    setChatInput('');
    showFeedback('Message delivered', 'success');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Campus Messages</Text>
        <Text style={styles.headerSubtitle}>Scoped threads (Teams • Clubs • Study • DMs)</Text>

        {/* Filter Switcher */}
        <View style={styles.filterRow}>
          {(['all', 'friends', 'groups'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.filterTextActive
                ]}
              >
                {filter === 'all' ? 'All Threads' : filter === 'friends' ? 'Friends' : 'Groups & Teams'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Threads List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {filteredThreads.map((thread) => (
          <TouchableOpacity
            key={thread.id}
            style={styles.threadCard}
            onPress={() => setSelectedThread(thread)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: thread.avatar }} style={styles.threadAvatar} />
            <View style={styles.threadInfo}>
              <View style={styles.threadTitleRow}>
                <Text style={styles.threadTitle} numberOfLines={1}>
                  {thread.title}
                </Text>
                <Text style={styles.threadTime}>{thread.time}</Text>
              </View>

              <Text style={styles.lastMessage} numberOfLines={1}>
                {thread.lastMessage}
              </Text>

              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.scopeTag,
                    thread.type === 'team'
                      ? styles.tagTeam
                      : thread.type === 'friend_dm'
                      ? styles.tagFriend
                      : styles.tagStudy
                  ]}
                >
                  <Text style={styles.scopeTagText}>{thread.scopeBadge}</Text>
                </View>

                {thread.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCountText}>{thread.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Active Conversation Modal */}
      {selectedThread && (
        <Modal
          visible={!!selectedThread}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedThread(null)}
        >
          <View style={styles.chatModalContainer}>
            {/* Modal Header */}
            <View style={styles.chatModalHeader}>
              <TouchableOpacity
                onPress={() => setSelectedThread(null)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>←</Text>
              </TouchableOpacity>
              <Image source={{ uri: selectedThread.avatar }} style={styles.modalAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {selectedThread.title}
                </Text>
                <Text style={styles.modalSub}>{selectedThread.scopeBadge} • St. Peter's Network</Text>
              </View>
            </View>

            {/* Messages Area */}
            <ScrollView style={styles.messagesContainer} contentContainerStyle={{ padding: 16 }}>
              {messages.map((m) => (
                <View
                  key={m.id}
                  style={[
                    styles.messageBubbleWrapper,
                    m.isMe ? styles.bubbleWrapperMe : styles.bubbleWrapperOther
                  ]}
                >
                  {!m.isMe && <Text style={styles.senderLabel}>{m.sender}</Text>}
                  <View
                    style={[
                      styles.messageBubble,
                      m.isMe ? styles.bubbleMe : styles.bubbleOther
                    ]}
                  >
                    <Text style={[styles.messageText, m.isMe && styles.messageTextMe]}>
                      {m.text}
                    </Text>
                    <Text style={styles.messageTimestamp}>{m.time}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Input Bar */}
            <View style={styles.inputBar}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message (moderated)..."
                placeholderTextColor={colors.textMuted}
                value={chatInput}
                onChangeText={setChatInput}
              />
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={handleSendMessage}
              >
                <Text style={styles.sendIcon}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B'
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC'
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 10
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#131B2E',
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  filterText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600'
  },
  filterTextActive: {
    color: '#0A0E17',
    fontWeight: '700'
  },
  listContent: {
    padding: 18,
    paddingBottom: 80,
    gap: 12
  },
  threadCard: {
    flexDirection: 'row',
    backgroundColor: '#131B2E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center'
  },
  threadAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12
  },
  threadInfo: {
    flex: 1
  },
  threadTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  threadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
    marginRight: 8
  },
  threadTime: {
    fontSize: 11,
    color: '#64748B'
  },
  lastMessage: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6
  },
  scopeTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4
  },
  tagTeam: {
    backgroundColor: '#0C4A6E'
  },
  tagFriend: {
    backgroundColor: '#064E3B'
  },
  tagStudy: {
    backgroundColor: '#312E81'
  },
  scopeTagText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '700'
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  unreadCountText: {
    color: '#0A0E17',
    fontSize: 10,
    fontWeight: '800'
  },
  chatModalContainer: {
    flex: 1,
    backgroundColor: colors.bg
  },
  chatModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#111726'
  },
  closeBtn: {
    paddingRight: 14
  },
  closeBtnText: {
    fontSize: 22,
    color: '#F8FAFC',
    fontWeight: '700'
  },
  modalAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700'
  },
  modalSub: {
    color: '#94A3B8',
    fontSize: 11
  },
  messagesContainer: {
    flex: 1
  },
  messageBubbleWrapper: {
    marginBottom: 12,
    maxWidth: '80%'
  },
  bubbleWrapperMe: {
    alignSelf: 'flex-end'
  },
  bubbleWrapperOther: {
    alignSelf: 'flex-start'
  },
  senderLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3
  },
  messageBubble: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  bubbleMe: {
    backgroundColor: colors.primary
  },
  bubbleOther: {
    backgroundColor: '#1E293B'
  },
  messageText: {
    color: '#F8FAFC',
    fontSize: 14,
    lineHeight: 19
  },
  messageTextMe: {
    color: '#0A0E17',
    fontWeight: '600'
  },
  messageTimestamp: {
    fontSize: 9,
    color: '#64748B',
    alignSelf: 'flex-end',
    marginTop: 4
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#111726'
  },
  textInput: {
    flex: 1,
    backgroundColor: '#161F30',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 14,
    marginRight: 10
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendIcon: {
    fontSize: 16,
    color: '#0A0E17',
    fontWeight: '800'
  }
});
