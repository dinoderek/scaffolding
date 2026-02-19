import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SEEDED_LOCATIONS, SessionLocation, SessionRecorderState } from '@/components/session-recorder/types';

function formatCurrentDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function createInitialState(): SessionRecorderState {
  return {
    session: {
      dateTime: formatCurrentDateTime(new Date()),
      locationId: null,
      exercises: [],
    },
    locations: SEEDED_LOCATIONS,
    pendingLocationName: '',
    gymPickerVisible: false,
    gymModalMode: 'picker',
    editorReturnMode: 'picker',
    showArchivedInManager: false,
    editingLocationId: null,
    editingLocationName: '',
  };
}

function createLocationId(locationName: string): string {
  return `custom-${locationName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
}

export default function SessionRecorderScreen() {
  const [state, setState] = useState<SessionRecorderState>(createInitialState);

  const selectedGym = useMemo<SessionLocation | undefined>(
    () => state.locations.find((location) => location.id === state.session.locationId),
    [state.locations, state.session.locationId]
  );

  const activeGyms = useMemo(
    () => state.locations.filter((location) => !location.archived),
    [state.locations]
  );

  const managedGyms = useMemo(
    () =>
      state.showArchivedInManager
        ? state.locations
        : state.locations.filter((location) => !location.archived),
    [state.locations, state.showArchivedInManager]
  );

  const handleSessionDateTimeChange = (dateTime: string) => {
    setState((current) => ({
      ...current,
      session: { ...current.session, dateTime },
    }));
  };

  const openGymModal = () => {
    setState((current) => ({
      ...current,
      gymPickerVisible: true,
      gymModalMode: 'picker',
      editorReturnMode: 'picker',
      pendingLocationName: '',
      editingLocationId: null,
      editingLocationName: '',
      showArchivedInManager: false,
    }));
  };

  const dismissGymModal = () => {
    setState((current) => ({
      ...current,
      gymPickerVisible: false,
      gymModalMode: 'picker',
      editorReturnMode: 'picker',
      pendingLocationName: '',
      editingLocationId: null,
      editingLocationName: '',
      showArchivedInManager: false,
    }));
  };

  const selectGym = (locationId: string) => {
    setState((current) => ({
      ...current,
      session: { ...current.session, locationId },
      gymPickerVisible: false,
      gymModalMode: 'picker',
      editorReturnMode: 'picker',
      pendingLocationName: '',
      editingLocationId: null,
      editingLocationName: '',
    }));
  };

  const openManageGyms = () => {
    setState((current) => ({
      ...current,
      gymModalMode: 'manage',
      pendingLocationName: '',
      editingLocationId: null,
      editingLocationName: '',
    }));
  };

  const openAddGymEditor = () => {
    setState((current) => ({
      ...current,
      gymModalMode: 'editor',
      editorReturnMode: 'picker',
      pendingLocationName: '',
      editingLocationId: null,
      editingLocationName: '',
    }));
  };

  const openEditGymEditor = (location: SessionLocation) => {
    setState((current) => ({
      ...current,
      gymModalMode: 'editor',
      editorReturnMode: 'manage',
      editingLocationId: location.id,
      editingLocationName: location.name,
      pendingLocationName: '',
    }));
  };

  const returnFromEditor = () => {
    setState((current) => ({
      ...current,
      gymModalMode: current.editorReturnMode,
      pendingLocationName: '',
      editingLocationId: null,
      editingLocationName: '',
    }));
  };

  const handlePendingLocationNameChange = (pendingLocationName: string) => {
    setState((current) => ({
      ...current,
      pendingLocationName,
    }));
  };

  const handleEditingLocationNameChange = (editingLocationName: string) => {
    setState((current) => ({
      ...current,
      editingLocationName,
    }));
  };

  const saveGymFromEditor = () => {
    const draftName = (state.editingLocationId ? state.editingLocationName : state.pendingLocationName).trim();
    if (!draftName) {
      return;
    }

    if (state.editingLocationId) {
      setState((current) => ({
        ...current,
        locations: current.locations.map((location) =>
          location.id === current.editingLocationId ? { ...location, name: draftName } : location
        ),
        gymModalMode: 'manage',
        editingLocationId: null,
        editingLocationName: '',
      }));
      return;
    }

    const newLocation: SessionLocation = {
      id: createLocationId(draftName),
      name: draftName,
      archived: false,
    };

    setState((current) => ({
      ...current,
      locations: [...current.locations, newLocation],
      session: { ...current.session, locationId: newLocation.id },
      gymPickerVisible: false,
      gymModalMode: 'picker',
      editorReturnMode: 'picker',
      pendingLocationName: '',
    }));
  };

  const returnToPickerFromManage = () => {
    setState((current) => ({
      ...current,
      gymModalMode: 'picker',
      showArchivedInManager: false,
      editingLocationId: null,
      editingLocationName: '',
    }));
  };

  const toggleArchivedVisibility = () => {
    setState((current) => ({
      ...current,
      showArchivedInManager: !current.showArchivedInManager,
    }));
  };

  const toggleGymArchive = (locationId: string, archived: boolean) => {
    setState((current) => ({
      ...current,
      locations: current.locations.map((location) =>
        location.id === locationId ? { ...location, archived: !archived } : location
      ),
      session:
        current.session.locationId === locationId && !archived
          ? { ...current.session, locationId: null }
          : current.session,
    }));
  };

  const editorPrimaryLabel = state.editingLocationId ? 'Save' : 'Add';
  const editorTitle = state.editingLocationId ? 'Edit Gym' : 'Add Gym';
  const editorInputValue = state.editingLocationId ? state.editingLocationName : state.pendingLocationName;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Session Recorder</Text>

      <View style={styles.section}>
        <View style={styles.topRow}>
          <View style={styles.rowField}>
            <Text style={styles.label}>Date and Time</Text>
            <TextInput
              accessibilityLabel="Session date and time"
              placeholder="YYYY-MM-DD HH:mm"
              style={styles.input}
              value={state.session.dateTime}
              onChangeText={handleSessionDateTimeChange}
            />
          </View>

          <View style={styles.rowField}>
            <Text style={styles.label}>Gym</Text>
            <Pressable style={styles.gymButton} onPress={openGymModal}>
              <Text numberOfLines={1} style={styles.gymButtonText}>
                {selectedGym ? selectedGym.name : 'Choose gym'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercises</Text>
        <Text style={styles.placeholderText}>
          No exercises added yet. Add exercises in the next milestone task.
        </Text>
      </View>

      <Pressable style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Submit Session (coming soon)</Text>
      </Pressable>

      <Modal
        animationType="slide"
        transparent
        visible={state.gymPickerVisible}
        onRequestClose={dismissGymModal}>
        <View style={styles.modalContainer}>
          <Pressable
            accessibilityLabel="Dismiss gym modal overlay"
            style={styles.modalBackdrop}
            onPress={dismissGymModal}
          />

          <View style={styles.modalCard}>
            {state.gymModalMode === 'picker' ? (
              <>
                <Text style={styles.modalTitle}>Select Gym</Text>
                <ScrollView contentContainerStyle={styles.modalList}>
                  {activeGyms.map((location) => (
                    <Pressable
                      key={location.id}
                      accessibilityLabel={`Select gym ${location.name}`}
                      style={styles.pickerOption}
                      onPress={() => selectGym(location.id)}>
                      <Text style={styles.pickerOptionText}>{location.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <View style={styles.equalButtonRow}>
                  <Pressable style={styles.secondaryActionButton} onPress={openManageGyms}>
                    <Text style={styles.secondaryActionButtonText}>Manage</Text>
                  </Pressable>
                  <Pressable style={styles.secondaryActionButton} onPress={openAddGymEditor}>
                    <Text style={styles.secondaryActionButtonText}>Add new</Text>
                  </Pressable>
                </View>
              </>
            ) : null}

            {state.gymModalMode === 'manage' ? (
              <>
                <Text style={styles.modalTitle}>Manage Gyms</Text>

                <View style={styles.equalButtonRow}>
                  <Pressable style={styles.secondaryActionButton} onPress={returnToPickerFromManage}>
                    <Text style={styles.secondaryActionButtonText}>Back to picker</Text>
                  </Pressable>
                  <Pressable style={styles.secondaryActionButton} onPress={toggleArchivedVisibility}>
                    <Text style={styles.secondaryActionButtonText}>
                      {state.showArchivedInManager ? 'Hide archived' : 'Show archived'}
                    </Text>
                  </Pressable>
                </View>

                <ScrollView contentContainerStyle={styles.modalList}>
                  {managedGyms.map((location) => (
                    <View key={location.id} style={styles.manageRow}>
                      <Text numberOfLines={1} style={styles.manageRowTitle}>
                        {location.name}
                      </Text>
                      <Pressable
                        accessibilityLabel={`Edit gym ${location.name}`}
                        style={styles.inlineSecondaryButton}
                        onPress={() => openEditGymEditor(location)}>
                        <Text style={styles.inlineSecondaryButtonText}>Edit</Text>
                      </Pressable>
                      <Pressable
                        accessibilityLabel={`${location.archived ? 'Unarchive' : 'Archive'} gym ${location.name}`}
                        style={[
                          styles.inlineArchiveButton,
                          location.archived ? styles.unarchiveButton : styles.archiveDangerButton,
                        ]}
                        onPress={() => toggleGymArchive(location.id, location.archived)}>
                        <Text style={styles.inlineArchiveButtonText}>
                          {location.archived ? 'Unarchive' : 'Archive'}
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                  {managedGyms.length === 0 ? (
                    <Text style={styles.emptyText}>No gyms for the current filter.</Text>
                  ) : null}
                </ScrollView>
              </>
            ) : null}

            {state.gymModalMode === 'editor' ? (
              <>
                <Text style={styles.modalTitle}>{editorTitle}</Text>
                <TextInput
                  autoFocus
                  placeholder="Gym name"
                  style={styles.input}
                  value={editorInputValue}
                  onChangeText={state.editingLocationId ? handleEditingLocationNameChange : handlePendingLocationNameChange}
                />
                <View style={styles.equalButtonRow}>
                  <Pressable style={styles.secondaryActionButton} onPress={returnFromEditor}>
                    <Text style={styles.secondaryActionButtonText}>Back</Text>
                  </Pressable>
                  <Pressable style={styles.primaryActionButton} onPress={saveGymFromEditor}>
                    <Text style={styles.primaryActionButtonText}>{editorPrimaryLabel}</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  section: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    gap: 12,
    backgroundColor: '#fafafa',
  },
  topRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
  },
  rowField: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#c3c3c3',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  gymButton: {
    borderWidth: 1,
    borderColor: '#0f5cc0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  gymButtonText: {
    color: '#0f5cc0',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 14,
    color: '#555555',
  },
  submitButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#444444',
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  modalCard: {
    maxHeight: '90%',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  modalList: {
    gap: 8,
    paddingBottom: 4,
  },
  pickerOption: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  pickerOptionText: {
    fontSize: 14,
  },
  equalButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryActionButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6f6f6f',
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryActionButtonText: {
    color: '#444444',
    fontWeight: '600',
  },
  primaryActionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#0f5cc0',
  },
  primaryActionButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  manageRowTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  inlineSecondaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0f5cc0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  inlineSecondaryButtonText: {
    color: '#0f5cc0',
    fontWeight: '600',
  },
  inlineArchiveButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  archiveDangerButton: {
    backgroundColor: '#b3261e',
  },
  unarchiveButton: {
    backgroundColor: '#1f8740',
  },
  inlineArchiveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#555555',
  },
});
