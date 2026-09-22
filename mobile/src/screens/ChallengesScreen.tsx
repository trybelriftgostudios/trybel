import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../services/api';

interface ChallengesScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export const ChallengesScreen: React.FC<ChallengesScreenProps> = ({ onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'my_challenges'>('active');
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<any | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [resultData, setResultData] = useState<any | null>(null);

  useEffect(() => {
    loadChallenges();
  }, [activeTab]);

  const loadChallenges = async () => {
    try {
      const res = await api.getChallenges(activeTab === 'my_challenges');
      setChallenges(res.data || []);
    } catch (err: any) {
      console.warn('Error loading challenges:', err);
    }
  };

  const openPuzzle = (chal: any) => {
    setActiveChallenge(chal);
    setSelectedOption(null);
    setResultData(null);
  };

  const handleSubmitPuzzle = async () => {
    if (selectedOption === null || !activeChallenge) return;

    try {
      const res = await api.submitChallenge(activeChallenge.id, selectedOption, 35);
      setResultData(res);
      loadChallenges();
    } catch (err: any) {
      Alert.alert('Notice', err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Campus Challenges</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'active' && styles.activeTabBtn]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Active Puzzles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'my_challenges' && styles.activeTabBtn]}
          onPress={() => setActiveTab('my_challenges')}
        >
          <Text style={[styles.tabText, activeTab === 'my_challenges' && styles.activeTabText]}>My Completed</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {challenges.map(chal => (
          <View key={chal.id} style={styles.chalCard}>
            <View style={styles.chalTopRow}>
              <View style={styles.chalIconBox}>
                <Text style={styles.chalEmoji}>🧩</Text>
              </View>
              <View style={styles.chalTitleBox}>
                <Text style={styles.chalTitle}>{chal.title}</Text>
                <Text style={styles.chalDesc}>{chal.description}</Text>
              </View>
            </View>

            <View style={styles.chalFooter}>
              <Text style={styles.participantsText}>👥 {chal.participant_count} students participating</Text>
              {chal.is_completed ? (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>Score: {chal.my_score} pts</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.joinBtn} onPress={() => openPuzzle(chal)}>
                  <Text style={styles.joinBtnText}>Solve Today's Puzzle</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Interactive Puzzle Modal */}
      <Modal visible={!!activeChallenge} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalCategory}>
              {activeChallenge?.puzzle_data?.category || 'Daily Campus Quiz'}
            </Text>
            <Text style={styles.modalQuestion}>
              {activeChallenge?.puzzle_data?.question}
            </Text>

            {/* Options */}
            <View style={styles.optionsList}>
              {activeChallenge?.puzzle_data?.options?.map((opt: string, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.optionItem,
                    selectedOption === idx && styles.selectedOption
                  ]}
                  onPress={() => !resultData && setSelectedOption(idx)}
                  disabled={!!resultData}
                >
                  <Text style={[styles.optionText, selectedOption === idx && styles.selectedOptionText]}>
                    {String.fromCharCode(65 + idx)}. {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Result & Explanation */}
            {resultData && (
              <View style={styles.resultBox}>
                <Text style={styles.resultHeading}>
                  {resultData.result?.is_correct ? ' Correct! +100 Points' : ' Nice Effort! +25 Points'}
                </Text>
                <Text style={styles.explanationText}>{resultData.explanation}</Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setActiveChallenge(null)}
              >
                <Text style={styles.cancelBtnText}>{resultData ? 'Close' : 'Cancel'}</Text>
              </TouchableOpacity>

              {!resultData && (
                <TouchableOpacity
                  style={[styles.submitBtn, selectedOption === null && styles.disabledSubmitBtn]}
                  onPress={handleSubmitPuzzle}
                  disabled={selectedOption === null}
                >
                  <Text style={styles.submitBtnText}>Submit Answer</Text>
                </TouchableOpacity>
              )}
            </View>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
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
  list: {
    flex: 1,
    marginBottom: 70
  },
  chalCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  chalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  chalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6366F122',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  chalEmoji: {
    fontSize: 22
  },
  chalTitleBox: {
    flex: 1
  },
  chalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  chalDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  chalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12
  },
  participantsText: {
    fontSize: 12,
    color: colors.textMuted
  },
  joinBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  joinBtnText: {
    color: '#0A0E17',
    fontSize: 12,
    fontWeight: '700'
  },
  completedBadge: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  completedText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  modalCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
    textTransform: 'uppercase',
    marginBottom: 6
  },
  modalQuestion: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 16
  },
  optionsList: {
    gap: 8,
    marginBottom: 16
  },
  optionItem: {
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: '#064E3B22'
  },
  optionText: {
    fontSize: 13,
    color: colors.textSecondary
  },
  selectedOptionText: {
    color: colors.textPrimary,
    fontWeight: '700'
  },
  resultBox: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16
  },
  resultHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#34D399',
    marginBottom: 4
  },
  explanationText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600'
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10
  },
  disabledSubmitBtn: {
    backgroundColor: '#334155'
  },
  submitBtnText: {
    color: '#0A0E17',
    fontSize: 14,
    fontWeight: '700'
  }
});
