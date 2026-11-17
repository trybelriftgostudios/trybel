import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useFeedback } from '../context/FeedbackContext';
import { notificationsService } from '../services/notifications.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PuzzleQuestion {
  id: string;
  category: string;
  title: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

const DAILY_PUZZLES: PuzzleQuestion[] = [
  {
    id: 'p1',
    category: 'Computer Science • Algorithms',
    title: 'What is the worst-case time complexity of searching in a balanced Binary Search Tree (AVL Tree)?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correctIndex: 1,
    explanation: 'Because AVL trees maintain balance factor ∈ {-1, 0, 1}, height is bounded by 1.44 log2(N), guaranteeing O(log N) lookup.',
    points: 50
  },
  {
    id: 'p2',
    category: 'Full-Stack • Architecture',
    title: 'Why wrap native Android notification channel creation in a try/catch block inside Expo Go?',
    codeSnippet: 'try {\n  await Notifications.setNotificationChannelAsync(...);\n} catch (err) {\n  console.warn(err);\n}',
    options: [
      'To prevent memory leak',
      'Expo Go may restrict or throw on certain native notification channel calls',
      'Channels only work in iOS',
      'To bypass React Native bridge'
    ],
    correctIndex: 1,
    explanation: 'Expo Go is a sandboxed client and may throw unsupported native module errors when setting low-level Android notification channels.',
    points: 75
  },
  {
    id: 'p3',
    category: 'Database • PostgreSQL',
    title: 'What index type is best suited for geospatial nearest-neighbor queries in Postgres / PostGIS?',
    options: ['B-Tree', 'GiST (Generalized Search Tree)', 'Hash', 'BRIN'],
    correctIndex: 1,
    explanation: 'GiST (and SP-GiST) indexes efficiently support bounding-box and distance operators (<->) for coordinates and geometries.',
    points: 60
  }
];

interface LeaderboardUser {
  rank: number;
  name: string;
  college: string;
  streak: number;
  score: number;
}

const LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: 'Varun Dulam', college: "St. Peter's Engineering", streak: 12, score: 940 },
  { rank: 2, name: 'Sneha Patel', college: 'IIT Hyderabad', streak: 10, score: 880 },
  { rank: 3, name: 'Rohan Mehra', college: 'BITS Pilani', streak: 9, score: 810 },
  { rank: 4, name: 'Ananya Sharma', college: "St. Peter's Engineering", streak: 8, score: 760 },
  { rank: 5, name: 'Karthik Raja', college: 'NIT Warangal', streak: 7, score: 720 }
];

