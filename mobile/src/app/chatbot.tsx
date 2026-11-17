import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useFeedback } from '../context/FeedbackContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sourceCitation?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'assistant',
    text: "Hello Varun! I am Trybel AI, your St. Peter's Campus Assistant. I can answer questions regarding syllabus, exam schedules, lab facilities, and campus regulations with verified citations.",
    timestamp: 'Just now',
    sourceCitation: 'St. Peter’s College Knowledge Base'
  }
];

const SUGGESTIONS = [
  'Semester Exam Schedule',
  'Library Opening Hours',
  'Hostel Curfew & Gate Pass',
  'Hackathon Lab Access',
  'Grading System & GPA'
];

const KNOWLEDGE_RESPONSES: Record<string, { answer: string; source: string }> = {
  'semester exam schedule': {
    answer: 'The End-Semester Examinations for Odd Semester 2025-26 begin on December 8, 2026. Hall tickets will be released on the college ERP portal 7 days prior.',
    source: 'Academic Calendar 2025-2026 (Sec. 4.2)'
  },
  'library opening hours': {
    answer: 'The Central Library is open Monday to Friday from 8:00 AM to 8:00 PM, and Saturdays from 9:00 AM to 5:00 PM. Digital library terminals are available 24/7 during exam weeks.',
    source: 'Central Library Regulations Bulletin'
  },
  'hostel curfew & gate pass': {
    answer: 'Hostel in-time is strictly 8:30 PM. Out-station gate passes must be requested 24 hours in advance through the Trybel app and approved by the Chief Warden.',
    source: 'Student Code of Conduct & Hostel Manual'
  },
  'hackathon lab access': {
    answer: 'Teams registered for national hackathons (such as SIH 2025) can obtain 24-hour Innovation Lab access by submitting faculty mentor endorsement via HOD office.',
    source: 'Innovation & Incubation Cell Guidelines'
  },
  'grading system & gpa': {
    answer: 'Grading follows the 10-point scale: O (10, 90-100%), A+ (9, 80-89%), A (8, 70-79%), B+ (7, 60-69%), B (6, 55-59%), C (5, 50-54%), and F (<50%). Minimum passing CGPA is 5.0.',
    source: 'Autonomous Curriculum Regulation Book (R22)'
  }
};

