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
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useFeedback } from '../../context/FeedbackContext';
import { IOSSegmentedControl } from '../../components/IOSSegmentedControl';

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
      lastMessage: 'Varun Dulam: I updated the project prototype architecture on GitHub!',
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
      lastMessage: 'usr_arjun_92: Shared the SQL indexing cheat sheet in notes.',
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
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {/* iOS Large Title */}
        <View style={styles.largeTitleSection}>
          <Text style={styles.largeTitle}>Messages</Text>
        </View>

        {/* iOS Segmented Filter */}
        <View style={styles.segmentedWrapper}>
          <IOSSegmentedControl
            values={['all', 'friends', 'groups'] as const}
            selectedIndex={activeFilter === 'all' ? 0 : activeFilter === 'friends' ? 1 : 2}
            onChange={(filter) => setActiveFilter(filter)}
            formatLabel={(val) => (val === 'all' ? 'All' : val === 'friends' ? 'Direct Messages' : 'Groups')}
          />
        </View>

        {/* Grouped Threads List */}
        <View style={styles.groupedContainer}>
          {filteredThreads.map((thread, idx) => (
            <React.Fragment key={thread.id}>
              <TouchableOpacity
                style={styles.threadRow}
                onPress={() => setSelectedThread(thread)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: thread.avatar }} style={styles.threadAvatar} />
                <View style={styles.threadInfo}>
                  <View style={styles.threadTitleRow}>
                    <Text style={styles.threadTitle} numberOfLines={1}>
                      {thread.title}
                    </Text>
                    <Text style={styles.threadTime}>{thread.time}</Text>
                  </View>

                  <Text style={styles.lastMessage} numberOfLines={2}>
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
                <Ionicons name="chevron-forward" size={15} color={colors.textMuted} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
              {idx < filteredThreads.length - 1 && <View style={styles.rowSeparator} />}
            </React.Fragment>
          ))}
        </View>
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
                <Ionicons name="chevron-back" size={24} color={colors.primary} />
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
                    <Text style={[styles.messageTimestamp, m.isMe && styles.messageTimestampMe]}>{m.time}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Input Bar */}
            <View style={styles.inputBar}>
              <TextInput
                style={styles.textInput}
                placeholder="iMessage (moderated)..."
                placeholderTextColor={colors.textSecondary}
                value={chatInput}
                onChangeText={setChatInput}
              />
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={handleSendMessage}
              >
                <Ionicons name="arrow-up" size={17} color={colors.white} />
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
    backgroundColor: colors.bg,
    overflow: 'hidden'
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
    backgroundColor: colors.bg,
    alignItems: 'center',
    zIndex: 10,
    elevation: 4
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.4
  },
  scrollView: {
    flex: 1
  },
  largeTitleSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.37
  },
  segmentedWrapper: {
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 16
  },
  listContent: {
    paddingBottom: 110
  },
  groupedContainer: {
    marginHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    overflow: 'hidden'
  },
  threadRow: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'center'
  },
  threadAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.3
  },
  threadTime: {
    fontSize: 12,
    color: colors.textSecondary
  },
  lastMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18
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
    backgroundColor: colors.primaryMuted
  },
  tagFriend: {
    backgroundColor: colors.systemFill
  },
  tagStudy: {
    backgroundColor: 'rgba(94, 92, 230, 0.15)'
  },
  scopeTagText: {
    color: colors.primary,
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
    color: colors.white,
    fontSize: 11,
    fontWeight: '700'
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 76
  },
  chatModalContainer: {
    flex: 1,
    backgroundColor: colors.bg
  },
  chatModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
    backgroundColor: colors.card
  },
  closeBtn: {
    paddingRight: 8
  },
  modalAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3
  },
  modalSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1
  },
  messagesContainer: {
    flex: 1
  },
  messageBubbleWrapper: {
    marginBottom: 12,
    maxWidth: '78%'
  },
  bubbleWrapperMe: {
    alignSelf: 'flex-end'
  },
  bubbleWrapperOther: {
    alignSelf: 'flex-start'
  },
  senderLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 3,
    marginLeft: 4
  },
  messageBubble: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  bubbleMe: {
    backgroundColor: colors.primary
  },
  bubbleOther: {
    backgroundColor: colors.cardElevated
  },
  messageText: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20
  },
  messageTextMe: {
    color: colors.white
  },
  messageTimestamp: {
    fontSize: 10,
    color: colors.textSecondary,
    alignSelf: 'flex-end',
    marginTop: 4
  },
  messageTimestampMe: {
    color: 'rgba(255, 255, 255, 0.7)'
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
    backgroundColor: colors.card
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 15,
    marginRight: 8
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
