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

export default function DetailPlayer({ recording, onRename, onDelete }: DetailPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionSec, setPositionSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(recording.title);
  const isSeeking = useRef(false);

  useEffect(() => {
    // 녹음된 duration을 초기에 설정
    setDurationSec(Number(recording.duration)|| 0);
  }, [recording.duration]);

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
      await audioRecorderPlayer.startPlayer(recording.path);
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (!isSeeking.current && e.duration > 0) {
          setPositionSec(e.currentPosition);
          if (durationSec === 0 && e.duration > 0) {
            setDurationSec(e.duration);
        }
        }
        if (e.currentPosition >= e.duration) {
          setIsPlaying(false);
        }
      });
      setIsPlaying(true);
    }
  };

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const sec = (totalSec % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const handleRename = () => {
    const trimmed = tempTitle.trim();
    if (trimmed && trimmed !== recording.title) {
      onRename(trimmed);
    }
    setIsEditing(false);
    Keyboard.dismiss(); // 키보드 닫기
  };

  const seekTo = async (value: number) => {
    isSeeking.current = false;
    const pos = await audioRecorderPlayer.seekToPlayer(value);
    setPositionSec(Number(pos));
  };

  const jumpSec = async (sec: number) => {
    const target = positionSec + sec * 1000;
    const clamped = Math.max(0, Math.min(durationSec, target));
    const pos = await audioRecorderPlayer.seekToPlayer(clamped);
    setPositionSec(Number(pos));
  };

  const confirmDelete = () => {
    Alert.alert(
      '삭제 확인',
      '녹음을 삭제하시겠습니까?',
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '예',
          onPress: onDelete,
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const formatCreatedAt = (createdAt: string) => {
    const date = new Date(createdAt);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}시 ${date.getMinutes()}분 ${date.getSeconds()}초`;
  };

  return (
    <View style={styles.playerContainer}>
      <View style={styles.titleRow}>
        {isEditing ? (
          <TextInput
            value={tempTitle}
            style={styles.titleInput}
            onChangeText={setTempTitle}
            onBlur={handleRename}
            onSubmitEditing={handleRename}
            blurOnSubmit={true}
            returnKeyType="done"
            keyboardType="default"
          />
        ) : (
          <TouchableOpacity onLongPress={() => setIsEditing(true)} style={{ flex: 1 }}>
            <Text style={styles.title}>{recording.title}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={confirmDelete}>
          <Text style={styles.delete}>X</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.metaInfo}>{formatCreatedAt(recording.createdAt)}</Text>

      <Text style={styles.time}>
        {formatTime(positionSec)} / {formatTime(durationSec)}
      </Text>

      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={() => jumpSec(-15)}>
          <Image source={require('../assets/images/backward.png')} style={styles.controlIcon} />
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
          <Image source={require('../assets/images/forward.png')} style={styles.controlIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerContainer: {
    backgroundColor: '#f7f7f7',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderColor: '#007aff',
    flex: 1,
  },
  delete: {
    fontSize: 18,
    color: '#ff3b30',
  },
  metaInfo: {
    marginTop: 4,
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 16,
  },
  controlIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  playIcon: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  time: {
    textAlign: 'center',
    marginTop: 8,
    color: '#444',
  },
});
