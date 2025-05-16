import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

interface Props {
  title: string;
  path: string;
  onClose: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
}

const audioRecorderPlayer = new AudioRecorderPlayer();

const RecordingPlayerBar: React.FC<Props> = ({ title, path, onClose, onDelete, onRename }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionSec, setPositionSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

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
      await audioRecorderPlayer.startPlayer(path);
      audioRecorderPlayer.addPlayBackListener(e => {
        setPositionSec(e.currentPosition);
        setDurationSec(e.duration);
        if (e.currentPosition >= e.duration) {
          setIsPlaying(false);
        }
        return;
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
    onRename(tempTitle.trim() === '' ? title : tempTitle);
    setIsEditing(false);
  };

  return (
    <View style={styles.bar}>
      <View style={styles.topRow}>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={tempTitle}
            onChangeText={setTempTitle}
            onSubmitEditing={handleRename}
            onBlur={handleRename}
            returnKeyType="done"
            autoFocus
          />
        ) : (
          <TouchableOpacity onLongPress={() => setIsEditing(true)}>
            <Text style={styles.title}>{title}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onDelete}>
          <Text style={styles.delete}>🗑</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.close}>✖</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.controls}>
        <Text>{formatTime(positionSec)}</Text>
        <TouchableOpacity onPress={togglePlayback}>
          <Text style={styles.play}>{isPlaying ? '⏸' : '▶️'}</Text>
        </TouchableOpacity>
        <Text>{formatTime(durationSec)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    elevation: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    flex: 1,
  },
  delete: {
    fontSize: 18,
    marginLeft: 16,
  },
  close: {
    fontSize: 18,
    marginLeft: 16,
  },
  controls: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  play: {
    fontSize: 24,
    marginHorizontal: 12,
  },
});

export default RecordingPlayerBar;
