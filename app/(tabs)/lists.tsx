import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Plus, ShoppingCart, Check, X, CreditCard as Edit3 } from 'lucide-react-native';
import { MaterialCard } from '@/components/MaterialCard';
import { MaterialButton } from '@/components/MaterialButton';

const mockLists = [
  {
    id: '1',
    name: 'Weekend Grocery Run',
    items: [
      { id: '1', name: 'Apples', completed: false },
      { id: '2', name: 'Cinnamon sticks', completed: true },
      { id: '3', name: 'Heavy cream', completed: false },
      { id: '4', name: 'Vanilla extract', completed: true },
    ],
    createdAt: '2 days ago',
  },
  {
    id: '2',
    name: 'Pancake Ingredients',
    items: [
      { id: '5', name: 'Flour', completed: true },
      { id: '6', name: 'Eggs', completed: true },
      { id: '7', name: 'Milk', completed: false },
      { id: '8', name: 'Baking powder', completed: false },
    ],
    createdAt: '1 week ago',
  },
];

export default function ListsScreen() {
  const { colors } = useTheme();
  const [lists, setLists] = useState(mockLists);
  const [newListName, setNewListName] = useState('');
  const [showNewList, setShowNewList] = useState(false);

  const toggleItem = (listId: string, itemId: string) => {
    setLists(lists.map(list => 
      list.id === listId 
        ? {
            ...list,
            items: list.items.map(item =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            )
          }
        : list
    ));
  };

  const createNewList = () => {
    if (newListName.trim()) {
      const newList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        items: [],
        createdAt: 'Just now',
      };
      setLists([newList, ...lists]);
      setNewListName('');
      setShowNewList(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.onSurface }]}>Lists</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Shopping lists and more
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {showNewList ? (
          <MaterialCard variant="outlined" style={styles.newListCard}>
            <View style={styles.newListContent}>
              <TextInput
                style={[
                  styles.newListInput, 
                  { 
                    color: colors.onSurface,
                    borderColor: colors.outline,
                    backgroundColor: colors.surfaceContainerLowest,
                  }
                ]}
                placeholder="List name..."
                placeholderTextColor={colors.onSurfaceVariant}
                value={newListName}
                onChangeText={setNewListName}
                autoFocus
              />
              <View style={styles.newListActions}>
                <MaterialButton
                  title="Cancel"
                  variant="text"
                  size="small"
                  onPress={() => setShowNewList(false)}
                  icon={<X size={16} color={colors.onSurfaceVariant} strokeWidth={2} />}
                />
                <MaterialButton
                  title="Create"
                  variant="filled"
                  size="small"
                  onPress={createNewList}
                  icon={<Check size={16} color={colors.onPrimary} strokeWidth={2} />}
                />
              </View>
            </View>
          </MaterialCard>
        ) : (
          <MaterialCard variant="outlined" style={styles.createCard}>
            <TouchableOpacity 
              style={styles.createCardContent}
              onPress={() => setShowNewList(true)}
            >
              <View style={[styles.createIcon, { backgroundColor: colors.primaryContainer }]}>
                <Plus size={24} color={colors.onPrimaryContainer} strokeWidth={2} />
              </View>
              <Text style={[styles.createText, { color: colors.onSurface }]}>
                Create New List
              </Text>
            </TouchableOpacity>
          </MaterialCard>
        )}

        {lists.length === 0 ? (
          <MaterialCard variant="filled" style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceContainerHighest }]}>
              <ShoppingCart size={48} color={colors.onSurfaceVariant} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No lists yet</Text>
            <Text style={[styles.emptyDescription, { color: colors.onSurfaceVariant }]}>
              Create your first shopping list to get organized
            </Text>
          </MaterialCard>
        ) : (
          <View style={styles.listsContainer}>
            {lists.map((list) => {
              const completedCount = list.items.filter(item => item.completed).length;
              const totalCount = list.items.length;
              
              return (
                <MaterialCard key={list.id} variant="elevated" style={styles.listCard}>
                  <View style={styles.listHeader}>
                    <View style={styles.listInfo}>
                      <Text style={[styles.listName, { color: colors.onSurface }]}>
                        {list.name}
                      </Text>
                      <Text style={[styles.listMeta, { color: colors.onSurfaceVariant }]}>
                        {completedCount}/{totalCount} completed • {list.createdAt}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.editButton, { backgroundColor: colors.surfaceContainerHighest }]}
                    >
                      <Edit3 size={16} color={colors.onSurfaceVariant} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>

                  {list.items.length > 0 && (
                    <View style={styles.itemsContainer}>
                      {list.items.slice(0, 3).map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.listItem}
                          onPress={() => toggleItem(list.id, item.id)}
                        >
                          <View style={[
                            styles.checkbox,
                            { 
                              backgroundColor: item.completed ? colors.primary : 'transparent',
                              borderColor: item.completed ? colors.primary : colors.outline 
                            }
                          ]}>
                            {item.completed && (
                              <Check size={12} color={colors.onPrimary} strokeWidth={2} />
                            )}
                          </View>
                          <Text style={[
                            styles.itemText,
                            { 
                              color: item.completed ? colors.onSurfaceVariant : colors.onSurface,
                              textDecorationLine: item.completed ? 'line-through' : 'none'
                            }
                          ]}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      
                      {list.items.length > 3 && (
                        <Text style={[styles.moreItems, { color: colors.onSurfaceVariant }]}>
                          +{list.items.length - 3} more items
                        </Text>
                      )}
                    </View>
                  )}
                </MaterialCard>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  createCard: {
    marginBottom: 24,
  },
  createCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  createIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  createText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  newListCard: {
    marginBottom: 24,
  },
  newListContent: {
    padding: 20,
  },
  newListInput: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  newListActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    marginTop: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  listsContainer: {
    gap: 16,
  },
  listCard: {
    padding: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  listMeta: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  moreItems: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontStyle: 'italic',
    paddingLeft: 32,
  },
});