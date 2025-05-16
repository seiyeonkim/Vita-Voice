import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList
} from 'react-native';

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

const FAQScreen = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const data: FAQItem[] = [
    {
      id: '1',
      question: '이 앱은 어떤 기능을 제공하나요?',
      answer: '이 앱은 음성을 분석하여 파킨슨병 및 성대질환 여부를 도와주는 앱입니다.',
    },
    {
      id: '2',
      question: '녹음은 어떻게 하나요?',
      answer: '홈 화면의 + 버튼을 눌러 녹음을 시작할 수 있습니다.',
    },
    {
      id: '3',
      question: '진단 결과는 어디서 확인하나요?',
      answer: '진단 완료 후 결과 화면에서 확인할 수 있고, 진단 기록 탭에서도 볼 수 있습니다.',
    },
  ];

  const toggleItem = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  const renderItem = ({ item }: { item: FAQItem }) => {
    const isOpen = openId === item.id;

    return (
      <TouchableOpacity onPress={() => toggleItem(item.id)} style={styles.card}>
        <Text style={styles.question}>{item.question}</Text>
        {isOpen && <Text style={styles.answer}>{item.answer}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  answer: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default FAQScreen;
