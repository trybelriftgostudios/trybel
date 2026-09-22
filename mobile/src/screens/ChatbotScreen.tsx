import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../services/api';

interface ChatbotScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  source?: string;
  actionTitle?: string;
  actionScreen?: string;
}

export const ChatbotScreen: React.FC<ChatbotScreenProps> = ({ onBack, onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Hi! I’m your college assistant. Ask me anything about academics, events, clubs, or campus facilities.'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    'When is the next internal exam for CSE?',
    'Where is the CSE department?',
    'How to register for events?'
  ];

  const handleSend = async (question?: string) => {
    const query = question || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text: query.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!question) setInputText('');
    setLoading(true);

    try {
      const res = await api.askChatbot(query.trim());
      let actionTitle = undefined;
      let actionScreen = undefined;

      if (query.toLowerCase().includes('exam') || query.toLowerCase().includes('calendar')) {
        actionTitle = '📅 View Academic Calendar';
        actionScreen = 'Events';
      } else if (query.toLowerCase().includes('where') || query.toLowerCase().includes('department') || query.toLowerCase().includes('map')) {
        actionTitle = '🗺️ View Campus Map';
        actionScreen = 'Discover';
      }

      const botMsg: ChatMessage = {
        id: 'b_' + Date.now(),
        sender: 'bot',
        text: res.response,
        source: res.cited_source,
        actionTitle,
        actionScreen
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      Alert.alert('Chatbot error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.botAvatarCircle}>
          <Text style={styles.botEmoji}>🤖</Text>
        </View>
        <View style={styles.headerTextCol}>
          <View style={styles.nameRow}>
            <Text style={styles.botName}>St. Peter's AI</Text>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
          <Text style={styles.botSub}>Dedicated Verified Campus Assistant</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView style={styles.chatArea} contentContainerStyle={{ paddingVertical: 14 }}>
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.messageRow,
              msg.sender === 'user' ? styles.userRow : styles.botRow
            ]}
          >
            <View
              style={[
                styles.bubble,
                msg.sender === 'user' ? styles.userBubble : styles.botBubble
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.sender === 'user' ? styles.userText : styles.botText
                ]}
              >
                {msg.text}
              </Text>

              {/* Inline Source Citation per PRD 6.8 & Mockup */}
              {msg.source && (
                <View style={styles.citationBox}>
                  <Text style={styles.citationText}>Source: {msg.source}</Text>
                </View>
              )}

              {/* Action Button */}
              {msg.actionTitle && (
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => msg.actionScreen && onNavigate(msg.actionScreen)}
                >
                  <Text style={styles.actionCardText}>{msg.actionTitle}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Quick Suggestion Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        {quickQuestions.map((q, idx) => (
          <TouchableOpacity key={idx} style={styles.chip} onPress={() => handleSend(q)}>
            <Text style={styles.chipText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ask anything..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity
          style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={loading}
        >
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg
  },
  header: {
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
    marginRight: 8
  },
  backArrow: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700'
  },
  botAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#38BDF822',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  botEmoji: {
    fontSize: 22
  },
  headerTextCol: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  botName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginRight: 8
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
    marginRight: 4
  },
  onlineText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600'
  },
  botSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 16
  },
  messageRow: {
    marginBottom: 14,
    maxWidth: '85%'
  },
  userRow: {
    alignSelf: 'flex-end'
  },
  botRow: {
    alignSelf: 'flex-start'
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16
  },
  userBubble: {
    backgroundColor: '#1E293B',
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: '#334155'
  },
  botBubble: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderBottomLeftRadius: 4
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20
  },
  userText: {
    color: colors.textPrimary
  },
  botText: {
    color: '#E2E8F0'
  },
  citationBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  citationText: {
    fontSize: 11,
    color: '#38BDF8',
    fontStyle: 'italic'
  },
  actionCard: {
    marginTop: 10,
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#38BDF855'
  },
  actionCardText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700'
  },
  chipsRow: {
    maxHeight: 44,
    paddingHorizontal: 16,
    marginBottom: 8
  },
  chip: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    justifyContent: 'center'
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600'
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  input: {
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
  sendBtnDisabled: {
    opacity: 0.5
  },
  sendBtnText: {
    color: '#0A0E17',
    fontSize: 16,
    fontWeight: '900'
  }
});
