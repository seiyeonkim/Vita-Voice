import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';

interface FabMenuProps {
  onRecordPress?: () => void;
  onUploadPress?: () => void;
}

const FabMenu: React.FC<FabMenuProps> = ({ onRecordPress, onUploadPress }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      {isOpen && (
        <>
          <View style={styles.menuItem}>
            <Text style={styles.menuLabel}>녹음</Text>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                setIsOpen(false);
                onRecordPress?.();
              }}
            >
              <Image
                source={require('../assets/images/record.png')}
                style={styles.menuIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuLabel}>파일 업로드</Text>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                setIsOpen(false);
                onUploadPress?.();
              }}
            >
              <Image
                source={require('../assets/images/upload.png')}
                style={styles.menuIcon}
              />
            </TouchableOpacity>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setIsOpen(prev => !prev)}>
        <Image
          source={require('../assets/images/plus.png')}
          style={styles.plusIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    alignItems: 'flex-end',
    zIndex: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 12,
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  menuIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  plusIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
    resizeMode: 'contain',
  },
});

export default FabMenu;
