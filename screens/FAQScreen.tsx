// src/screens/FAQScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  LogBox,
} from 'react-native';

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

// 모든 경고 박스 숨기기
LogBox.ignoreAllLogs(true);

export default function FAQScreen() {
  const [openId, setOpenId] = useState<string | null>(null);

  // Android 레이아웃 애니메이션 활성화
  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }

  const data: FAQItem[] = [
    {
      id: '1',
      question: '이 앱은 어떤 기능을 제공하나요?',
      answer: '이 앱은 음성을 분석하여 파킨슨병 및 성대질환 여부를 도와주는 앱입니다.',
    },
    {
      id: '2',
      question: '진단은 어떻게 진행하나요?',
      answer:
        '10초간 "아" 소리를 낸 음성파일을 녹음하거나 음성 파일을 업로드 하면 파킨슨병과 성대질환의 여부를 파악할 수 있습니다.',
    },
    {
      id: '3',
      question: '진단 결과는 어디서 확인하나요?',
      answer:
        '진단 완료 후 결과 화면에서 확인할 수 있고, 진단 기록 탭에서도 확인 가능합니다.',
    },
  ];

  const toggleItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId(prev => (prev === id ? null : id));
  };

  const renderItem = ({ item }: { item: FAQItem }) => {
    const isOpen = openId === item.id;
    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => toggleItem(item.id)} style={styles.qBox}>
          <Text style={styles.question}>{item.question}</Text>
          <Text style={styles.arrow}>{isOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {isOpen && (
          <View style={styles.answerBox}>
            <Text style={styles.answer}>{item.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.headerBox}>
        <Text style={styles.headerText}>자주 묻는 질문</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
  },
  headerBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#444',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 20,      // 간격 늘림
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  qBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,    // 세로 패딩 늘림
    paddingHorizontal: 16,
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 8,
  },
  arrow: {
    fontSize: 16,
    fontWeight: '600',
    color: '#777',
  },
  answerBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answer: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});
