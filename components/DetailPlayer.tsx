import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Image, Alert, Keyboard,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { Recording } from '../type';

const audioRecorderPlayer = new AudioRecorderPlayer();

type DetailPlayerProps = {
  recording: Recording;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
};

export default function DetailPlayer({
  recording,
  onRename,
  onDelete,
}: DetailPlayerProps) {
  const initialDurationMs = (Number(recording.duration) || 0) * 1000; // 초→밀리초
  const [isPlaying, setIsPlaying]       = useState(false);
  const [positionSec, setPositionSec]   = useState(0);
  const [durationSec, setDurationSec]   = useState(initialDurationMs);
  const [isEditing, setIsEditing]       = useState(false);
  const [tempTitle, setTempTitle]       = useState(recording.title);
  const isSeeking = useRef(false);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, []);

  const togglePlayback = async () => {
    if (isPlaying) {
      await audioRecorderPlayer.pausePlayer();
      setIsPlaying(false);
    } else {
      // 이미 재생 중 멈춘 상태라면 resume, 아니면 새로 start
      if (positionSec > 0 && positionSec < durationSec) {
        await audioRecorderPlayer.resumePlayer();
      } else {
        await audioRecorderPlayer.startPlayer(recording.path);
      }
      // 플레이백 리스너 (위치와 전체 길이 동시 갱신)
      audioRecorderPlayer.addPlayBackListener(e => {
        if (!isSeeking.current) {
          setPositionSec(e.currentPosition);
          setDurationSec(e.duration);
        }
        if (e.currentPosition >= e.duration) {
          audioRecorderPlayer.stopPlayer();
          audioRecorderPlayer.removePlayBackListener();
          setIsPlaying(false);
          setPositionSec(0);
        }
      });
      setIsPlaying(true);
    }
  };

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, '0');
    const sec = (totalSec % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const handleRename = () => {
    const trimmed = tempTitle.trim();
    if (trimmed && trimmed !== recording.title) {
      onRename(trimmed);
    }
    setIsEditing(false);
    Keyboard.dismiss();
  };

  const jumpSec = async (sec: number) => {
    isSeeking.current = true;
    const target = positionSec + sec * 1000;
    const clamped = Math.max(0, Math.min(durationSec, target));
    await audioRecorderPlayer.seekToPlayer(clamped);
    setPositionSec(clamped);
    // 짧게 플래그 유지 후 해제
    setTimeout(() => {
      isSeeking.current = false;
    }, 200);
  };

  const confirmDelete = () => {
    Alert.alert(
      '삭제 확인',
      '녹음을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: onDelete },
      ],
      { cancelable: true }
    );
  };

  const formatCreatedAt = (createdAt: string) => {
    const d = new Date(createdAt);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${d.getHours()}시 ${d.getMinutes()}분`;
  };

  return (
    <View style={styles.playerContainer}>
      <View style={styles.headerRow}>
        {isEditing ? (
          <TextInput
            value={tempTitle}
            style={styles.titleInput}
            onChangeText={setTempTitle}
            onBlur={handleRename}
            onSubmitEditing={handleRename}
            returnKeyType="done"
            blurOnSubmit
          />
        ) : (
          <TouchableOpacity
            onLongPress={() => setIsEditing(true)}
            style={{ flex: 1 }}>
            <Text style={styles.title}>{recording.title}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={confirmDelete}
          style={styles.deleteButton}>
          <Text style={styles.deleteText}>삭제</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.metaInfo}>
        {formatCreatedAt(recording.createdAt)}
      </Text>
      <Text style={styles.time}>
        {formatTime(positionSec)} / {formatTime(durationSec)}
      </Text>

      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={() => jumpSec(-15)}>
          <Image
            source={require('../assets/images/backward.png')}
            style={styles.controlIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlayback}>
          <Image
            source={
              isPlaying
                ? require('../assets/images/pause.png')
                : require('../assets/images/play.png')
            }
            style={styles.playIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => jumpSec(15)}>
          <Image
            source={require('../assets/images/forward.png')}
            style={styles.controlIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },
  titleInput: {
    fontSize: 17,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderColor: '#00bcd4',
    flex: 1,
    paddingVertical: 4,
  },
  deleteButton: {
    backgroundColor: '#ff5252',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 12,
  },
  deleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  metaInfo: {
    marginTop: 6,
    fontSize: 13,
    color: '#666',
    textAlign: 'left',
  },
  time: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 20,
  },
  controlIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    tintColor: '#444',
  },
  playIcon: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
});