export default function ChatbotModal() {
  const router = useRouter();
  const { showFeedback } = useFeedback();

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulated RAG lookup
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      let matchedKey = Object.keys(KNOWLEDGE_RESPONSES).find(key =>
        lowerQuery.includes(key) || key.split(' ').some(word => lowerQuery.includes(word) && word.length > 4)
      );

      let replyText = "I couldn't find a direct college regulation for that query. Please consult your Department HOD office or Academic Dean.";
      let source = "General Campus Inquiry";

      if (matchedKey && KNOWLEDGE_RESPONSES[matchedKey]) {
        replyText = KNOWLEDGE_RESPONSES[matchedKey].answer;
        source = KNOWLEDGE_RESPONSES[matchedKey].source;
      } else if (lowerQuery.includes('exam') || lowerQuery.includes('schedule')) {
        replyText = KNOWLEDGE_RESPONSES['semester exam schedule'].answer;
        source = KNOWLEDGE_RESPONSES['semester exam schedule'].source;
      } else if (lowerQuery.includes('library') || lowerQuery.includes('book')) {
        replyText = KNOWLEDGE_RESPONSES['library opening hours'].answer;
        source = KNOWLEDGE_RESPONSES['library opening hours'].source;
      } else if (lowerQuery.includes('hostel') || lowerQuery.includes('curfew')) {
        replyText = KNOWLEDGE_RESPONSES['hostel curfew & gate pass'].answer;
        source = KNOWLEDGE_RESPONSES['hostel curfew & gate pass'].source;
      }

      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourceCitation: source
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 700);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Trybel Campus AI</Text>
            <View style={styles.onlineBadge}>
              <Text style={styles.onlineDot}>●</Text>
              <Text style={styles.onlineText}>Verified RAG</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>St. Peter's College Knowledge Base</Text>
        </View>
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => {
            setMessages(INITIAL_MESSAGES);
            showFeedback('Conversation reset', 'info');
          }}
        >
          <Text style={styles.clearBtnText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Suggestion Chips */}
      <View style={styles.suggestionsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
          {SUGGESTIONS.map((sug, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.sugChip}
              onPress={() => handleSendMessage(sug)}
            >
              <Text style={styles.sugText}>✨ {sug}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages Scroll */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContainer}
      >
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAssistant]}
            >
              <View
                style={[
                  styles.msgBubble,
                  isUser ? styles.msgBubbleUser : styles.msgBubbleAssistant
                ]}
              >
                <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAssistant]}>
                  {msg.text}
                </Text>

                {msg.sourceCitation && (
                  <View style={styles.sourceCitationBadge}>
                    <Text style={styles.sourceCitationLabel}>Verified Source:</Text>
                    <Text style={styles.sourceCitationValue}>{msg.sourceCitation}</Text>
                  </View>
                )}

                <Text style={[styles.timeText, isUser ? styles.timeUser : styles.timeAssistant]}>
                  {msg.timestamp}
                </Text>
              </View>
            </View>
          );
        })}

        {isTyping && (
          <View style={[styles.msgRow, styles.msgRowAssistant]}>
            <View style={[styles.msgBubble, styles.msgBubbleAssistant, styles.typingBubble]}>
              <Text style={styles.typingText}>Trybel AI is searching campus records...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask anything about St. Peter's..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSendMessage()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            disabled={!inputText.trim()}
            onPress={() => handleSendMessage()}
          >
            <Text style={styles.sendBtnIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backBtnText: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700'
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.badgeGreen,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4
  },
  onlineDot: {
    color: colors.badgeGreenText,
    fontSize: 8
  },
  onlineText: {
    color: colors.badgeGreenText,
    fontSize: 10,
    fontWeight: '800'
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textSecondary
  },
  clearBtn: {
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  clearBtnText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  suggestionsBar: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: '#070C16'
  },
  suggestionsScroll: {
    paddingHorizontal: 16,
    gap: 8
  },
  sugChip: {
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  sugText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600'
  },
  messagesContainer: {
    padding: 16,
    gap: 12,
    paddingBottom: 20
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 4
  },
  msgRowUser: {
    justifyContent: 'flex-end'
  },
  msgRowAssistant: {
    justifyContent: 'flex-start'
  },
  msgBubble: {
    maxWidth: '82%',
    borderRadius: 16,
    padding: 12,
    gap: 6
  },
  msgBubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4
  },
  msgBubbleAssistant: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderBottomLeftRadius: 4
  },
  typingBubble: {
    paddingVertical: 8
  },
  typingText: {
    fontSize: 12,
    color: colors.accentBlue,
    fontStyle: 'italic'
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20
  },
  msgTextUser: {
    color: colors.bg,
    fontWeight: '700'
  },
  msgTextAssistant: {
    color: colors.textPrimary
  },
  sourceCitationBadge: {
    backgroundColor: '#0F1E36',
    borderWidth: 1,
    borderColor: '#1D3B6C',
    borderRadius: 8,
    padding: 8,
    marginTop: 4
  },
  sourceCitationLabel: {
    color: colors.accentBlue,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  sourceCitationValue: {
    color: '#BAE6FD',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2
  },
  timeText: {
    fontSize: 10,
    alignSelf: 'flex-end'
  },
  timeUser: {
    color: '#052E16'
  },
  timeAssistant: {
    color: colors.textMuted
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.card,
    gap: 8
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendBtnDisabled: {
    opacity: 0.4
  },
  sendBtnIcon: {
    color: colors.bg,
    fontSize: 20,
    fontWeight: '900'
  }
});