export default function ChallengesModal() {
  const router = useRouter();
  const { showFeedback } = useFeedback();

  const [activeTab, setActiveTab] = useState<'puzzle' | 'leaderboard'>('puzzle');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [userScore, setUserScore] = useState(120);
  const [streakCount] = useState(5);

  // PanResponder Card Swiper for smooth hardware-accelerated gesture
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 15,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false
      }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 100 && currentIdx > 0) {
          // Swipe right -> prev
          Animated.timing(pan, {
            toValue: { x: SCREEN_WIDTH, y: 0 },
            duration: 180,
            useNativeDriver: true
          }).start(() => {
            setCurrentIdx(prev => prev - 1);
            setSelectedOption(null);
            setAnswered(false);
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (gesture.dx < -100 && currentIdx < DAILY_PUZZLES.length - 1) {
          // Swipe left -> next
          Animated.timing(pan, {
            toValue: { x: -SCREEN_WIDTH, y: 0 },
            duration: 180,
            useNativeDriver: true
          }).start(() => {
            setCurrentIdx(prev => prev + 1);
            setSelectedOption(null);
            setAnswered(false);
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          // Snap back
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

  const currentPuzzle = DAILY_PUZZLES[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (answered) return;
    setSelectedOption(idx);
    setAnswered(true);

    if (idx === currentPuzzle.correctIndex) {
      setUserScore(prev => prev + currentPuzzle.points);
      showFeedback(`Correct! +${currentPuzzle.points} pts earned!`, 'success');
    } else {
      showFeedback('Incorrect. Check the explanation below.', 'warning');
    }
  };

  const handleNextPuzzle = () => {
    if (currentIdx < DAILY_PUZZLES.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      showFeedback('You finished all daily puzzles! Come back tomorrow.', 'info');
    }
  };

  const handleScheduleReminder = async () => {
    try {
      await notificationsService.scheduleDailyPuzzleReminder();
      showFeedback('Daily 9:00 AM puzzle reminder set successfully!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not schedule reminder';
      showFeedback(msg, 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Daily Campus Challenge</Text>
          <Text style={styles.headerSubtitle}>Earn points & compete on college leaderboards</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={handleScheduleReminder}>
          <Text style={styles.bellBtnIcon}>⏰</Text>
        </TouchableOpacity>
      </View>

      {/* Top Banner Stats */}
      <View style={styles.statsBanner}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>🔥 {streakCount} Days</Text>
          <Text style={styles.statSub}>Active Streak</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statVal}>⚡ {userScore} Pts</Text>
          <Text style={styles.statSub}>Today’s Score</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statVal}>🏆 #1 Campus</Text>
          <Text style={styles.statSub}>College Rank</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'puzzle' && styles.tabItemActive]}
          onPress={() => setActiveTab('puzzle')}
        >
          <Text style={[styles.tabText, activeTab === 'puzzle' && styles.tabTextActive]}>
            Daily Puzzle ({currentIdx + 1}/{DAILY_PUZZLES.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'leaderboard' && styles.tabItemActive]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
            Leaderboard
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'puzzle' ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Swipeable Animated Card Container */}
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.cardDeck,
              {
                transform: [{ translateX: pan.x }]
              }
            ]}
          >
            <View style={styles.puzzleCategoryRow}>
              <View style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{currentPuzzle.category}</Text>
              </View>
              <Text style={styles.pointsBadge}>+{currentPuzzle.points} pts</Text>
            </View>

            <Text style={styles.questionTitle}>{currentPuzzle.title}</Text>

            {currentPuzzle.codeSnippet && (
              <View style={styles.codeSnippetBlock}>
                <Text style={styles.codeText}>{currentPuzzle.codeSnippet}</Text>
              </View>
            )}

            {/* Options */}
            <View style={styles.optionsWrap}>
              {currentPuzzle.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentPuzzle.correctIndex;

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.optButton,
                      isSelected && styles.optButtonSelected,
                      answered && isCorrect && styles.optButtonCorrect,
                      answered && isSelected && !isCorrect && styles.optButtonWrong
                    ]}
                    disabled={answered}
                    onPress={() => handleSelectOption(idx)}
                  >
                    <View style={styles.optLetterBox}>
                      <Text style={styles.optLetter}>
                        {String.fromCharCode(65 + idx)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.optText,
                        answered && isCorrect && styles.optTextCorrect,
                        answered && isSelected && !isCorrect && styles.optTextWrong
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Explanation when answered */}
            {answered && (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationHeader}>💡 Explanation:</Text>
                <Text style={styles.explanationContent}>
                  {currentPuzzle.explanation}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Navigation Controls */}
          <View style={styles.puzzleControlsRow}>
            <TouchableOpacity
              style={[styles.navBtn, currentIdx === 0 && styles.navBtnDisabled]}
              disabled={currentIdx === 0}
              onPress={() => {
                if (currentIdx > 0) {
                  setCurrentIdx(prev => prev - 1);
                  setSelectedOption(null);
                  setAnswered(false);
                }
              }}
            >
              <Text style={styles.navBtnText}>← Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navBtnPrimary}
              onPress={handleNextPuzzle}
            >
              <Text style={styles.navBtnPrimaryText}>
                {currentIdx < DAILY_PUZZLES.length - 1 ? 'Next Question →' : 'Done ✓'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Schedule Daily Reminder Prompt */}
          <View style={styles.reminderCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.reminderTitle}>Never Miss a Daily Challenge</Text>
              <Text style={styles.reminderSub}>
                Get a local notification at 9:00 AM every morning.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.reminderBtn}
              onPress={handleScheduleReminder}
            >
              <Text style={styles.reminderBtnText}>Set Alarm</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.leaderboardCard}>
            <Text style={styles.leaderboardHeader}>Campus Hall of Fame</Text>
            <Text style={styles.leaderboardSub}>
              Top streak & puzzle solvers this semester
            </Text>

            <View style={styles.leaderboardList}>
              {LEADERBOARD.map(user => {
                const isMe = user.name === 'Varun Dulam';
                return (
                  <View
                    key={user.rank}
                    style={[styles.rankRow, isMe && styles.rankRowMe]}
                  >
                    <View style={styles.rankBadge}>
                      <Text
                        style={[
                          styles.rankNumber,
                          user.rank === 1 && styles.rankGold,
                          user.rank === 2 && styles.rankSilver,
                          user.rank === 3 && styles.rankBronze
                        ]}
                      >
                        {user.rank === 1
                          ? '🥇'
                          : user.rank === 2
                          ? '🥈'
                          : user.rank === 3
                          ? '🥉'
                          : `#${user.rank}`}
                      </Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.userName, isMe && styles.userNameMe]}>
                        {user.name} {isMe && '(You)'}
                      </Text>
                      <Text style={styles.userCollege}>{user.college}</Text>
                    </View>

                    <View style={styles.userScoreWrap}>
                      <Text style={styles.userScoreText}>{user.score} pts</Text>
                      <Text style={styles.userStreakText}>🔥 {user.streak}d</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  bellBtnIcon: {
    fontSize: 16
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  statBox: {
    flex: 1,
    alignItems: 'center'
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary
  },
  statSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.cardBorder,
    height: '80%',
    alignSelf: 'center'
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  tabItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  tabText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  tabTextActive: {
    color: colors.bg,
    fontWeight: '800'
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 40
  },
  cardDeck: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    gap: 14
  },
  puzzleCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  catBadge: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  catBadgeText: {
    color: colors.accentBlue,
    fontSize: 11,
    fontWeight: '700'
  },
  pointsBadge: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 22
  },
  codeSnippetBlock: {
    backgroundColor: '#070A11',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  codeText: {
    color: '#38BDF8',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18
  },
  optionsWrap: {
    gap: 10,
    marginTop: 4
  },
  optButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    padding: 12,
    gap: 12
  },
  optButtonSelected: {
    borderColor: colors.accentBlue,
    backgroundColor: '#0F2644'
  },
  optButtonCorrect: {
    borderColor: colors.primary,
    backgroundColor: '#07331A'
  },
  optButtonWrong: {
    borderColor: colors.danger,
    backgroundColor: '#380B0B'
  },
  optLetterBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center'
  },
  optLetter: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800'
  },
  optText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600'
  },
  optTextCorrect: {
    flex: 1,
    color: '#4ADE80',
    fontSize: 13,
    fontWeight: '700'
  },
  optTextWrong: {
    flex: 1,
    color: '#F87171',
    fontSize: 13,
    fontWeight: '700'
  },
  explanationBox: {
    backgroundColor: '#162238',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.accentBlue,
    marginTop: 6
  },
  explanationHeader: {
    color: colors.accentBlue,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4
  },
  explanationContent: {
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 18
  },
  puzzleControlsRow: {
    flexDirection: 'row',
    gap: 12
  },
  navBtn: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  navBtnDisabled: {
    opacity: 0.4
  },
  navBtnText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 13
  },
  navBtnPrimary: {
    flex: 1.5,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  navBtnPrimaryText: {
    color: colors.bg,
    fontWeight: '900',
    fontSize: 13
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 12
  },
  reminderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary
  },
  reminderSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  reminderBtn: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accentBlue
  },
  reminderBtnText: {
    color: colors.accentBlue,
    fontSize: 11,
    fontWeight: '800'
  },
  leaderboardCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  leaderboardHeader: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary
  },
  leaderboardSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
    marginTop: 2
  },
  leaderboardList: {
    gap: 10
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder
  },
  rankRowMe: {
    borderColor: colors.primary,
    backgroundColor: '#092915'
  },
  rankBadge: {
    width: 32,
    alignItems: 'center'
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary
  },
  rankGold: {
    fontSize: 18
  },
  rankSilver: {
    fontSize: 18
  },
  rankBronze: {
    fontSize: 18
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  userNameMe: {
    color: colors.primary
  },
  userCollege: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2
  },
  userScoreWrap: {
    alignItems: 'flex-end'
  },
  userScoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary
  },
  userStreakText: {
    fontSize: 11,
    color: '#F59E0B',
    marginTop: 2
  }
});